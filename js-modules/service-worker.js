// the version number of a cache must be changed after associated resources has been updated
const INSTALL_CACHE = 'precache-v2';
const ACTIVATION_CACHE = 'activation-v1';
const RUNTIME_CACHE = 'runtime-v1';

// resources we always need
const INSTALL_CACHE_URLS = [
  // index.html changes constantly, and isn't always necessary as this website isn't an SPA.
  // We don't want to include it here.
  '/static/fonts/Kremlin.woff2',
  '/tex.css',
  '/static/img/by-nc-sa.png',
  '/static/img/app-icons/favicon-16x16.png',
  '/static/img/app-icons/apple-touch-icon.png',
  '/network-error.html',
];

// resources to precache on activation
const ACTIVATION_CACHE_URLS = [
  '/index.html',
  './',
  // last blog post
  '/posts/depolariser/01-gauche-droite.html',
  // assets for last blog post
  '/js-modules/political-plot.js',
  'https://d3js.org/d3.v7.min.js',
  '/static/data/political-plot-demo1.csv',
  '/static/img/axe-progressisme.svg',
  '/static/img/gif-posters/perceval-nord.png',
  '/static/data/echiquier-politique-2022-lemonde.csv',
  '/static/fonts/katex/KaTeX_Size1-Regular.woff2',
  '/static/fonts/katex/KaTeX_Size2-Regular.woff2',
  '/static/fonts/katex/KaTeX_Size4-Regular.woff2',
  '/static/fonts/katex/KaTeX_Math-Italic.woff2',
  '/static/fonts/katex/KaTeX_Main-Regular.woff2',
];

const EXTERNAL_CACHE_URLS = ['https://d3js.org/d3.v7.min.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // precache the resources we always need
      const cache = await caches.open(INSTALL_CACHE);
      await cache.addAll(INSTALL_CACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [INSTALL_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    (async () => {
      // clean up old caches
      const cacheNames = await caches.keys();
      const cachesToDelete = cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      await Promise.all(cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete)));
      self.clients.claim();
    })()
  );
  // cache usefull ressources
  caches.open(ACTIVATION_CACHE_URLS).then((cache) => cache.addAll(ACTIVATION_CACHE_URLS));
});

self.addEventListener('fetch', (event) => {
  const isExternalAndPrecached = EXTERNAL_CACHE_URLS.includes(event.request.url);

  // skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin) || isExternalAndPrecached) {
    event.respondWith(
      (async () => {
        let cacheFirst = false;

        const requestURL = new URL(event.request.url);
        const cachedResponse = await caches.match(event.request);

        const wasPrecachedOnInstall = INSTALL_CACHE_URLS.includes(requestURL.pathname);
        const wasPrecachedOnActivation = ACTIVATION_CACHE_URLS.includes(requestURL.pathname);
        const isStaticFile = /^\/static\//.test(requestURL.pathname);

        // use cache first for specific files
        if (isStaticFile || wasPrecachedOnInstall || wasPrecachedOnActivation || isExternalAndPrecached) {
          cacheFirst = true;
        }

        let networkResponse;

        // don't refetch cached static and external files
        if (!((isStaticFile || isExternalAndPrecached) && cachedResponse)) {
          networkResponse = fetch(event.request)
            // update cache from network (Stale-while-revalidate)
            .then(async (response) => {
              // don't cache error responses
              if (response.ok) {
                // put a copy of the response in the appropriate cache
                const cacheName = wasPrecachedOnInstall ? INSTALL_CACHE : wasPrecachedOnActivation ? ACTIVATION_CACHE : RUNTIME_CACHE;
                const cache = await caches.open(cacheName);
                await cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // fallback to cache if the request failed
              if (cachedResponse) {
                return cachedResponse;
              // if no cache is available for an html page, show a network error message instead
              } else if (/\.html$/.test(requestURL.pathname) || requestURL.pathname.endsWith('/')) {
                return caches.match('/network-error.html');
              }
              // fallback to a 404 error response to avoid unecessary logs
              return new Response(null, { status: 404 });
            });
        }

        // network first by default
        return cacheFirst && cachedResponse ? cachedResponse : networkResponse;
      })()
    );
  }
});
