self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{try{const keys=await caches.keys();await Promise.all(keys.filter(k=>/^zemzem-/i.test(k)).map(k=>caches.delete(k)))}catch{}await self.clients.claim()})()));
// Intentionally no fetch handler: all requests go directly to the network/browser HTTP cache.
