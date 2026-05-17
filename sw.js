const CACHE_NAME = 'love-dates-v4';
const BASE_PATH = '/dates-of-love/';

const urlsToCache = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Nunito:wght@400;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Bước 3: Chiến lược Network-First giúp luôn cập nhật bản mới nhất khi có mạng
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Nếu lấy dữ liệu từ mạng thành công, bỏ vào cache bản mới nhất rồi trả về
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Nếu mất mạng hoặc mạng lỗi, lập tức lùi về lấy file trong cache cũ ra dùng
        return caches.match(event.request);
      })
  );
});