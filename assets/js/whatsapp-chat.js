// ZemZem mobile WhatsApp contact button v1
(()=>{
  if(document.querySelector('[data-zemzem-whatsapp]'))return;
  const phone='41786044792';
  const message=`Përshëndetje ZemZem! Kam një pyetje rreth: ${document.title}\n${location.href}`;
  const link=document.createElement('a');
  link.href=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  link.target='_blank'; link.rel='noopener noreferrer';
  link.className='zemzem-whatsapp'; link.dataset.zemzemWhatsapp='1';
  link.setAttribute('aria-label','Na shkruaj në WhatsApp');
  link.innerHTML='<span class="zemzem-whatsapp-label">Na shkruaj</span><span class="zemzem-whatsapp-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path fill="currentColor" d="M16.04 3a12.7 12.7 0 0 0-10.9 19.22L3.45 28.4l6.33-1.66A12.7 12.7 0 1 0 16.04 3Zm0 22.86c-2 0-3.95-.58-5.62-1.67l-.4-.24-3.75.98 1-3.65-.26-.42a10.17 10.17 0 1 1 9.03 5Zm5.58-7.62c-.3-.15-1.81-.9-2.09-1-.28-.1-.48-.15-.69.15-.2.3-.78 1-.96 1.2-.18.2-.36.23-.66.08-1.8-.9-2.98-1.6-4.17-3.64-.31-.54.32-.5.9-1.66.1-.2.05-.38-.02-.53-.08-.15-.69-1.65-.94-2.26-.25-.6-.5-.52-.69-.53h-.58c-.2 0-.53.08-.81.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.94 1.24 3.15c.15.2 2.14 3.27 5.19 4.59 1.93.83 2.68.9 3.64.76 1.1-.16 1.81-.74 2.07-1.45.25-.71.25-1.32.18-1.45-.08-.13-.28-.2-.59-.36Z"/></svg></span>';
  const style=document.createElement('style');
  style.textContent='.zemzem-whatsapp{display:flex;position:fixed;right:20px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:9998;align-items:center;gap:9px;color:#fff!important;text-decoration:none!important;font:800 14px/1 system-ui,-apple-system,Segoe UI,sans-serif;filter:drop-shadow(0 8px 18px rgba(18,58,42,.28))}.zemzem-whatsapp-label{background:#173f35;padding:11px 13px;border-radius:999px}.zemzem-whatsapp-icon{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#25d366;border:2px solid #fff;box-shadow:0 7px 22px rgba(37,211,102,.35)}.zemzem-whatsapp-icon svg{width:31px;height:31px}.zemzem-whatsapp:focus-visible{outline:3px solid #f5a623;outline-offset:4px;border-radius:999px}@media(max-width:820px){.zemzem-whatsapp{right:16px;bottom:calc(18px + env(safe-area-inset-bottom))}}@media(max-width:390px){.zemzem-whatsapp-label{display:none}}@media(prefers-reduced-motion:no-preference){.zemzem-whatsapp-icon{animation:zemzem-wa-pulse 2.8s ease-in-out infinite}@keyframes zemzem-wa-pulse{0%,72%,100%{transform:scale(1)}82%{transform:scale(1.08)}}}';
  document.head.appendChild(style); document.body.appendChild(link);
})();
