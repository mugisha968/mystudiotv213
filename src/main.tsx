import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import './i18n'

import { AuthProvider } from '@/auth/AuthContext'
import { Spinner } from '@/components/ui/Spinner'
import App from './App.tsx'

const SW_CLEANUP_KEY = 'mystudio_sw_cleanup'

function cleanupServiceWorkers(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  if (sessionStorage.getItem(SW_CLEANUP_KEY)) return

  navigator.serviceWorker
    .getRegistrations()
    .then(async (registrations) => {
      if (registrations.length === 0) return
      await Promise.all(registrations.map((registration) => registration.unregister()))
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }
      sessionStorage.setItem(SW_CLEANUP_KEY, '1')
      window.location.reload()
    })
    .catch(() => {
      // Best-effort cleanup; some browsers/private mode disallow it.
    })
}

cleanupServiceWorkers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8 text-brand-700" />
        </div>
      }
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </StrictMode>,
)