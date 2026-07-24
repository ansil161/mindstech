import React from 'react';

const SupportAvatar = ({ size = 48, showOnlineBadge = true, className = '' }) => (
  <div
    className={`relative flex-shrink-0 overflow-visible rounded-full ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="h-full w-full rounded-full bg-white border border-black/10 p-1 shadow-md text-[#0F0F12] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#0F0F12]"
        aria-hidden="true"
      >
        {/* Headband */}
        <path
          d="M 20 42 A 32 32 0 0 1 80 42"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Ear Pad */}
        <rect x="10" y="34" width="10" height="24" rx="5" fill="currentColor" />

        {/* Right Ear Pad */}
        <rect x="80" y="34" width="10" height="24" rx="5" fill="currentColor" />

        {/* Head contour */}
        <path
          d="M 23 38 C 23 21 77 21 77 38 V 52 C 77 71 23 71 23 52 Z"
          stroke="currentColor"
          strokeWidth="6"
          fill="#FFFFFF"
          strokeLinejoin="round"
        />

        {/* Hair boundary line */}
        <path
          d="M 23 38 H 77"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Eyes */}
        <circle cx="37" cy="51" r="4.5" fill="currentColor" />
        <circle cx="63" cy="51" r="4.5" fill="currentColor" />

        {/* Microphone Boom */}
        <path
          d="M 83 52 C 86 73 66 74 54 74"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Microphone Capsule */}
        <rect x="43" y="70" width="16" height="8" rx="4" fill="currentColor" />
        <ellipse cx="51" cy="74" rx="4.5" ry="2" fill="#FFFFFF" />

        {/* Shoulders */}
        <path
          d="M 24 95 C 24 84 76 84 76 95"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
    {showOnlineBadge && (
      <span
        className="absolute bottom-0 right-0 rounded-full border-2 border-[#0d0d0f] bg-emerald-500"
        style={{ width: Math.max(9, Math.floor(size * 0.24)), height: Math.max(9, Math.floor(size * 0.24)) }}
      />
    )}
  </div>
);

export default React.memo(SupportAvatar);
