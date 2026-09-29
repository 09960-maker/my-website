// Service Worker: แคชไฟล์ทั้งหมดเพื่อให้เล่นแบบ Offline ได้
// เมื่อแก้ไขไฟล์ ให้เปลี่ยนเลขเวอร์ชันด้านล่าง (v5 -> v6) เพื่อบังคับอัปเดตแคช
const CACHE = 'lab-game-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  // เก็บทีละไฟล์ ถ้าไฟล์ไหนขาด (เช่น ยังไม่ได้ใส่ไอคอน) ระบบแคชก็ยังทำงานต่อได้
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(ASSETS.map((a) => c.add(a).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});