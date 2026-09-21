(()=>{
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  function ensureVisualLayers(){
    if(!q('link[data-zv2-ebukz3]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/home-ebukz3.css?v=1';l.dataset.zv2Ebukz3='1';document.head.appendChild(l)}
    if(!q('link[data-zv2-categories]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/home-category-preserve.css?v=1';l.dataset.zv2Categories='1';document.head.appendChild(l)}
    let t=q('link[data-zv2-fonts]');if(!t){t=document.createElement('link');t.rel='stylesheet';t.href='assets/css/home-font-standard.css?v=1';t.dataset.zv2Fonts='1'}document.head.appendChild(t);
    let p=q('link[data-zv2-professional]');if(!p){p=document.createElement('link');p.rel='stylesheet';p.href='assets/css/home-professional-v4.css?v=3';p.dataset.zv2Professional='1'}document.head.appendChild(p)
  }
  function themeSections(){document.body.classList.add('zemzem-bookstore-v2');qa('.section-head').forEach(x=>x.classList.add('zv2-section-head'));const hero=q('.home-hero');if(hero&&!q('.zv2-hero-shape',hero)){hero.insertAdjacentHTML('beforeend','<span class="zv2-hero-shape" aria-hidden="true"></span>')}}
  function moveCollectionRailBeforeNewsletter(){return}
  function newsletter(){q('#zv2Newsletter')?.remove();q('#homeNewsletter')?.remove()}
  async function subscribeNewsletter(e){e.preventDefault();const form=e.currentTarget,input=q('input',form),button=q('button',form),email=String(input?.value||'').trim().toLowerCase();if(!email)return;button.disabled=true;button.textContent='Duke ruajtur…';try{const s=window.ZemZemStore;if(!s?.SUPABASE_URL||!s?.SUPABASE_PUBLISHABLE_KEY)throw new Error('Shërbimi nuk është gati.');const r=await fetch(`${s.SUPABASE_URL}/rest/v1/newsletter_subscribers`,{method:'POST',headers:{apikey:s.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({email,status:'active',source:'homepage'})});if(!r.ok&&r.status!==409)throw new Error('Regjistrimi nuk u krye.');try{localStorage.setItem('zemzem_newsletter_email',email)}catch{};input.value='';if(typeof toast==='function')toast(r.status===409?'Ky email është regjistruar më parë.':'Faleminderit! Emaili u regjistrua.');else alert('Faleminderit! Emaili u regjistrua.')}catch(err){if(typeof toast==='function')toast(err.message,'error');else alert(err.message)}finally{button.disabled=false;button.textContent='Regjistrohu'}}
  function polish(){ensureVisualLayers();themeSections();newsletter();qa('.book-card').forEach(card=>card.classList.add('zv2-book-card'));qa('.home-blog-card').forEach(card=>card.classList.add('zv2-blog-card'))}
  function run(){polish();setTimeout(polish,900);setTimeout(polish,1800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
