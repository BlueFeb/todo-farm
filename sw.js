const CACHE_VERSION = 'todo-farm-v16';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패 시 캐시 (항상 최신 코드 사용)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Google Sheets API 요청은 캐시하지 않음
  if (url.hostname.includes('google') || url.hostname.includes('puter')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 성공하면 캐시 업데이트
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 오프라인이면 캐시에서
        return caches.match(e.request);
      })
  );
});
