/* SH customer app – works offline after the first visit. Prices: network first, so updates arrive as soon as there is internet. */
const CACHE = "sh-pricing-1.0.0-20261111151751";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "prices.shprices"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("prices.shprices") || e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname.endsWith("prices.shprices") ? "prices.shprices" : "index.html", copy)); return r; })
      .catch(() => caches.match(url.pathname.endsWith("prices.shprices") ? "prices.shprices" : "index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
