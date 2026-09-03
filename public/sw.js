/*
 * MyStudioTV231 cleanup service worker.
 *
 * This project intentionally does not use a service worker. In an earlier
 * iteration, a PWA/Workbox worker was registered on this origin and can
 * persist in the browser after this project has dropped it, still
 * intercepting /api, /@vite/* and asset requests.
 *
 * Shipping this file at the registered scope forces the browser to replace
 * that stale worker with this one (a no-op), which then unregisters itself
 * and clears every cache under this origin so no future request is ever
 * intercepted.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (self.registration) {
          await self.registration.unregister()
        }
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
        const clients = await self.clients.matchAll({ type: 'window' })
        await Promise.all(
          clients.map((client) => client.navigate(client.url).catch(() => {})),
        )
      } catch {
        // Nothing else to do — a stale worker is best-effort removed.
      }
    })(),
  )
})