// Service Worker to aggressively cache the lobby.json with a
// stale-while-revalidate strategy.

const LOBBY_URL = 'https://cubeia-code-tests.s3.eu-west-1.amazonaws.com/lobby.json';
const CACHE_NAME = 'lobby-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const resp = await fetch(LOBBY_URL, { cache: 'no-store' });
        if (resp && resp.ok) {
          await cache.put(LOBBY_URL, resp.clone());
        }
      } catch (e) {
        // Ignore failures during install; we'll try to populate cache on-the-fly later.
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const reqUrl = event.request.url;

  if (reqUrl === LOBBY_URL) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(LOBBY_URL);

      // Kick off a network request to update the cache in background
      const networkUpdate = fetch(LOBBY_URL)
        .then(async (resp) => {
          if (resp && resp.ok) {
            await cache.put(LOBBY_URL, resp.clone());
          }
          return resp;
        })
        .catch(() => undefined);

      if (cached) {
        // Serve cached immediately and update in background.
        event.waitUntil(networkUpdate);
        return cached;
      }

      // No cache available; wait for network (if fails, return 504)
      const net = await networkUpdate;
      if (net) return net;
      return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
    })());
    return;
  }

  // For other requests, do a normal network fetch (browser default)
});

// Note: This service worker implements an app-level stale-while-revalidate
// for the remote `lobby.json`. It acts like the response had
// Cache-Control: public, max-age=300, stale-while-revalidate=60 by serving
// cached content immediately and updating the cache in the background.
