import React from 'react';

/**
 * The support assistant's avatar, used in the chat header, the empty-state
 * greeting, every assistant message bubble and the typing indicator.
 *
 * Two notes on the framing:
 *
 * The artwork is a self-contained rounded-square icon that carries its own red
 * background, so it does not sit on a white plate the way the previous inline
 * SVG headset glyph did — the plate would just be a white ring around a red
 * square. It fills the circle instead.
 *
 * `scale(1.35)` is not arbitrary. The source is 2160×2700 with transparent
 * margins on all four sides; object-cover alone crops it to a square but leaves
 * the icon occupying only ~76% of that square, so the circle would show
 * transparent corners. 1.35 pushes the red past the circle's edge — including
 * at the 45° diagonals, where the icon's own corner radius is the limiting
 * factor — while keeping the antenna and both eyes inside the visible area.
 */
const SupportAvatar = ({ size = 48, showOnlineBadge = true, className = '' }) => (
  <div
    className={`relative flex-shrink-0 rounded-full ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="h-full w-full overflow-hidden rounded-full bg-[#0d0d0f] ring-1 ring-white/10">
      {/* alt="" on purpose: every call site pairs this with visible text — the
          "Mindstec Support" heading, or the message it belongs to — so a name
          here is announced twice. */}
      <img
        src="/mindstec-ai-chatbot-logo.png"
        alt=""
        className="h-full w-full object-cover"
        style={{ transform: 'scale(1.35)' }}
        draggable="false"
      />
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
