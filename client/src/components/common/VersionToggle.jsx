// Floating v1 / v2 switch. Both versions are in this same app, so switching
// just remembers the choice and reloads: no second URL.
import { getVersion, switchVersion } from '../../versionSwitch.js';

const CURRENT = 'v1';

export default function VersionToggle() {
  const current = getVersion();
  return (
    <div
      role="group"
      aria-label="Site version"
      className="fixed bottom-4 left-4 z-[9999] flex overflow-hidden rounded-full border border-black/10 bg-white text-xs font-semibold shadow-lg"
    >
      {['v1', 'v2'].map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={current === v}
          onClick={() => v !== CURRENT && switchVersion(v)}
          className={`cursor-pointer px-3 py-1.5 ${current === v ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
