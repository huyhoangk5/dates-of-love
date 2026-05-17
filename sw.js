const CACHE_NAME = 'love-dates-v2';
const BASE_PATH = '/dates-of-love/';

// Những file cần lưu lại để dùng khi không có mạng
const urlsToCache = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Nunito:wght@400;600;700;800&display=swap'
];

// Bước 1: Cài đặt và lưu file vào bộ nhớ đệm (cache)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Bước 2: Kích hoạt và xóa cache cũ
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

// Bước 3: Quan trọng nhất - Xử lý mọi request từ app
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Nếu yêu cầu là một trang (navigation request), ví dụ: mở app từ màn hình chính
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Nếu không có mạng, hãy trả về file index.html đã được lưu trong cache
        return caches.match(`${BASE_PATH}index.html`);
      })
    );
    return;
  }

  // Với các yêu cầu khác (ảnh, css, js...), hãy lấy từ cache trước
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});