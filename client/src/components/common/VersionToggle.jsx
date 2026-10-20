// Floating v1 / v2 switch. v2 is a separate deployment, so "v2" is a plain
// link to VITE_V2_URL; "v1" is this app and is the active side.
const V2_URL = import.meta.env.VITE_V2_URL || 'http://localhost:5174';

export default function VersionToggle() {
  return (
    <div
      role="group"
      aria-label="Site version"
      className="fixed bottom-4 left-4 z-[9999] flex overflow-hidden rounded-full border border-black/10 bg-white text-xs font-semibold shadow-lg"
    >
      <span aria-current="true" className="bg-black px-3 py-1.5 text-white">
        v1
      </span>
      <a href={V2_URL} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100">
        v2
      </a>
    </div>
  );
}
