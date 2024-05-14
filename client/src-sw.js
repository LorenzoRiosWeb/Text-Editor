import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { warmStrategyCache } from 'workbox-recipes';

// Precache and route all assets defined in self.__WB_MANIFEST
precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(
  // Match navigation requests
  ({ request }) => request.mode === 'navigate',
  // Use the pageCache strategy for navigation requests
  ({ event }) => pageCache.handle({ event })
);

registerRoute(
  // Match requests for styles, scripts, and workers
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  // Use StaleWhileRevalidate strategy for caching assets
  new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
