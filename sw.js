// نسخة التخزين: غيّر الرقم لما تنزّل تحديث جديد عشان الأجهزة تاخد النسخة الجديدة
const VERSION = 'labor-v2';
const FILES = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // التسجيلات (POST للشيت) مش بتعدّي من هنا
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // رابط Apps Script وأي موقع تاني: مباشر من النت
  // الصفحة: من النسخة المخزّنة فوراً، وبتتحدّث من النت في الخلفية
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('./index.html') : null);
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    return hit || net.then(r => r || new Response('غير متاح بدون نت', { status: 503 }));
  }));
});
