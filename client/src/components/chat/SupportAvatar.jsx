import React from 'react';

/**
 * Premium reusable SVG-based Support Agent Avatar.
 * Features:
 * - Configurable size
 * - Mindstec red headset details
 * - Optional animated pulsing online green badge
 */
const SupportAvatar = ({ size = 48, showOnlineBadge = true, className = "" }) => {
  return (
    <div 
      className={`relative rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#1A1A1E] to-[#121214] border border-white/10 shadow-lg ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Professional Customer Support Vector Agent */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 text-white/80"
      >
        {/* Head/Face outline */}
        <circle 
          cx="32" 
          cy="24" 
          r="10" 
          fill="currentColor" 
          fillOpacity="0.1" 
          stroke="currentColor" 
          strokeWidth="2.5" 
        />
        
        {/* Hair / Head shape */}
        <path 
          d="M22 24C22 17 26 15 32 15C38 15 42 17 42 24" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        
        {/* Headset headband in Mindstec Red */}
        <path 
          d="M20.5 25C20.5 16.5 24 13 32 13C40 13 43.5 16.5 43.5 25" 
          stroke="#E30613" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
        />
        
        {/* Headset earpiece */}
        <rect 
          x="17" 
          y="22" 
          width="4" 
          height="7" 
          rx="1.5" 
          fill="#E30613" 
        />
        
        {/* Headset microphone */}
        <path 
          d="M19 28C19 32.5 22.5 35 26.5 35" 
          stroke="#E30613" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <circle 
          cx="27.5" 
          cy="35" 
          r="1.5" 
          fill="#E30613" 
        />
        
        {/* Shoulders / Collar */}
        <path 
          d="M13 51C13 43 19 40 32 40C45 40 51 43 51 51" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
      </svg>
      
      {/* Online indicator badge */}
      {showOnlineBadge && (
        <span 
          className="absolute bottom-0 right-0 flex rounded-full border border-[#0d0d0f]"
          style={{ 
            width: Math.max(8, Math.floor(size * 0.22)), 
            height: Math.max(8, Math.floor(size * 0.22)) 
          }}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
};

export default React.memo(SupportAvatar);
