import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import i18n, { loadLanguage } from './i18n' // Import to initialize i18next

const mount = () =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StrictMode>,
  )

// Non-English locales are separate chunks, so a returning visitor whose stored
// language is e.g. `ar` needs that chunk before the first render — otherwise the
// whole app paints in English and then snaps to Arabic.
//
// Blocking here is safe: #preloader in index.html is already covering the screen
// at this point, and for English (the common case) loadLanguage() resolves on a
// microtask without any fetch. `.finally` so a failed chunk still mounts the app
// on the English fallback rather than leaving a dead preloader.
loadLanguage(i18n.language).finally(mount)
