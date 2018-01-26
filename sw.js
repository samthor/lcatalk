
// version bump Fri 12:25

const BYPASS = false;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.info('sw install');

  const p = async () => {
    const cache = await self.caches.open('lcatalk');

    // cache a known list of resources on install
    await cache.addAll([
      './',
      './elements.js',
      './hashchange.js',
      './icon-256.png',
      './main.css',
      './manifest.json',
    ]);
  };
  event.waitUntil(p());
});

self.addEventListener('fetch', (event) => {
  console.info('fetch for', event.request.url, self.location.origin);

  // special handler for /foo
  if (event.request.url === `${self.location.origin}/lcatalk/foo` ||
      event.request.url === `${self.location.origin}/foo`) {
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

self.addEventListener('message', (event) => {
  if (event.data !== 'notify') {
    throw new TypeError(`unknown message request: ${event.data}`);
  }

  self.registration.showNotification('So engaging', {
    body: '🤔💭',
    actions: [
     {action: 'like', title: 'Like 🎉'},
     {action: 'reply', title: 'Go Away 💩'},
    ],
  });
});

self.addEventListener('notificationclick', (event) => {  
  if (event.action === 'like') {
    self.registration.showNotification('So glad you liked it', {
      body: '.....',
    });
  }
  event.notification.close();
});

self.addEventListener('push', (event) => {
  // If you're trawling around, this needs proper signing to send something here.
  self.registration.showNotification('Got a push! 🎉🎉🎉');
});
