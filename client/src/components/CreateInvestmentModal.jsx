import React, { useState } from 'react';
import api from '../api/api';

// Predefined investment plans that users can choose from
const INVESTMENT_PLANS = [
  {
    name: 'Bronze',
    durationInDays: 30,
    dailyROIPercentage: 1.5,
    minAmount: 100,
    description: 'Short-term plan with steady returns'
  },
  {
    name: 'Silver',
    durationInDays: 90,
    dailyROIPercentage: 2.0,
    minAmount: 500,
    description: 'Mid-term plan with moderate growth'
  },
  {
    name: 'Gold',
    durationInDays: 180,
    dailyROIPercentage: 2.5,
    minAmount: 1000,
    description: 'Long-term plan with higher returns'
  },
  {
    name: 'Platinum',
    durationInDays: 365,
    dailyROIPercentage: 3.0,
    minAmount: 5000,
    description: 'Annual plan for maximum growth'
  }
];

export default function CreateInvestmentModal({ isOpen, onClose, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError('Please select an investment plan');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < selectedPlan.minAmount) {
      setError(`Minimum investment for ${selectedPlan.name} is $${selectedPlan.minAmount}`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/investments', {
        amount: numAmount,
        planName: selectedPlan.name,
        durationInDays: selectedPlan.durationInDays,
        dailyROIPercentage: selectedPlan.dailyROIPercentage
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#111118] border border-[#333] rounded-2xl max-w-2xl w-full mx-4 shadow-2xl">
        <div className="p-6 border-b border-[#333] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Investment</h2>
            <p className="text-sm text-[#9ca3af] mt-1">Choose a plan and set your investment amount</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#9ca3af] hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Plan Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Select a Plan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INVESTMENT_PLANS.map((plan) => (
                <div 
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan?.name === plan.name 
                      ? 'border-[#6d28d9] bg-[#1f1f30]' 
                      : 'border-[#333] bg-[#15151f] hover:border-[#444]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{plan.name}</span>
                    <span className="text-sm text-[#a855f7]">{plan.dailyROIPercentage}% daily</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mb-2">{plan.description}</p>
                  <div className="flex justify-between text-xs text-[#6b7280]">
                    <span>Duration: {plan.durationInDays} days</span>
                    <span>Min: ${plan.minAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">$</span>
              <input 
                type="number" 
                min={selectedPlan?.minAmount || 0}
                step="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={selectedPlan ? `Min $${selectedPlan.minAmount}` : 'Select a plan first'}
                className="w-full pl-10 pr-4 py-3 bg-[#15151f] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#6d28d9] transition"
              />
            </div>
            {selectedPlan && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="text-xs text-[#9ca3af] space-y-1">
                <p>Expected daily earnings: <span className="text-[#a855f7]">${(parseFloat(amount) * selectedPlan.dailyROIPercentage / 100).toFixed(2)}</span></p>
                <p>Expected total earnings: <span className="text-[#a855f7]">${(parseFloat(amount) * selectedPlan.dailyROIPercentage / 100 * selectedPlan.durationInDays).toFixed(2)}</span></p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#333] text-white hover:bg-[#15151f] transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
