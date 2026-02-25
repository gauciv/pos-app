import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Intercept email confirmation redirects before React renders.
// Supabase appends auth tokens as URL hash: #access_token=...&type=signup
// Redirect to /verify-email so the user sees a success page instead of auto-login.
const hash = window.location.hash;
if (
  hash &&
  (hash.includes('type=signup') || hash.includes('type=magiclink') || hash.includes('type=invite')) &&
  !window.location.pathname.includes('verify-email')
) {
  window.location.replace('/verify-email' + hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
