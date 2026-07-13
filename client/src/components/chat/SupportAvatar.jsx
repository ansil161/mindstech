import React from 'react';

const SupportAvatar = ({ size = 48, showOnlineBadge = true, className = '' }) => (
  <div
    className={`relative flex-shrink-0 overflow-visible rounded-full ${className}`}
    style={{ width: size, height: size }}
  >
    <img
      src="/mindstec-ai-logo.png"
      alt="Mindstec AI assistant"
      className="h-full w-full rounded-full border border-white/15 object-cover shadow-lg"
    />
    {showOnlineBadge && (
      <span
        className="absolute bottom-0 right-0 rounded-full border-2 border-[#0d0d0f] bg-emerald-500"
        style={{ width: Math.max(9, Math.floor(size * 0.24)), height: Math.max(9, Math.floor(size * 0.24)) }}
      />
    )}
  </div>
);

export default React.memo(SupportAvatar);
