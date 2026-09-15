(()=>{
  const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
  const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
  const safeHref=v=>{const s=String(v||'').trim();if(!s)return '#';if(/^(javascript|data):/i.test(s))return '#';return s};
  const setText=(sel,val)=>{const e=document.querySelector(sel);if(e&&typeof val==='string'&&val.trim())e.textContent=val.trim()};
  function applyMenu(c){
    document.querySelectorAll('.nav-row').forEach(row=>{
      const spacer=row.querySelector('.nav-spacer'),support=row.querySelector('.support');
      if(!spacer)return;
      [...row.children].filter(el=>el.tagName==='A'&&!el.classList.contains('support')).forEach(a=>a.remove());
      (Array.isArray(c.primary_menu)?c.primary_menu:[]).filter(x=>x&&x.visible!==false&&x.label).forEach(item=>{
        const a=document.createElement('a');a.href=safeHref(item.href);a.textContent=item.label;row.insertBefore(a,spacer);
      });
      if(support){support.href=safeHref(c.support_href||'contact.html');support.textContent='☎ '+(c.support_label||'Porosit & Pyet')}
    });
  }
  function dynamicCategoryCard(){
    const a=document.createElement('a');
    a.className='category-item category-item-dynamic';
    a.innerHTML='<span class="category-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"/></svg></span><span class="category-copy"><strong>Kategori</strong><small></small></span><span class="category-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5l7 7-7 7"/></svg></span>';
    return a;
  }
  function applyHomepage(c){
    setText('.topbar .container > span',c.topbar_text?'🚚 '+String(c.topbar_text).replace(/^\s*🚚\s*/,''):null);
    const h=c.hero||{};
    setText('.home-hero .hero-copy .eyebrow',h.eyebrow);
    setText('.home-hero .hero-copy h1',h.title);
    setText('.home-hero .hero-copy > p',h.description);
    const actions=document.querySelectorAll('.home-hero .hero-actions a');
    if(actions[0]){if(h.primary_label)actions[0].textContent=h.primary_label;if(h.primary_href)actions[0].href=safeHref(h.primary_href)}
    if(actions[1]){if(h.secondary_label)actions[1].textContent=h.secondary_label;if(h.secondary_href)actions[1].href=safeHref(h.secondary_href)}
    setText('.category-box-head h4',c.categories_heading);
    setText('.category-box-head .category-overline',c.categories_kicker);
    const list=document.querySelector('.premium-category-list');
    const cats=Array.isArray(c.home_categories)?c.home_categories:[];
    if(list){
      list.querySelectorAll('.category-item-dynamic').forEach(x=>x.remove());
      const cards=[...list.querySelectorAll('.category-item')];
      cats.forEach((x,i)=>{
        let card=cards[i];
        if(!card){card=dynamicCategoryCard();list.appendChild(card);cards.push(card)}
        card.hidden=!x||x.visible===false||!String(x.label||'').trim();
        card.href=safeHref(x?.href);
        const t=card.querySelector('.category-copy strong'),d=card.querySelector('.category-copy small');
        if(t)t.textContent=String(x?.label||'Kategori');
        if(d)d.textContent=String(x?.description||'');
        const isEbook=/ebook/i.test(String(x?.label||''))||/ebooks?\.html/i.test(String(x?.href||''));
        card.classList.toggle('category-item-ebook',isEbook);
      });
      cards.slice(cats.length).forEach(card=>card.hidden=true);
    }
  }
  async function load(){
    try{
      const r=await fetch(`${SB_URL}/rest/v1/site_content?key=eq.homepage&select=content&limit=1`,{headers:{apikey:SB_KEY,Accept:'application/json'},cache:'no-store'});
      if(!r.ok)return;const rows=await r.json(),c=rows?.[0]?.content;if(!c||typeof c!=='object')return;
      applyMenu(c);applyHomepage(c);window.dispatchEvent(new CustomEvent('zemzem:site-content',{detail:c}));
    }catch(e){console.warn('ZemZem site content unavailable',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
