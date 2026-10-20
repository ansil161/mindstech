import { getVersion } from './versionSwitch.js';

// Each version has its own entry (providers, i18n, global CSS). Only the chosen
// one is downloaded, and the URL never changes.
if (getVersion() === 'v2') {
  import('./v2/main.jsx');
} else {
  import('./entry-v1.jsx');
}
