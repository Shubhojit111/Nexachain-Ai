# NexaChain AI — Investment & Referral Platform (MERN)

Backend architecture, business logic, and frontend dashboard for an investment
and referral-based platform, built with MongoDB, Express, React and Node.

## Project structure

```
nexachain-project/
├── server/                  # Express + Mongoose API
│   ├── config/db.js
│   ├── models/               User, Investment, ReferralIncome, RoiHistory
│   ├── middleware/           auth (JWT), errorHandler
│   ├── controllers/          auth, investment, dashboard, referral
│   ├── routes/
│   ├── services/             roiService.js, referralService.js  (Task 3 logic)
│   ├── jobs/roiCronJob.js     node-cron scheduler                (Task 5)
│   └── server.js
├── client/                  # React (Vite) dashboard
│   └── src/
│       ├── api/api.js
│       ├── context/AuthContext.jsx
│       ├── pages/             Login, Register, Dashboard
│       └── components/        Cards, Tables, ReferralTree, EarningsChart, CreateInvestmentModal
└── NexaChain-API.postman_collection.json
```

## 1. Project setup steps

### Prerequisites
- Node.js 18+
- MongoDB 6+ **running as a replica set** (see Assumptions — required for
  the transactional ROI/referral logic). The easiest local option is a
  single-node replica set:
  ```bash
  mongod --replSet rs0 --dbpath /path/to/data
  # then, once, in a mongo shell:
  mongosh --eval "rs.initiate()"
  ```

### Server
```bash
cd server
cp .env.example .env      # fill in MONGO_URI / JWT_SECRET, see below
npm install
npm run dev                # nodemon, http://localhost:5000
```

### Client
```bash
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## 2. Environment variables

### server/.env
| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` / `production` |
| `MONGO_URI` | MongoDB connection string (replica set required) |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `REFERRAL_LEVEL_PERCENTAGES` | Comma-separated % per level, e.g. `10,5,3,2,1` (level 1 = direct referrer) |
| `MAX_REFERRAL_LEVELS` | How many levels up the chain to pay out (default 5) |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS |

### client/.env
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

## 3. How to test the app

### Step 1: Test registration & login
1. Open the client app in your browser (usually at http://localhost:5173).
2. Register a new user with:
   - Full Name: Shubhojit Deb
   - Email: shubhojit123@gmail.com
   - Mobile: 9876543210
   - Password: shubh9876
3. After registration, you'll be auto-logged in to the dashboard. Copy your referral code (click the clipboard icon next to it!).

### Step 2: Test creating an investment
1. On the dashboard, click the "New Investment" button.
2. Pick a plan (e.g., Silver: 90 days, 2% daily ROI).
3. Enter an amount (minimum $100 for Bronze, $500 for Silver, etc.).
4. Submit the form. The new investment should appear in the "Investments" tab.

### Step 3: Test referral system (optional)
1. Open a private/incognito browser window (or use a different browser).
2. Register a second user, and use the first user's referral code in the "Referral Code" field.
3. Now, any ROI earned by the second user will generate referral income for the first user (once the daily cron job runs).

### Step 4: Test ROI cron job (on demand)
The cron job normally runs only at midnight. To test it immediately, create a temporary script in the `server/` folder:
```js
// server/test-cron.js
require('dotenv').config();
const mongoose = require('mongoose');
const { processDailyROI } = require('./services/roiService');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const summary = await processDailyROI();
  console.log('ROI job result:', summary);
  process.exit(0);
});
```
Then run it with:
```bash
cd server
node test-cron.js
```
Check the dashboard to see if ROI and referral income were added to the wallets!

## 4. API documentation

All endpoints are prefixed with `/api`. Private endpoints require
`Authorization: Bearer <token>`. Full request/response samples are in
[`NexaChain-API.postman_collection.json`](./NexaChain-API.postman_collection.json)
— import it into Postman and set the `token` collection variable after login.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a user; accepts optional `referralCode` |
| POST | `/auth/login` | Public | Returns user + JWT |
| GET | `/auth/me` | Private | Current authenticated user |
| POST | `/investments` | Private | Create an investment (`amount`, `planName`, `durationInDays`, `dailyROIPercentage`) |
| GET | `/investments` | Private | Paginated list of the user's own investments |
| GET | `/dashboard/summary` | Private | Total invested, ROI earned, level income earned, wallet balance |
| GET | `/dashboard/roi-history` | Private | Paginated daily ROI ledger |
| GET | `/dashboard/referral-income-history` | Private | Paginated level-income ledger |
| GET | `/referrals/direct` | Private | Level-1 referrals only |
| GET | `/referrals/tree` | Private | Full nested downline (via a single `$graphLookup` aggregation) |
| GET | `/health` | Public | Liveness check |

All error responses follow: `{ "success": false, "message": "..." }`.

## 5. Business logic (Task 3) — how it works

**Daily ROI** (`services/roiService.js`): for every `Active` investment,
computes `amount * dailyROIPercentage / 100`, credits it to the user's
wallet, appends a `RoiHistory` row, and marks the investment `Completed`
once its `endDate` has passed.

**Referral / level income** (`services/referralService.js`): on every ROI
credit, walks up the `referredBy` chain from the investing user, crediting
each ancestor `REFERRAL_LEVEL_PERCENTAGES[level]` percent of that ROI
amount, up to `MAX_REFERRAL_LEVELS` deep, and logs each payout to
`ReferralIncome`.

**Idempotency / no double-crediting** (Task 5's core requirement) is
enforced two ways:
1. Each `Investment` stores `lastROIProcessedDate`; the job skips any
   investment already processed for today's calendar date.
2. `RoiHistory` has a **unique compound index on `(investment, date)`**.
   Even if the cron fires twice (e.g. after an unexpected restart), the
   second insert attempt hits the unique constraint and is caught and
   skipped rather than crediting twice.

Each investment is processed inside its own MongoDB **transaction**
(`session.withTransaction`), so "write RoiHistory" + "update wallet" +
"distribute level income" either all succeed or all roll back together —
this is what "maintain transaction consistency" (Task 3) refers to.

## 6. Assumptions made during development

- **MongoDB replica set**: Mongoose transactions require a replica set
  (even a single-node one). This was chosen deliberately over
  non-transactional writes because the assessment explicitly calls out
  "maintain transaction consistency" as a requirement.
- **Investment plans**: The frontend includes predefined plans (Bronze, Silver, Gold, Platinum) with standard durations and daily ROI percentages. The API still accepts custom plan details if needed, but the UI simplifies creation with these tiers.
- **Referral levels/percentages** are configured via environment variables
  rather than hardcoded, so the business team can tune the compensation
  structure without a code change.
- **Currency**: amounts are treated as plain numbers (assumed USD, shown
  as $ in the UI) — no multi-currency handling.
- **Cron timing**: `node-cron`'s `'0 0 * * *'` runs at midnight in the
  server process's local timezone; deploy with `TZ` set explicitly if a
  specific timezone is required.
- **Withdrawals** are out of scope — the spec only asks for wallet
  balance tracking, not a withdrawal/payout workflow.
- **Password reset / email verification** are out of scope; only
  register/login/JWT were specified.

## 7. Deliverables checklist

- [x] Database Schema Files — `server/models/*.js`
- [x] API Source Code — `server/controllers`, `server/routes`
- [x] Business Logic Implementation — `server/services/*.js`
- [x] React Dashboard — `client/src`
- [x] Cron Job Implementation — `server/jobs/roiCronJob.js`
- [x] Postman Collection — `NexaChain-API.postman_collection.json`
- [x] This README
