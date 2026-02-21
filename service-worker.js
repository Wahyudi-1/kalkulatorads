const CACHE_NAME = 'kalkulator-ads-v3'; // Ganti angka versi ini setiap kali Anda mengupdate index.html
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache semua file penting saat pertama kali dibuka atau ada update
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Membuka cache dan menyimpan file PWA');
        return cache.addAll(urlsToCache);
      })
  );
  // Catatan: self.skipWaiting() dihapus dari sini agar update dikontrol oleh index.html
});

// Activate: Bersihkan cache lama jika ada update versi (CACHE_NAME berubah)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache versi lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Memastikan service worker baru langsung mengendalikan klien/halaman yang sedang terbuka
  return self.clients.claim();
});

// Fetch: Layani request dari Cache dulu (Offline First), jika tidak ada baru ke Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - kembalikan response dari cache
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Message Listener: Menerima perintah dari index.html untuk langsung menerapkan update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Menerapkan update Service Worker ke versi baru...');
    self.skipWaiting();
  }
});
