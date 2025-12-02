// Service Worker para System Eco PWA
const CACHE_NAME = 'system-eco-v1';
const RUNTIME_CACHE = 'system-eco-runtime-v1';

// Archivos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.self.clients.claim())
  );
});

// Estrategia de cache: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests a Supabase y APIs externas
  if (url.origin.includes('supabase.co') || 
      url.origin.includes('googleapis.com') ||
      url.origin.includes('google.com')) {
    return; // Dejar pasar sin cachear
  }

  // Para assets estáticos, usar Cache First
  if (request.destination === 'image' || 
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Para HTML y navegación, usar Network First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Para otros recursos, usar Network First
  event.respondWith(networkFirst(request));
});

// Estrategia Cache First (para assets estáticos)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // Retornar página offline si es una navegación
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Estrategia Network First (para contenido dinámico)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Si es navegación y no hay cache, retornar página offline
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Manejo de mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Sincronización en background (para cuando vuelva la conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Aquí puedes agregar lógica para sincronizar datos pendientes
  console.log('[SW] Background sync triggered');
}

// Notificaciones push (para futuras implementaciones)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'System Eco';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/logo.svg',
    badge: '/logo.svg',
    vibrate: [200, 100, 200],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});

