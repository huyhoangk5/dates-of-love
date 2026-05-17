const CACHE_NAME = 'love-dates-v3';
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

// Xử lý request thông minh, chống 404 khi khởi chạy App độc lập
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Nếu là yêu cầu điều hướng trang (Mở app, tải lại trang)
  if (event.request.mode === 'navigate' || url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Nếu lỗi mạng hoặc không tìm thấy, trả về ngay tài nguyên index từ Cache gốc
          return caches.match(`${BASE_PATH}index.html`) || caches.match(BASE_PATH);
        })
    );
    return;
  }

  // Đối với asset khác (CSS, JS từ CDN, font), tìm trong bộ nhớ Cache trước
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});