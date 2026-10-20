// Which build of the site this browser sees. Both live in the same bundle and
// at the same URL; the choice is remembered here and applied on the next load.
// v1 stays the default so existing visitors see no change until they opt in.
const KEY = 'mindstec-version';

export const getVersion = () => {
  try {
    return localStorage.getItem(KEY) === 'v2' ? 'v2' : 'v1';
  } catch {
    return 'v1';
  }
};

export const switchVersion = (version) => {
  try {
    localStorage.setItem(KEY, version);
  } catch {
    // Storage blocked: the reload below simply lands on the default (v1).
  }
  // The two versions ship different global CSS, so a full reload is what keeps
  // one from leaking into the other.
  window.location.reload();
};
