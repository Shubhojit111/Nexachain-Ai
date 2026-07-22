import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = { fullName: '', email: '', mobile: '', password: '', referralCode: '' };

export default function Register() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm panel p-8">
        <div className="mb-8">
          <span className="text-xs tracking-[0.3em] text-accent2 font-mono">NEXACHAIN AI</span>
          <h1 className="text-2xl font-semibold mt-2">Create your account</h1>
          <p className="text-muted text-sm mt-1">Start investing and earning referral income.</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Mobile number</label>
            <input
              required
              value={form.mobile}
              onChange={handleChange('mobile')}
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange('password')}
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Referral code (optional)</label>
            <input
              value={form.referralCode}
              onChange={handleChange('referralCode')}
              placeholder="NXC-XXXXXXXX"
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-blue-600 transition rounded-lg py-2 text-sm font-medium disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
