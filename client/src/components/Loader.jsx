import React from 'react';

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-muted text-sm py-6 justify-center">
      <span className="h-3 w-3 rounded-full bg-accent animate-ping" />
      {label}
    </div>
  );
}
