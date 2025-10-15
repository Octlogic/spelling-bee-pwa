// Spelling Bee PWA Service Worker
const CACHE_NAME = 'spelling-bee-v1.0.0';
const STATIC_CACHE_NAME = 'spelling-bee-static-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './file-processor.js',
  './words.json',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('All static assets cached');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip requests to other origins
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache invalid responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Fetch failed for:', event.request.url, error);
            
            // For HTML pages, return a basic offline page if we have one cached
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // For other resources, just fail
            throw error;
          });
      })
  );
});

// Handle background sync (for future enhancement)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'spelling-bee-sync') {
    event.waitUntil(
      // Could sync user scores to server in future
      Promise.resolve()
    );
  }
});

// Handle push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'Time for some spelling practice!',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: './'
    },
    actions: [
      {
        action: 'play',
        title: 'Start Spelling Bee',
        icon: './icons/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Not now'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Spelling Bee Challenge', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'play' || event.action === '') {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes('spelling-bee-pwa') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if app is not already open
          if (clients.openWindow) {
            return clients.openWindow('./');
          }
        })
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.keys())
      .then((keys) => {
        event.ports[0].postMessage({
          type: 'CACHE_SIZE',
          size: keys.length
        });
      });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED'
        });
      });
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
  event.preventDefault();
});

console.log('Service Worker script loaded');