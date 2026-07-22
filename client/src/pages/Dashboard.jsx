import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardCards from '../components/DashboardCards.jsx';
import { InvestmentTable, RoiHistoryTable, ReferralIncomeTable } from '../components/HistoryTables.jsx';
import ReferralTree from '../components/ReferralTree.jsx';
import EarningsChart from '../components/EarningsChart.jsx';
import Loader from '../components/Loader.jsx';
import CreateInvestmentModal from '../components/CreateInvestmentModal.jsx';

const TABS = [
  { key: 'investments', label: 'Investments' },
  { key: 'roi', label: 'ROI history' },
  { key: 'referrals', label: 'Referral income' },
  { key: 'tree', label: 'Referral tree' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [roiHistory, setRoiHistory] = useState([]);
  const [referralHistory, setReferralHistory] = useState([]);
  const [tree, setTree] = useState({ tree: [], totalDownlineCount: 0 });
  const [activeTab, setActiveTab] = useState('investments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, investmentsRes, roiRes, referralRes, treeRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/investments'),
        api.get('/dashboard/roi-history'),
        api.get('/dashboard/referral-income-history'),
        api.get('/referrals/tree'),
      ]);

      setSummary(summaryRes.data.data);
      setInvestments(investmentsRes.data.data.investments);
      setRoiHistory(roiRes.data.data.history);
      setReferralHistory(referralRes.data.data.history);
      setTree(treeRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#333]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs tracking-[0.3em] text-[#a855f7] font-mono">NEXACHAIN AI</span>
            <h1 className="text-xl font-semibold text-white">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:flex items-center gap-3">
              <div>
                <p className="text-xs text-[#9ca3af]">Your referral code</p>
                <p className="font-mono text-[#a855f7] text-sm">{user?.referralCode}</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(user?.referralCode || '');
                    alert('Referral code copied!');
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }}
                className="p-2 bg-[#15151f] border border-[#333] rounded-lg hover:border-[#6d28d9] transition text-white"
                title="Copy referral code"
              >
                📋
              </button>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white font-medium hover:opacity-90 transition"
            >
              + New Investment
            </button>
            <button
              onClick={logout}
              className="text-sm px-3 py-2 rounded-xl border border-[#333] text-white hover:bg-[#15151f] transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="text-sm text-red-300 bg-red-950/40 border border-red-900 rounded-xl px-4 py-3 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadAll} className="underline text-red-200">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <Loader label="Loading your portfolio…" />
        ) : (
          <>
            <DashboardCards summary={summary} />

            <EarningsChart roiHistory={roiHistory} referralHistory={referralHistory} />

            <div className="bg-[#111118] border border-[#333] rounded-2xl p-6">
              <div className="flex gap-2 border-b border-[#333] mb-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm border-b-2 transition ${
                      activeTab === tab.key
                        ? 'border-[#6d28d9] text-white'
                        : 'border-transparent text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'investments' && <InvestmentTable investments={investments} />}
              {activeTab === 'roi' && <RoiHistoryTable history={roiHistory} />}
              {activeTab === 'referrals' && <ReferralIncomeTable history={referralHistory} />}
              {activeTab === 'tree' && (
                <ReferralTree tree={tree.tree} totalDownlineCount={tree.totalDownlineCount} />
              )}
            </div>
          </>
        )}
      </main>

      <CreateInvestmentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={loadAll} 
      />
    </div>
  );
}
