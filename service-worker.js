const CACHE='zemzem-shell-v1';
const SHELL=['/','/index.html','/shop.html','/assets/css/style.css','/assets/css/brand.css','/assets/js/app-v5.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(CACHE).then(k=>k.put(r,c));return x}).catch(()=>caches.match(r).then(x=>x||caches.match('/index.html'))));return}
 e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{const c=y.clone();caches.open(CACHE).then(k=>k.put(r,c));return y})));
});