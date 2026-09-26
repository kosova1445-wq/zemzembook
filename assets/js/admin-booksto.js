(()=>{
  const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
  const svg=(path)=>`<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  const icons={
    home:svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/>'),
    dashboard:svg('<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/>'),
    orders:svg('<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
    catalog:svg('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="7" cy="6" r="1"/><circle cx="7" cy="12" r="1"/><circle cx="7" cy="18" r="1"/>'),
    book:svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"/>'),
    ebook:svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M10 17h4"/>'),
    user:svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>'),
    coupon:svg('<path d="M4 7h16v10H4z"/><path d="M9 8.5 15 15.5M9.5 14.5h.01M14.5 9.5h.01"/>'),
    review:svg('<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
    audit:svg('<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
    admins:svg('<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M13 19a4.5 4.5 0 0 1 8 0"/>'),
    branding:svg('<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m7 16 3-3 2 2 3-4 2 5"/>'),
    settings:svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/>'),
    contact:svg('<path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/>'),
    search:svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    bell:svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>'),
    mail:svg('<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>'),
    cart:svg('<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H7"/>'),
    gift:svg('<path d="M4 10h16v11H4z"/><path d="M2.5 6h19v4h-19zM12 6v15"/><path d="M12 6H8.5A2.5 2.5 0 1 1 11 3.5L12 6Zm0 0h3.5A2.5 2.5 0 1 0 13 3.5L12 6Z"/>'),
    partner:svg('<path d="M8 12 5.5 9.5a2 2 0 0 1 0-2.8l1.2-1.2a2 2 0 0 1 2.8 0L12 8l2.5-2.5a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L16 12"/><path d="m8 12 4 4 4-4M12 8v8"/>'),
    invoice:svg('<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6M9 19h4"/>'),
    chart:svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    megaphone:svg('<path d="M3 11v2l11 4V7L3 11Z"/><path d="M14 9c3-1 5-2 7-4v14c-2-2-4-3-7-4M6 14l1.5 5h3L9 15"/>'),
    automation:svg('<path d="M7 7h10v10H7z"/><path d="M3 12h4M17 12h4M12 3v4M12 17v4"/><circle cx="12" cy="12" r="2"/>'),
    brain:svg('<path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3c0 1.4.9 2.6 2.1 3A3.5 3.5 0 0 0 9.5 20H12V4H9Zm6 0a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3c0 1.4-.9 2.6-2.1 3a3.5 3.5 0 0 1-3.4 6H12V4h3Z"/>'),
    command:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>'),
    warehouse:svg('<path d="m3 9 9-5 9 5v11H3z"/><path d="M7 12h10v8H7zM7 15h10"/>'),
    truck:svg('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>'),
    globe:svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
    blog:svg('<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    shield:svg('<path d="M12 3 4.5 6v5.5c0 4.5 3.1 7.6 7.5 9.5 4.4-1.9 7.5-5 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>'),
    bulk:svg('<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')
  };
  function iconize(el,icon,label){if(!el)return;const badge=el.querySelector('.nav-badge');el.innerHTML=`<span class="side-menu-icon">${icons[icon]||''}</span><span>${label}</span>`;if(badge)el.appendChild(badge)}
  function section(text,theme='neutral'){const d=document.createElement('div');d.className='side-section-label side-sector-'+theme;d.dataset.sector=theme;d.textContent=text;return d}
  function pageLink(label,href,icon){const a=document.createElement('a');a.className='side-page-link';a.href=href;a.target='_blank';a.rel='noopener';a.innerHTML=`<span class="side-menu-icon">${icons[icon]||icons.home}</span><span>${label}</span>`;return a}
  function extraCatalog(label,index,icon='catalog'){const b=document.createElement('button');b.type='button';b.className='side-extra-item';b.innerHTML=`<span class="side-menu-icon">${icons[icon]||icons.catalog}</span><span>${label}</span>`;b.addEventListener('click',()=>{if(typeof setView==='function')setView('catalog');setTimeout(()=>{const cards=qa('#view-catalog .entity-card');cards[index]?.scrollIntoView({behavior:'smooth',block:'start'});cards[index]?.animate([{boxShadow:'0 0 0 0 rgba(18,203,176,0)'},{boxShadow:'0 0 0 4px rgba(18,203,176,.18)'},{boxShadow:'0 0 0 0 rgba(18,203,176,0)'}],{duration:900})},80)});return b}
  function decorateSidebarSectors(side){
    if(!side)return;
    const sectorMap={main:'main',admin:'admin',communication:'communication',invoice:'invoice',pages:'pages',system:'system'};
    let current='main';
    [...side.children].forEach(el=>{
      if(el.classList.contains('side-section-label')){
        current=el.dataset.sector||current;
        el.classList.add('zz-sector-label','zz-sector-'+current);
        return;
      }
      if(el.matches('.nav-item,.side-page-link,.side-extra-item,[data-invoice-center]')){
        [...el.classList].filter(x=>x.startsWith('zz-sector-')).forEach(x=>el.classList.remove(x));
        el.classList.add('zz-sector-item','zz-sector-'+(sectorMap[current]||current));
        if(!el.querySelector('.side-menu-icon')){
          const badge=el.querySelector('.nav-badge');
          const text=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim()||el.textContent.trim();
          el.innerHTML=`<span class="side-menu-icon">${icons.settings}</span><span>${text}</span>`;
          if(badge)el.appendChild(badge);
        }
      }
    });
  }
  function rebuildSidebar(){
    const side=q('.side-nav');if(!side||side.dataset.bookstoReady)return;side.dataset.bookstoReady='1';
    const dash=side.querySelector('[data-view="dashboard"]'),teamCenterBtn=side.querySelector('[data-view="team-center"]'),freeLibraryBtn=side.querySelector('[data-view="free-library"]'),ordersBtn=side.querySelector('[data-view="orders"]'),booksBtn=side.querySelector('[data-view="books"]'),addBookBtn=side.querySelector('[data-view="add-book"]'),messagesBtn=side.querySelector('[data-view="messages"]'),catalogBtn=side.querySelector('[data-view="catalog"]'),customersBtn=side.querySelector('[data-view="customers"]'),couponsBtn=side.querySelector('[data-view="coupons"]'),reviewsBtn=side.querySelector('[data-view="reviews"]'),adminsBtn=side.querySelector('[data-view="admins"]'),brandingBtn=side.querySelector('[data-view="branding"]'),mediaBtn=side.querySelector('[data-view="media"]'),operationsBtn=side.querySelector('[data-view="operations"]'),auditBtn=side.querySelector('[data-view="audit"]'),integrationsBtn=side.querySelector('[data-view="integrations"]'),controlCenterBtn=side.querySelector('[data-view="control-center"]'),invoiceCenterBtn=side.querySelector('[data-invoice-center]'),invoiceSettingsBtn=side.querySelector('[data-view="invoice-settings"]'),ebook=[...side.querySelectorAll('a.nav-item')].find(a=>a.getAttribute('href')==='admin-ebooks.html');
    iconize(dash,'dashboard','Dashboard');iconize(teamCenterBtn,'dashboard','Team Center');iconize(freeLibraryBtn,'ebook','Biblioteka Falas');iconize(ordersBtn,'orders','Porositë');iconize(booksBtn,'book','Books');iconize(addBookBtn,'book','Shto libër');iconize(messagesBtn,'mail','Mesazhet');iconize(catalogBtn,'catalog','Katalogu');iconize(customersBtn,'user','User / Klientët');iconize(couponsBtn,'coupon','Kuponët');iconize(reviewsBtn,'review','Review');iconize(adminsBtn,'admins','Administratorët');iconize(brandingBtn,'branding','Logo & Brand');iconize(mediaBtn,'catalog','Media Manager');iconize(operationsBtn,'settings','Operations');iconize(auditBtn,'audit','Audit Log');iconize(integrationsBtn,'settings','Integrimet');iconize(controlCenterBtn,'settings','Control Center');if(ebook)iconize(ebook,'ebook','eBook');
    const frag=document.createDocumentFragment();
    frag.append(section('MAIN PAGES','main'));frag.append(pageLink('Home Page','index.html','home'));if(dash)frag.append(dash);if(teamCenterBtn)frag.append(teamCenterBtn);
    frag.append(section('ADMIN','admin'));if(ordersBtn)frag.append(ordersBtn);frag.append(extraCatalog('Category Lists',1,'catalog'));frag.append(extraCatalog('Author',0,'user'));if(booksBtn)frag.append(booksBtn);if(addBookBtn)frag.append(addBookBtn);if(ebook)frag.append(ebook);if(freeLibraryBtn)frag.append(freeLibraryBtn);if(catalogBtn)frag.append(catalogBtn);if(customersBtn)frag.append(customersBtn);if(couponsBtn)frag.append(couponsBtn);if(reviewsBtn)frag.append(reviewsBtn);if(adminsBtn)frag.append(adminsBtn);if(brandingBtn)frag.append(brandingBtn);if(mediaBtn)frag.append(mediaBtn);if(operationsBtn)frag.append(operationsBtn);if(messagesBtn){frag.append(section('KOMUNIKIM','communication'));frag.append(messagesBtn)}if(invoiceCenterBtn||invoiceSettingsBtn){frag.append(section('FATURAT','invoice'));if(invoiceCenterBtn)frag.append(invoiceCenterBtn);if(invoiceSettingsBtn)frag.append(invoiceSettingsBtn);}
    frag.append(section('PAGES','pages'));frag.append(pageLink('Shop','shop.html','book'));frag.append(pageLink('Account','account.html','user'));frag.append(pageLink('Contact','contact.html','contact'));frag.append(pageLink('Shipping & Returns','shipping-returns.html','orders'));
    frag.append(section('SYSTEM','system'));if(controlCenterBtn)frag.append(controlCenterBtn);if(auditBtn)frag.append(auditBtn);if(integrationsBtn)frag.append(integrationsBtn);
    side.replaceChildren(frag);
    decorateSidebarSectors(side);
    if(!window.zzSidebarSectorObserver){
      window.zzSidebarSectorObserver=new MutationObserver(()=>decorateSidebarSectors(side));
      window.zzSidebarSectorObserver.observe(side,{childList:true,subtree:false});
    }
  }

  const sidebarGroupsV3=[
    {key:'overview',label:'PËRMBLEDHJE'},
    {key:'sales',label:'SHITJE & POROSI'},
    {key:'catalog',label:'KATALOG & LIBRA'},
    {key:'customers',label:'KLIENTË & MARKETING'},
    {key:'partners',label:'PARTNERË & FINANCË'},
    {key:'content',label:'PËRMBAJTJE & FAQE'},
    {key:'system',label:'SISTEM & SIGURI'}
  ];
  function sidebarSemantic(el){
    const view=(el.dataset?.view||'').toLowerCase();
    const href=(el.getAttribute?.('href')||'').toLowerCase();
    const raw=(el.textContent||'').replace(/\s+/g,' ').trim();
    const t=(view+' '+href+' '+raw).toLowerCase();

    let group='system',icon='settings',label=raw;
    if(/dashboard/.test(t)){group='overview';icon='dashboard';label='Dashboard'}
    else if(/team center/.test(t)){group='overview';icon='admins';label='Team Center'}
    else if(/porosit|orders|checkout/.test(t)){group='sales';icon=/checkout/.test(t)?'cart':'orders';label=/checkout/.test(t)?'Checkout':'Porositë'}
    else if(/shporta|abandoned/.test(t)){group='sales';icon='cart';label='Shporta të braktisura'}
    else if(/gift card/.test(t)){group='sales';icon='gift';label='Gift Cards'}
    else if(/shipping|dërges|kthim|returns/.test(t)){group='sales';icon='truck';}
    else if(/shto lib|add-book/.test(t)){group='catalog';icon='book';label='Shto libër'}
    else if(/librat fizik|books$|\bbooks\b/.test(t)){group='catalog';icon='book';label='Librat fizikë'}
    else if(/ebook/.test(t)){group='catalog';icon='ebook';label=/biblioteka falas/.test(t)?'Biblioteka Falas':'eBook'}
    else if(/biblioteka falas/.test(t)){group='catalog';icon='ebook';label='Biblioteka Falas'}
    else if(/katalog|category|author|media manager/.test(t)){group='catalog';icon=/author/.test(t)?'user':'catalog';label=raw.replace('Category Lists','Kategoritë').replace('Author','Autorët')}
    else if(/klient|customer|user \/ klient/.test(t)){group='customers';icon='user';label='Klientët'}
    else if(/kupon|coupon/.test(t)){group='customers';icon='coupon';label='Kuponët'}
    else if(/review/.test(t)){group='customers';icon='review';label='Reviews'}
    else if(/marketing/.test(t)){group='customers';icon='megaphone';label='Marketing'}
    else if(/komunik|mesazh|messenger/.test(t)){group='customers';icon='mail';label=/mesazh|messenger/.test(t)?'Mesazhet':'Komunikimi'}
    else if(/growth|experience.*automation|automation/.test(t)){group='customers';icon='automation';label=/growth/.test(t)?'Growth':'Automatizime'}
    else if(/partner/.test(t)){group='partners';icon='partner';label='Partnerët'}
    else if(/fatur|invoice/.test(t)){group='partners';icon='invoice';}
    else if(/profit|warehouse/.test(t)){group='partners';icon='warehouse';label='Profit & Stok'}
    else if(/quote|proforma/.test(t)){group='partners';icon='invoice';label='Quotes / Proforma'}
    else if(/bulk/.test(t)){group='partners';icon='bulk';label='Bulk Center'}
    else if(/raport|report/.test(t)){group='partners';icon='chart';label='Raporte'}
    else if(/operations/.test(t)){group='partners';icon='chart';label='Operations'}
    else if(/logo|brand/.test(t)){group='content';icon='branding';label='Logo & Brand'}
    else if(/site manager/.test(t)){group='content';icon='globe';label='Site Manager'}
    else if(/faq|page|menu/.test(t)){group='content';icon='globe';}
    else if(/blog/.test(t)){group='content';icon='blog';label='Blog'}
    else if(/shop\.html|account\.html|contact\.html/.test(t)){group='content';icon=/contact/.test(t)?'contact':(/account/.test(t)?'user':'globe')}
    else if(/control center/.test(t)){group='system';icon='settings';label='Control Center'}
    else if(/security|siguria|release/.test(t)){group='system';icon='shield';label='Siguria & Releases'}
    else if(/audit/.test(t)){group='system';icon='audit';label='Audit Log'}
    else if(/integrim/.test(t)){group='system';icon='settings';label='Integrimet'}
    else if(/administrator/.test(t)){group='system';icon='admins';label='Administratorët'}
    else if(/intelligence/.test(t)){group='system';icon='brain';label='Intelligence'}
    else if(/command center/.test(t)){group='system';icon='command';label='Command'}
    else if(/advanced center/.test(t)){group='system';icon='settings';label='Advanced'}

    return {group,icon,label:label||raw};
  }
  function applySemanticIcon(el,meta){
    if(!el||!meta)return;
    const badge=el.querySelector('.nav-badge');
    const oldIcon=el.querySelector('.side-menu-icon');
    const textSpan=[...el.children].find(x=>x.tagName==='SPAN'&&!x.classList.contains('side-menu-icon')&&!x.classList.contains('nav-badge'));
    if(oldIcon)oldIcon.innerHTML=icons[meta.icon]||icons.settings;
    else el.insertAdjacentHTML('afterbegin','<span class="side-menu-icon">'+(icons[meta.icon]||icons.settings)+'</span>');
    const target=textSpan||[...el.children].find(x=>x.tagName==='SPAN'&&!x.classList.contains('side-menu-icon'));
    if(target)target.textContent=meta.label;
    else if(!badge){const s=document.createElement('span');s.textContent=meta.label;el.appendChild(s)}
    el.dataset.sidebarGroup=meta.group;
    el.title=meta.label;
  }
  function professionalizeSidebarV3(){
    const side=q('.side-nav');if(!side)return;
    const items=[...side.children].filter(el=>el.matches('.nav-item,.side-page-link,.side-extra-item,[data-invoice-center],a.nav-item'));
    if(!items.length)return;
    const signature=items.map(el=>(el.dataset?.view||el.getAttribute?.('href')||'')+'|'+(el.textContent||'').trim()).join('~');
    if(side.dataset.proSidebarSignature===signature)return;

    const buckets=new Map(sidebarGroupsV3.map(g=>[g.key,[]]));
    items.forEach(el=>{
      const meta=sidebarSemantic(el);
      applySemanticIcon(el,meta);
      (buckets.get(meta.group)||buckets.get('system')).push(el);
    });

    const frag=document.createDocumentFragment();
    sidebarGroupsV3.forEach(g=>{
      const rows=buckets.get(g.key)||[];
      if(!rows.length)return;
      frag.append(section(g.label,g.key));
      rows.forEach(el=>frag.append(el));
    });
    side.replaceChildren(frag);
    side.dataset.proSidebarSignature=[...side.querySelectorAll('.nav-item,.side-page-link,.side-extra-item,[data-invoice-center]')].map(el=>(el.dataset?.view||el.getAttribute?.('href')||'')+'|'+(el.textContent||'').trim()).join('~');
    decorateSidebarSectors(side);
  }
  function startProfessionalSidebarV3(){
    const side=q('.side-nav');if(!side)return;
    professionalizeSidebarV3();
    let tick=0;
    const obs=new MutationObserver(()=>{
      cancelAnimationFrame(tick);
      tick=requestAnimationFrame(()=>professionalizeSidebarV3());
    });
    obs.observe(side,{childList:true,subtree:false});
    [250,700,1600,3200].forEach(ms=>setTimeout(professionalizeSidebarV3,ms));
  }

  function buildTopbar(){
    const bar=q('.admin-topbar');if(!bar||bar.dataset.bookstoReady)return;bar.dataset.bookstoReady='1';
    const titleWrap=bar.firstElementChild;if(titleWrap)titleWrap.classList.add('topbar-page-title');
    const actions=q('.top-actions');
    const search=document.createElement('div');search.className='booksto-search';search.innerHTML=`<div class="booksto-search-box">${icons.search}<input id="adminGlobalSearch" autocomplete="off" placeholder="Kërko libër, porosi, klient..."></div><div id="adminSearchResults" class="admin-search-results" hidden></div>`;
    if(actions)bar.insertBefore(search,actions);else bar.appendChild(search);
    if(actions){const refresh=q('#refreshBtn');const mail=document.createElement('button');mail.type='button';mail.className='topbar-icon hide-mobile';mail.title='Kontaktet';mail.innerHTML=icons.mail;mail.onclick=()=>window.open('contact.html','_blank');const bell=document.createElement('button');bell.type='button';bell.className='topbar-icon';bell.title='Porositë në pritje';bell.innerHTML=`${icons.bell}<span class="topbar-badge" id="topPendingBadge">0</span>`;bell.onclick=()=>typeof setView==='function'&&setView('orders');const chat=document.createElement('button');chat.type='button';chat.className='topbar-icon zz-admin-chat-shortcut';chat.title='Messenger i administratorëve';chat.setAttribute('aria-label','Messenger i administratorëve');chat.innerHTML=icons.mail;chat.onclick=()=>typeof setView==='function'&&setView('messages');if(refresh)actions.insertBefore(mail,refresh);actions.insertBefore(chat,refresh||actions.firstChild);actions.insertBefore(bell,refresh||actions.firstChild)}
    bindGlobalSearch();
  }
  function searchable(){
    const out=[];
    try{(books||[]).forEach(b=>out.push({type:'Libër',view:'books',label:b.title||'Libër',sub:[b.sku,b.isbn].filter(Boolean).join(' · '),query:b.title||b.sku||''}));}catch{}
    try{(orders||[]).forEach(o=>out.push({type:'Porosi',view:'orders',label:o.order_number||'Porosi',sub:[o.first_name,o.last_name,o.guest_email,o.phone].filter(Boolean).join(' '),query:o.order_number||o.guest_email||''}));}catch{}
    try{(customers||[]).forEach(c=>out.push({type:'Klient',view:'customers',label:[c.first_name,c.last_name].filter(Boolean).join(' ')||c.email||c.guest_email||'Klient',sub:c.email||c.guest_email||c.phone||'',query:c.email||c.guest_email||c.last_name||''}));}catch{}
    return out;
  }
  function openSearchResult(r){if(typeof setView==='function')setView(r.view);if(r.view==='books'&&q('#bookSearch')){q('#bookSearch').value=r.query;typeof renderBooks==='function'&&renderBooks()}if(r.view==='orders'&&q('#orderSearch')){q('#orderSearch').value=r.query;typeof renderOrders==='function'&&renderOrders()}if(r.view==='customers'&&q('#customerSearch')){q('#customerSearch').value=r.query;typeof renderCustomers==='function'&&renderCustomers()}const box=q('#adminSearchResults');if(box)box.hidden=true}
  function bindGlobalSearch(){const input=q('#adminGlobalSearch'),box=q('#adminSearchResults');if(!input||!box)return;input.addEventListener('input',()=>{const s=input.value.trim().toLowerCase();if(s.length<2){box.hidden=true;return}const rows=searchable().filter(r=>`${r.label} ${r.sub}`.toLowerCase().includes(s)).slice(0,8);box.innerHTML=rows.length?rows.map((r,i)=>`<div class="admin-search-result" data-i="${i}"><div><strong>${String(r.label).replace(/[<>]/g,'')}</strong><small>${String(r.sub||'').replace(/[<>]/g,'')}</small></div><span class="admin-search-type">${r.type}</span></div>`).join(''):'<div class="admin-search-empty">Nuk u gjet asgjë.</div>';box.hidden=false;[...box.querySelectorAll('.admin-search-result')].forEach((el,i)=>el.onclick=()=>openSearchResult(rows[i]))});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const s=input.value.trim().toLowerCase(),r=searchable().find(x=>`${x.label} ${x.sub}`.toLowerCase().includes(s));if(r)openSearchResult(r)}});document.addEventListener('click',e=>{if(!e.target.closest('.booksto-search'))box.hidden=true})}
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function lastDays(n){const a=[];for(let i=n-1;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);a.push(d)}return a}
  function buildInsights(){const dash=q('#view-dashboard');if(!dash||q('#bookstoInsights'))return;const host=document.createElement('div');host.id='bookstoInsights';host.className='booksto-insight-grid';host.innerHTML=`<section class="booksto-insight"><div class="booksto-insight-head"><h3>Daily Sales</h3><span>7 ditët e fundit</span></div><div class="booksto-insight-body"><div id="bookstoSalesBars" class="sales-bars"></div></div></section><section class="booksto-insight"><div class="booksto-insight-head"><h3>Summary</h3><span>performanca</span></div><div class="booksto-insight-body"><div id="bookstoSummary" class="summary-lines"></div></div></section><section class="booksto-insight"><div class="booksto-insight-head"><h3>AKTIVITETI (SOT)</h3><span>live nga porositë</span></div><div class="booksto-insight-body"><div id="bookstoToday" class="activity-now-number">0</div><div class="activity-now-label">porosi sot</div><div id="bookstoCompare" class="activity-compare"></div><svg id="bookstoSpark" class="sparkline" viewBox="0 0 260 58" preserveAspectRatio="none"><defs><linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13cbb0" stop-opacity=".16"/><stop offset="1" stop-color="#13cbb0" stop-opacity="0"/></linearGradient></defs><polygon class="shade" points="0,58 260,58"/><polyline points="0,40 260,40"/></svg></div></section>`;const head=dash.querySelector('.dashboard-pro-head');if(head)head.insertAdjacentElement('afterend',host);else dash.prepend(host)}
  function renderInsights(){buildInsights();let phys=[],ebooks=[],allBooks=[];try{phys=orders||[]}catch{}try{ebooks=ebookOrders||[]}catch{}try{allBooks=books||[]}catch{}
    const days=lastDays(7),rev=Object.fromEntries(days.map(d=>[dateKey(d),0])),count=Object.fromEntries(days.map(d=>[dateKey(d),0]));
    phys.forEach(o=>{const d=new Date(o.created_at);if(Number.isNaN(+d))return;const k=dateKey(d);if(k in count)count[k]++;if(o.payment_status==='paid'&&o.order_status!=='cancelled'&&k in rev)rev[k]+=Number(o.total||0)});ebooks.forEach(o=>{const d=new Date(o.paid_at||o.created_at);if(Number.isNaN(+d))return;const k=dateKey(d);if(k in count)count[k]++;if(o.payment_status==='paid'&&k in rev)rev[k]+=Number(o.total||0)});
    const max=Math.max(1,...Object.values(rev));const bars=q('#bookstoSalesBars');if(bars)bars.innerHTML=days.map(d=>{const k=dateKey(d),v=rev[k],h=Math.max(v?8:2,(v/max)*100);return `<div class="sales-bar-wrap"><div class="sales-bar" style="height:${h}%" data-value="${v.toFixed(2)} €"></div><span class="sales-day">${new Intl.DateTimeFormat('sq-AL',{weekday:'short'}).format(d).slice(0,2)}</span></div>`}).join('');
    const paid=phys.filter(o=>o.payment_status==='paid'&&o.order_status!=='cancelled').length+ebooks.filter(o=>o.payment_status==='paid').length,total=Math.max(1,phys.filter(o=>o.order_status!=='cancelled').length+ebooks.length),completed=phys.filter(o=>o.order_status==='delivered').length,tracked=allBooks.filter(b=>b.track_stock!==false),healthy=tracked.filter(b=>Number(b.stock_quantity)>Number(b.low_stock_threshold||5)).length;const revenuePct=Math.min(100,Math.round(paid/total*100)),deliveryPct=Math.min(100,Math.round(completed/Math.max(1,phys.length)*100)),stockPct=Math.min(100,Math.round(healthy/Math.max(1,tracked.length)*100));const summary=q('#bookstoSummary');if(summary)summary.innerHTML=[['Income',revenuePct,''],['Porosi të përfunduara',deliveryPct,'orange'],['Stoku',stockPct,'blue']].map(([l,p,c])=>`<div class="summary-line-pro"><div class="summary-line-top"><span>${l}</span><strong>${p}%</strong></div><div class="summary-track"><div class="summary-fill ${c}" style="width:${p}%"></div></div></div>`).join('');
    const today=days[6],yesterday=days[5],weekAgo=days[0],todayN=count[dateKey(today)]||0,yestN=count[dateKey(yesterday)]||0,weekN=count[dateKey(weekAgo)]||0;if(q('#bookstoToday'))q('#bookstoToday').textContent=todayN;const pct=(a,b)=>b?Math.round((a-b)/b*100):(a?100:0);const p1=pct(todayN,yestN),p7=pct(todayN,weekN);if(q('#bookstoCompare'))q('#bookstoCompare').innerHTML=`<div>1 DITË MË PARË &nbsp; <b>${yestN}</b> <span class="${p1>=0?'up':'down'}">${p1>=0?'↑':'↓'} ${Math.abs(p1)}%</span></div><div>1 JAVË MË PARË &nbsp; <b>${weekN}</b> <span class="${p7>=0?'up':'down'}">${p7>=0?'↑':'↓'} ${Math.abs(p7)}%</span></div>`;
    const vals=days.map(d=>count[dateKey(d)]||0),m=Math.max(1,...vals),pts=vals.map((v,i)=>`${i*(260/(vals.length-1))},${48-(v/m)*34}`).join(' '),poly=q('#bookstoSpark polyline'),shade=q('#bookstoSpark polygon');if(poly)poly.setAttribute('points',pts);if(shade)shade.setAttribute('points',`0,58 ${pts} 260,58`);const pending=phys.filter(o=>['pending','confirmed'].includes(o.order_status)).length;if(q('#topPendingBadge'))q('#topPendingBadge').textContent=pending;
  }
  function wrapRender(){try{if(typeof renderDashboard==='function'&&!renderDashboard.__booksto){const core=renderDashboard;const wrapped=function(){const r=core.apply(this,arguments);renderInsights();return r};wrapped.__booksto=true;renderDashboard=wrapped}}catch{} }

  const catEsc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function siteCategoriesFromDom(){return qa('#siteCategoryRows .site-category-row').map(r=>({label:r.querySelector('[data-f="label"]')?.value?.trim()||'',description:r.querySelector('[data-f="description"]')?.value?.trim()||'',href:r.querySelector('[data-f="href"]')?.value?.trim()||'',visible:r.querySelector('[data-f="visible"]')?.checked!==false}))}
  function renderAllSiteCategories(items){const host=q('#siteCategoryRows');if(!host)return;host.innerHTML=(items||[]).map((x,i)=>`<div class="site-category-row" data-category-row="${i}" style="grid-template-columns:34px .9fr 1.2fr 1.35fr 82px 94px"><span class="site-drag">${i+1}</span><input data-f="label" value="${catEsc(x.label)}" placeholder="Kategoria"><input data-f="description" value="${catEsc(x.description)}" placeholder="Përshkrimi"><input data-f="href" value="${catEsc(x.href)}" placeholder="Linku"><label class="site-check"><input data-f="visible" type="checkbox" ${x.visible!==false?'checked':''}> Shfaqe</label><div class="site-row-actions"><button type="button" data-cat-up title="Lart">↑</button><button type="button" data-cat-down title="Poshtë">↓</button><button type="button" data-cat-remove class="danger" title="Fshi">×</button></div></div>`).join('')}
  function moveSiteCategory(i,d){const a=siteCategoriesFromDom(),j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];renderAllSiteCategories(a)}
  function addSiteCategory(){const a=siteCategoriesFromDom();a.push({label:'Kategori e re',description:'',href:'shop.html?category=',visible:true});renderAllSiteCategories(a);const rows=qa('#siteCategoryRows .site-category-row');rows.at(-1)?.querySelector('[data-f="label"]')?.focus()}
  async function syncSiteCategories(){const host=q('#siteCategoryRows');if(!host)return;try{let rows=[];if(typeof api==='function')rows=await api('site_content?key=eq.homepage&select=content&limit=1');else{const r=await fetch('https://ysvtrhizgcioyycwlkrk.supabase.co/rest/v1/site_content?key=eq.homepage&select=content&limit=1',{headers:{apikey:'sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD'}});if(r.ok)rows=await r.json()}const items=rows?.[0]?.content?.home_categories;if(Array.isArray(items))renderAllSiteCategories(items)}catch(e){console.warn('ZemZem categories editor sync failed',e)}}
  function enhanceSiteCategoryEditor(){const host=q('#siteCategoryRows');if(!host||host.dataset.enhanced)return;host.dataset.enhanced='1';const card=host.closest('.site-editor-card'),head=card?.querySelector('.site-card-head');if(head&&!q('#siteAddCategory')){const b=document.createElement('button');b.type='button';b.id='siteAddCategory';b.className='secondary-btn';b.textContent='＋ Shto kategori';head.appendChild(b);b.addEventListener('click',addSiteCategory)}host.addEventListener('click',e=>{const row=e.target.closest('.site-category-row');if(!row)return;const rows=qa('#siteCategoryRows .site-category-row'),i=rows.indexOf(row);if(e.target.closest('[data-cat-up]'))moveSiteCategory(i,-1);else if(e.target.closest('[data-cat-down]'))moveSiteCategory(i,1);else if(e.target.closest('[data-cat-remove]')){const a=siteCategoriesFromDom();a.splice(i,1);renderAllSiteCategories(a)}});const siteBtn=q('[data-view="site"]');if(siteBtn&&!siteBtn.dataset.catSync){siteBtn.dataset.catSync='1';siteBtn.addEventListener('click',()=>setTimeout(syncSiteCategories,320))}const reload=q('#siteReload');if(reload&&!reload.dataset.catSync){reload.dataset.catSync='1';reload.addEventListener('click',()=>setTimeout(syncSiteCategories,500))}}
  function loadBlogModule(){if(!document.querySelector('script[src*="admin-blog.js"]')){const s=document.createElement('script');s.src='assets/js/admin-blog.js?v=4';document.body.appendChild(s)}if(!document.querySelector('script[src*="admin-blog-final.js"]')){const x=document.createElement('script');x.src='assets/js/admin-blog-final.js?v=2';document.body.appendChild(x)}}

  document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{rebuildSidebar();buildTopbar();wrapRender();buildInsights();renderInsights()},0);setTimeout(loadBlogModule,120);setTimeout(enhanceSiteCategoryEditor,280);setTimeout(()=>{const siteBtn=q('[data-view="site"]');if(siteBtn&&!siteBtn.dataset.catSync){enhanceSiteCategoryEditor()}},700)});
})();

