import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export default function EarningsChart({ roiHistory = [], referralHistory = [] }) {
  const data = useMemo(() => {
    const byDate = new Map();

    roiHistory.forEach((h) => {
      const key = fmtDate(h.date);
      const entry = byDate.get(key) || { date: key, roi: 0, referral: 0 };
      entry.roi += h.amount;
      byDate.set(key, entry);
    });

    referralHistory.forEach((h) => {
      const key = fmtDate(h.date);
      const entry = byDate.get(key) || { date: key, roi: 0, referral: 0 };
      entry.referral += h.amount;
      byDate.set(key, entry);
    });

    return Array.from(byDate.values()).slice(-14);
  }, [roiHistory, referralHistory]);

  return (
    <div className="panel p-5">
      <h3 className="text-sm font-medium mb-4">Earnings, last 14 entries</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">Earnings will appear here once ROI starts crediting.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1FD1A1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1FD1A1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="referralGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2B33E" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#F2B33E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#223052" />
            <XAxis dataKey="date" stroke="#8592AD" fontSize={12} />
            <YAxis stroke="#8592AD" fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#16213A', border: '1px solid #223052', borderRadius: 8 }}
              labelStyle={{ color: '#E8ECF6' }}
            />
            <Area type="monotone" dataKey="roi" name="ROI" stroke="#1FD1A1" fill="url(#roiGradient)" />
            <Area
              type="monotone"
              dataKey="referral"
              name="Referral income"
              stroke="#F2B33E"
              fill="url(#referralGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
