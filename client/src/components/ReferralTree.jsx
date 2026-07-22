import React, { useState } from 'react';

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0
  );

function TreeNode({ node, depth }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative" style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div className="flex items-center gap-2 py-2">
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="h-5 w-5 flex items-center justify-center rounded bg-surface border border-border text-xs text-muted hover:text-accent2"
          >
            {open ? '−' : '+'}
          </button>
        ) : (
          <span className="h-5 w-5 flex items-center justify-center text-muted text-xs">•</span>
        )}
        <span className="text-sm">{node.fullName}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${
            node.accountStatus === 'Active'
              ? 'text-accent2 border-accent2/30 bg-accent2/10'
              : 'text-muted border-border'
          }`}
        >
          {node.accountStatus}
        </span>
        <span className="text-xs text-muted stat-figure ml-auto">
          ROI earned: {currency(node.totalROIEarned)}
        </span>
      </div>
      {hasChildren && open && (
        <div className="border-l border-border pl-2">
          {node.children.map((child) => (
            <TreeNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReferralTree({ tree = [], totalDownlineCount = 0 }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Referral tree</h3>
        <span className="text-xs text-muted">{totalDownlineCount} total in downline</span>
      </div>
      {tree.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">
          No referrals yet — share your referral code to start building your network.
        </p>
      ) : (
        tree.map((node) => <TreeNode key={node._id} node={node} depth={0} />)
      )}
    </div>
  );
}
