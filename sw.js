
const BYPASS = false;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.info('sw install');

  const p = async () => {
    const cache = await self.caches.open('lcatalk');

    // cache a known list of resources on install
    await cache.addAll([
      '/',
      '/elements.js',
      '/hashchange.js',
      '/icon-256.png',
      '/main.css',
      '/manifest.json',
    ]);
  };
  event.waitUntil(p());
});

self.addEventListener('fetch', (event) => {
  console.info('fetch for', event.request.url, self.location.origin);

  if (event.request.url === `${self.location.origin}/bar`) {
    return event.respondWith(new Response('loaded bar'))
  }

  // special handler for /foo
  if (event.request.url === `${self.location.origin}/foo`) {
    const generateFakeData = async () => {

      // wait 2s to be infuriating
      await new Promise((resolve) => self.setTimeout(resolve, 2000));

      // return a response
      return new Response('fake response: ' + Math.random());
    };
    return event.respondWith(generateFakeData());
  }

  if (BYPASS) {
    return;
  }

  // otherwise, match cache
  const p = async () => {
    const cache = await self.caches.open('lcatalk');
    const response = await cache.match(event.request);
    if (response) {
      return response;
    }

    // fetch and cache (literally everything)
    const actualResponse = await self.fetch(event.request);
    if (actualResponse.ok) {
      await cache.put(event.request, actualResponse.clone());
    }
    return actualResponse;
  };
  event.respondWith(p());
});
