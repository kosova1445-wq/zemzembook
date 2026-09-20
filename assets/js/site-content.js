(()=>{
  const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
  const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
  const safeHref=v=>{const s=String(v||'').trim();if(!s)return '#';if(/^(javascript|data):/i.test(s))return '#';return s};
  const safeImage=v=>{const s=String(v||'').trim();return /^(https:\/\/|assets\/|\.\.?\/)/i.test(s)?s:''};
  const categorySvg='<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"/></svg>';
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
        const icon=card.querySelector('.category-icon'),img=safeImage(x?.image_url);if(icon)icon.innerHTML=img?`<img src="${img.replace(/"/g,'&quot;')}" alt="">`:categorySvg;
        const isEbook=/ebook/i.test(String(x?.label||''))||/ebooks?\.html/i.test(String(x?.href||''));
        card.classList.toggle('category-item-ebook',isEbook);
      });
      cards.slice(cats.length).forEach(card=>card.hidden=true);
    }
    const mainCards=[...document.querySelectorAll('[data-home-category-cards] .home-category-card')];
    cats.filter(x=>x&&x.visible!==false&&!/ebook/i.test(String(x.label||''))).slice(0,mainCards.length).forEach((x,i)=>{const card=mainCards[i];if(!card)return;card.href=safeHref(x.href);const t=card.querySelector('strong');if(t)t.textContent=String(x.label||'Kategori');const icon=card.querySelector('.cat-icon'),img=safeImage(x.image_url);if(icon)icon.innerHTML=img?`<img src="${img.replace(/"/g,'&quot;')}" alt="">`:categorySvg;});
  }
  function validColor(v,fallback){return /^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):fallback}
  function shade(hex,amount){const n=parseInt(validColor(hex,'#ffffff').slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+amount)),g=Math.max(0,Math.min(255,((n>>8)&255)+amount)),b=Math.max(0,Math.min(255,(n&255)+amount));return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}
  function applyDesign(c){
    const d=c?.design||{};
    const menu=(Array.isArray(d.menu_colors)?d.menu_colors:[]).map((x,i)=>validColor(x,['#ffe8df','#e7f2ff','#eee8ff','#fff4c7','#e5f5e7','#e4f6f5'][i]||'#f4f4f4'));
    const cats=(Array.isArray(d.category_colors)?d.category_colors:[]).map((x,i)=>validColor(x,['#ffe4d9','#e2efff','#fff0b8','#def0e1','#dff1f1','#e8e0fb'][i]||'#f4f4f4'));
    const features=(Array.isArray(d.feature_colors)?d.feature_colors:[]).map((x,i)=>validColor(x,['#dfefff','#ddf4e7','#ffe7d4'][i]||'#f4f4f4'));
    const why=(Array.isArray(d.why_colors)?d.why_colors:[]).map((x,i)=>validColor(x,['#ffdcd0','#fff0aa','#dcecff','#e7ddff'][i]||'#f4f4f4'));
    const rail=(Array.isArray(d.rail_colors)?d.rail_colors:[]).map((x,i)=>validColor(x,['#ffd8cb','#ffedab','#dce9fb','#e5def8'][i]||'#f4f4f4'));
    const hover=d.hover_strength==='strong'?{sat:'1.38',bright:'1.06',y:'-6px',shadow:'0 20px 38px rgba(32,56,71,.16)'}:d.hover_strength==='soft'?{sat:'1.08',bright:'1.01',y:'-2px',shadow:'0 10px 22px rgba(32,56,71,.08)'}:{sat:'1.24',bright:'1.04',y:'-4px',shadow:'0 16px 32px rgba(32,56,71,.13)'};
    const heroTint=validColor(d.hero_tint,'#f3cfc5'),op=Math.max(0,Math.min(50,Number(d.hero_shelf_opacity??22)))/100;
    let css='.zemzem-bookstore-v2 .nav-row>a:not(.support){transition:.2s ease!important}.zemzem-bookstore-v2 .premium-category-list .category-item,.zemzem-bookstore-v2 .feature-grid .feature,.zemzem-bookstore-v2 .why-card,.zemzem-bookstore-v2 .collection-rail a{transition:.2s ease!important}';
    menu.slice(0,6).forEach((x,i)=>{css+=`.zemzem-bookstore-v2 .nav-row>a:not(.support):nth-of-type(${i+1}){background:${x}!important;border-color:${shade(x,-18)}!important;color:#294655!important}`});
    cats.slice(0,6).forEach((x,i)=>{css+=`.zemzem-bookstore-v2 .premium-category-list .category-item:nth-child(${i+1}){background:linear-gradient(180deg,#ffffff 0%,#f3f4f5 100%)!important;border-color:#e6e8ea!important}.zemzem-bookstore-v2 .premium-category-list .category-item:nth-child(${i+1}) .category-icon{background:linear-gradient(145deg,${x},${shade(x,-28)})!important;color:#fff!important}`});
    features.slice(0,3).forEach((x,i)=>{css+=`.zemzem-bookstore-v2 .feature-grid .feature:nth-child(${i+1}){background:${x}!important;border-color:${shade(x,-20)}!important}.zemzem-bookstore-v2 .feature-grid .feature:nth-child(${i+1}) .ico{background:${shade(x,-10)}!important}`});
    why.slice(0,4).forEach((x,i)=>{css+=`.zemzem-bookstore-v2 .why-grid .why-card:nth-child(${i+1}){background:${x}!important;border-color:${shade(x,-20)}!important}.zemzem-bookstore-v2 .why-grid .why-card:nth-child(${i+1}) .why-icon{background:${shade(x,-12)}!important}`});
    rail.slice(0,4).forEach((x,i)=>{css+=`.zemzem-bookstore-v2 .collection-rail a:nth-child(${i+1}){background:${x}!important;border-color:${shade(x,-20)}!important}.zemzem-bookstore-v2 .collection-rail a:nth-child(${i+1})>span{background:${shade(x,-10)}!important}`});
    css+=`.zemzem-bookstore-v2 .nav-row>a:not(.support):hover,.zemzem-bookstore-v2 .premium-category-list .category-item:hover,.zemzem-bookstore-v2 .feature-grid .feature:hover,.zemzem-bookstore-v2 .why-card:hover,.zemzem-bookstore-v2 .collection-rail a:hover{transform:translateY(${hover.y})!important;filter:saturate(${hover.sat}) brightness(${hover.bright})!important;box-shadow:${hover.shadow}!important}`;
    if(d.hero_background==='plain'){
      css+=`.zemzem-bookstore-v2 .home-hero{background:${heroTint}!important}.zemzem-bookstore-v2 .home-hero:before,.zemzem-bookstore-v2 .home-hero:after{display:none!important}`;
    }else if(d.hero_background==='soft'){
      css+=`.zemzem-bookstore-v2 .home-hero{background:linear-gradient(118deg,${shade(heroTint,22)} 0%,${heroTint} 58%,${shade(heroTint,-10)} 100%)!important}.zemzem-bookstore-v2 .home-hero:before{display:none!important}`;
    }else{
      css+=`.zemzem-bookstore-v2 .home-hero{position:relative!important;overflow:hidden!important;isolation:isolate!important;background:linear-gradient(118deg,${shade(heroTint,24)} 0%,${heroTint} 58%,${shade(heroTint,-8)} 100%)!important}.zemzem-bookstore-v2 .home-hero:before{display:block!important;content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(to bottom,transparent 0 14%,rgba(72,50,44,${op}) 14% 16%,transparent 16% 33%,rgba(72,50,44,${op}) 33% 35%,transparent 35% 52%,rgba(72,50,44,${op}) 52% 54%,transparent 54% 71%,rgba(72,50,44,${op}) 71% 73%,transparent 73% 100%),repeating-linear-gradient(90deg,rgba(83,61,56,${Math.max(.03,op*.55)}) 0 13px,rgba(255,255,255,.03) 13px 16px,rgba(102,73,67,${Math.max(.04,op*.7)}) 16px 29px,rgba(255,255,255,.03) 29px 32px,rgba(122,87,79,${Math.max(.03,op*.6)}) 32px 47px,rgba(255,255,255,.03) 47px 50px)!important;opacity:.9!important;filter:blur(.6px)!important;pointer-events:none!important;z-index:0!important}.zemzem-bookstore-v2 .home-hero:after{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(90deg,rgba(255,255,255,.42),rgba(255,255,255,.08) 48%,rgba(56,39,35,.08))!important;pointer-events:none!important;z-index:0!important}.zemzem-bookstore-v2 .home-hero>*{position:relative!important;z-index:2!important}`;
    }
    let style=document.getElementById('zemzemAdminDesign');if(!style){style=document.createElement('style');style.id='zemzemAdminDesign';document.head.appendChild(style)}style.textContent=css;
  }
  async function load(){
    try{
      const r=await fetch(`${SB_URL}/rest/v1/site_content?key=eq.homepage&select=content&limit=1`,{headers:{apikey:SB_KEY,Accept:'application/json'},cache:'no-store'});
      if(!r.ok)return;const rows=await r.json(),c=rows?.[0]?.content;if(!c||typeof c!=='object')return;
      applyMenu(c);applyHomepage(c);applyDesign(c);window.dispatchEvent(new CustomEvent('zemzem:site-content',{detail:c}));
    }catch(e){console.warn('ZemZem site content unavailable',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
