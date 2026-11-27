// Service Worker: rede primeiro, com cache como reserva para uso offline (inclui o SOS Inteligente).
const V = 'acolhemind-v2', SHELL = ['/', '/login', '/diario', '/sos', '/manifest.json', '/icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  // Dados das crianças (API) nunca vão para o cache do Service Worker: só o app em si e as fontes.
  const u = new URL(r.url);
  const fonte = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin !== location.origin && !fonte) return;
  if (u.pathname.startsWith('/api')) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then(m => m || caches.match('/diario'))));
});
