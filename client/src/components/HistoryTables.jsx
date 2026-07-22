import React from 'react';

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    n || 0
  );
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-accent2/10 text-accent2 border-accent2/30',
    Completed: 'bg-accent/10 text-accent border-accent/30',
    Cancelled: 'bg-red-500/10 text-red-300 border-red-500/30',
    Credited: 'bg-accent2/10 text-accent2 border-accent2/30',
    Pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    Failed: 'bg-red-500/10 text-red-300 border-red-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || 'text-muted border-border'}`}>
      {status}
    </span>
  );
};

const EmptyRow = ({ colSpan, message }) => (
  <tr>
    <td colSpan={colSpan} className="text-center text-muted text-sm py-6">
      {message}
    </td>
  </tr>
);

export function InvestmentTable({ investments = [] }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="py-3 px-4 font-medium">Plan</th>
            <th className="py-3 px-4 font-medium">Amount</th>
            <th className="py-3 px-4 font-medium">Daily ROI</th>
            <th className="py-3 px-4 font-medium">Start</th>
            <th className="py-3 px-4 font-medium">End</th>
            <th className="py-3 px-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {investments.length === 0 && <EmptyRow colSpan={6} message="No investments yet." />}
          {investments.map((inv) => (
            <tr key={inv._id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]">
              <td className="py-3 px-4">{inv.plan?.name}</td>
              <td className="py-3 px-4 stat-figure">{currency(inv.amount)}</td>
              <td className="py-3 px-4 stat-figure">{inv.dailyROIPercentage}%</td>
              <td className="py-3 px-4 text-muted">{fmtDate(inv.startDate)}</td>
              <td className="py-3 px-4 text-muted">{fmtDate(inv.endDate)}</td>
              <td className="py-3 px-4">
                <StatusBadge status={inv.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RoiHistoryTable({ history = [] }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="py-3 px-4 font-medium">Date</th>
            <th className="py-3 px-4 font-medium">Plan</th>
            <th className="py-3 px-4 font-medium">ROI Amount</th>
            <th className="py-3 px-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && <EmptyRow colSpan={4} message="No ROI credited yet." />}
          {history.map((h) => (
            <tr key={h._id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]">
              <td className="py-3 px-4 text-muted">{fmtDate(h.date)}</td>
              <td className="py-3 px-4">{h.investment?.plan?.name || '—'}</td>
              <td className="py-3 px-4 stat-figure text-accent2">+{currency(h.amount)}</td>
              <td className="py-3 px-4">
                <StatusBadge status={h.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReferralIncomeTable({ history = [] }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="py-3 px-4 font-medium">Date</th>
            <th className="py-3 px-4 font-medium">From</th>
            <th className="py-3 px-4 font-medium">Level</th>
            <th className="py-3 px-4 font-medium">Income</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && <EmptyRow colSpan={4} message="No referral income yet." />}
          {history.map((h) => (
            <tr key={h._id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]">
              <td className="py-3 px-4 text-muted">{fmtDate(h.date)}</td>
              <td className="py-3 px-4">{h.sourceUser?.fullName || 'Unknown user'}</td>
              <td className="py-3 px-4">L{h.level}</td>
              <td className="py-3 px-4 stat-figure text-amber-300">+{currency(h.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
