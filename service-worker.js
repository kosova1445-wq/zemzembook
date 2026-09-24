const CACHE='zemzem-offline-v4';
const OFFLINE=['/offline.html','/favicon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(OFFLINE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(r.mode==='navigate'){
   e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match('/offline.html')));
   return;
 }
 if(/\.(?:js|css|html)$/i.test(u.pathname)){
   e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));
   return;
 }
 e.respondWith(fetch(r).catch(()=>caches.match(r)));
});