import React from 'react';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(
    n || 0
  );

const Card = ({ label, value, accent, sub, icon }) => (
  <div className="bg-[#16213A] border border-[#223052] rounded-2xl p-6 flex flex-col gap-3 transition hover:border-[#3E6FF2]/40 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-widest text-[#8592AD] font-medium">{label}</span>
      {icon && <span className="text-2xl">{icon}</span>}
    </div>
    <span className="font-mono tabular-nums text-3xl font-semibold" style={{ color: accent }}>
      {value}
    </span>
    {sub && <span className="text-xs text-[#8592AD]">{sub}</span>}
  </div>
);

export default function DashboardCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Card
        label="Total Investments"
        value={currency(summary.totalInvestments)}
        accent="#3E6FF2"
        icon="📊"
        sub={`${summary.investmentCount} plans · ${summary.activeInvestments} active right now`}
      />
      <Card 
        label="Total ROI Earned" 
        value={currency(summary.totalROIEarned)} 
        accent="#1FD1A1" 
        icon="💰" 
      />
      <Card
        label="Total Level Income"
        value={currency(summary.totalLevelIncomeEarned)}
        accent="#F2B33E"
        icon="🤝"
      />
      <Card 
        label="Wallet Balance" 
        value={currency(summary.walletBalance)} 
        accent="#E8ECF6" 
        icon="💳" 
      />
    </div>
  );
}
