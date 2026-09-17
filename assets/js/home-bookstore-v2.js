(()=>{
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  function ensureVisualLayers(){
    if(!q('link[data-zv2-ebukz3]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/home-ebukz3.css?v=1';l.dataset.zv2Ebukz3='1';document.head.appendChild(l)}
    if(!q('link[data-zv2-categories]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/home-category-preserve.css?v=1';l.dataset.zv2Categories='1';document.head.appendChild(l)}
    let t=q('link[data-zv2-fonts]');if(!t){t=document.createElement('link');t.rel='stylesheet';t.href='assets/css/home-font-standard.css?v=1';t.dataset.zv2Fonts='1'}document.head.appendChild(t);
    let p=q('link[data-zv2-professional]');if(!p){p=document.createElement('link');p.rel='stylesheet';p.href='assets/css/home-professional-v4.css?v=1';p.dataset.zv2Professional='1'}document.head.appendChild(p)
  }
  function themeSections(){document.body.classList.add('zemzem-bookstore-v2');qa('.section-head').forEach(x=>x.classList.add('zv2-section-head'));const hero=q('.home-hero');if(hero&&!q('.zv2-hero-shape',hero)){hero.insertAdjacentHTML('beforeend','<span class="zv2-hero-shape" aria-hidden="true"></span>')}}
  function newsletter(){if(q('#zv2Newsletter')||!q('.footer'))return;const section=document.createElement('section');section.id='zv2Newsletter';section.className='zv2-newsletter';section.innerHTML=`<div class="container"><div class="zv2-newsletter-card"><div><div class="section-kicker" style="color:#fff">ZemZem Newsletter</div><h3>Libra të rinj, oferta dhe artikuj direkt te ti.</h3><p>Shkruaje emailin dhe qëndro në dijeni për titujt dhe përmbajtjet e reja të ZemZem.</p></div><form class="zv2-newsletter-form" id="zv2NewsletterForm"><input type="email" required autocomplete="email" placeholder="Email adresa"><button type="submit">Regjistrohu</button></form></div></div>`;q('.footer').insertAdjacentElement('beforebegin',section);q('#zv2NewsletterForm')?.addEventListener('submit',e=>{e.preventDefault();const input=q('input',e.currentTarget);if(!input?.value)return;try{localStorage.setItem('zemzem_newsletter_email',input.value.trim())}catch{};input.value='';if(typeof toast==='function')toast('Faleminderit! Emaili u regjistrua.');else alert('Faleminderit! Emaili u regjistrua.')})}
  function polish(){ensureVisualLayers();themeSections();newsletter();qa('.book-card').forEach(card=>card.classList.add('zv2-book-card'));qa('.home-blog-card').forEach(card=>card.classList.add('zv2-blog-card'))}
  function run(){polish();setTimeout(polish,900);setTimeout(polish,1800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