;(()=>{
'use strict';
if(window.__zzBookEditorV2)return;window.__zzBookEditorV2=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const groups={
  basic:['bookTitle','bookSku','bookSlug','bookIsbn','bookPrice','bookOldPrice','bookStock','bookStatus','bookAuthor','bookCategory','bookPublisher','bookShort','bookDescription'],
  media:['coverPreview','bookGalleryField','bookCoverMode','book3dFrontPreview','book3dSpinePreview','book3dBackPreview','bookThickness'],
  sales:['bookCostPrice','bookLinkedEbook','bookBundleDiscount','bookBadgeText','bookBadgeStyle','bookOfferEnds','bookLowStock','bookPublishAt','bookUnpublishAt'],
  advanced:['bookLanguage','bookPages','bookReleaseDate','bookCountry','bookDimensions','bookWeight','bookFeatured','bookBestseller','bookPreorder','bookBackorder','bookTrackStock','bookGiftWrap','bookGiftWrapPrice']
};
function fieldFor(id){
 const el=document.getElementById(id);if(!el)return null;
 return el.closest('.field,.checks,.book-3d-admin-block')||el;
}
function ensure(){
 const modal=q('#bookEditorHost .modal-card')||q('#bookModal .modal-card');const form=q('#bookForm');if(!modal||!form||q('#zzBookEditorTabs'))return false;
 modal.classList.add('zz-book-editor-card');
 const tabs=document.createElement('div');tabs.id='zzBookEditorTabs';tabs.className='zz-book-editor-tabs';
 tabs.innerHTML='<button type="button" class="active" data-book-tab="basic">1. Të dhënat bazë</button><button type="button" data-book-tab="media">2. Foto & 3D</button><button type="button" data-book-tab="sales">3. Shitja & Stoku</button><button type="button" data-book-tab="advanced">4. Avancuar</button>';
 form.insertAdjacentElement('beforebegin',tabs);
 const hidden=[...form.children].filter(x=>x.matches('input[type="hidden"]'));
 const actions=q('#bookForm .modal-actions');
 const panels={};
 ['basic','media','sales','advanced'].forEach((k,i)=>{const p=document.createElement('section');p.className='zz-book-editor-panel'+(i?'':' active');p.dataset.panel=k;p.innerHTML='<div class="zz-book-panel-title"><strong>'+({basic:'Të dhënat bazë',media:'Foto & pamja e librit',sales:'Shitja & stoku',advanced:'Opsione të avancuara'}[k])+'</strong><span>'+({basic:'Titulli, çmimi dhe klasifikimi',media:'Kopertina, galeria dhe 3D',sales:'Stoku, badge dhe publikimi',advanced:'Të dhëna shtesë dhe veçori'}[k])+'</span></div><div class="zz-book-panel-grid"></div>';form.insertBefore(p,actions);panels[k]=q('.zz-book-panel-grid',p)});
 const seen=new Set();
 for(const [k,ids] of Object.entries(groups)){for(const id of ids){const f=fieldFor(id);if(f&&!seen.has(f)){panels[k].appendChild(f);seen.add(f)}}}
 // Any remaining visible form fields go to Advanced, but keep hidden inputs/actions untouched.
 [...form.children].forEach(ch=>{if(ch===actions||ch.matches('input[type="hidden"]')||ch.classList.contains('zz-book-editor-panel'))return;if(!seen.has(ch))panels.advanced.appendChild(ch)});
 if(actions){actions.classList.add('zz-book-editor-actions');form.appendChild(actions)}
 tabs.onclick=e=>{const b=e.target.closest('[data-book-tab]');if(!b)return;const key=b.dataset.bookTab;qa('[data-book-tab]',tabs).forEach(x=>x.classList.toggle('active',x===b));qa('.zz-book-editor-panel',form).forEach(p=>p.classList.toggle('active',p.dataset.panel===key));modal.scrollTop=0};
 const openFirst=()=>{const b=q('[data-book-tab="basic"]',tabs);b?.click()};
 q('#newBookBtn')?.addEventListener('click',()=>setTimeout(()=>{openFirst();moveGallery()},30));
 document.addEventListener('click',e=>{if(e.target.closest('[data-book-id]'))setTimeout(()=>{openFirst();moveGallery()},30)});
 return true
}
function moveGallery(){
 const gallery=q('#bookGalleryField');const panel=q('.zz-book-editor-panel[data-panel="media"] .zz-book-panel-grid');
 if(gallery&&panel&&gallery.parentElement!==panel)panel.appendChild(gallery)
}
function boot(){
 let n=0;const t=setInterval(()=>{n++;if(ensure()||n>50)clearInterval(t)},120);
 setTimeout(moveGallery,250);setTimeout(moveGallery,900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();