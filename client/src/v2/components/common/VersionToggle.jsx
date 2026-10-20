// Floating v1 / v2 switch. Both versions are in this same app, so switching
// just remembers the choice and reloads: no second URL.
//
// Colours are inline on purpose: the global `button { background: none;
// color: inherit }` in index.css is unlayered, so it beats Tailwind utilities
// and left these buttons without their own colours.
import { getVersion, switchVersion } from '../../../versionSwitch.js';

const CURRENT = 'v2';

const group = {
  position: 'fixed',
  bottom: 16,
  left: 16,
  zIndex: 9999,
  display: 'flex',
  overflow: 'hidden',
  borderRadius: 999,
  border: '1px solid rgba(0, 0, 0, 0.1)',
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
  fontSize: 12,
  fontWeight: 600,
};

const button = (active) => ({
  padding: '6px 14px',
  cursor: 'pointer',
  border: 0,
  background: active ? '#0c0c0c' : 'transparent',
  color: active ? '#ffffff' : '#4b5563',
});

export default function VersionToggle() {
  const current = getVersion();
  return (
    <div role="group" aria-label="Site version" style={group}>
      {['v1', 'v2'].map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={current === v}
          onClick={() => v !== CURRENT && switchVersion(v)}
          style={button(current === v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
