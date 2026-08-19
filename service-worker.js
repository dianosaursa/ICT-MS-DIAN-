const CACHE_NAME = 'pos-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/1.chunk.js',
  '/static/js/main.chunk.js'
];

// Install the Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch and cache resources
self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      return caches.match('/');
    })
  );
});


// Sync queued requests
self.addEventListener('sync', event => {
  console.log('Background sync', event);
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  const db = await openDB('pos-app-db', 1);
  const allRequests = await db.getAll('requests');
  
  for (const request of allRequests) {
    try {
      console.log('Syncing request', request);
      const fetchOptions = {
        method: request.method,
        headers: request.headers,
      };
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(request.body);
      }
      await fetch(request.url, fetchOptions);
      await db.delete('requests', request.id);
      console.log('Request synced and removed from IndexedDB', request);
    } catch (error) {
      console.error('Sync failed for request', request, error);
    }
  }
}

async function saveRequestToIndexedDB(request) {
  const db = await openDB('pos-app-db', 1);
  const savedRequest = {
    url: request.url,
    method: request.method,
    headers: {},
  };
  
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    savedRequest.body = await request.clone().text();
  }
  
  // Log headers
  for (const [key, value] of request.headers.entries()) {
    savedRequest.headers[key] = value;
  }

  console.log('Request details:', savedRequest);

  await db.add('requests', savedRequest);
  console.log('Request saved to IndexedDB', savedRequest);
}
