(()=>{
  'use strict';
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const defaults={
    logo_url:'assets/brand/zemzem-logo.svg',mobile_logo_url:'',admin_logo_url:'',partner_logo_url:'',watermark_url:'assets/brand/zemzem-watermark.svg',
    logo_width:206,logo_height:58,logo_mobile_width:240,logo_mobile_height:70,admin_logo_width:152,partner_logo_width:142,
    footer_logo_width:206,footer_logo_height:58,watermark_enabled:true,
    watermark_size:34,watermark_opacity:20,watermark_position:'bottom-right',
    menu_font_desktop:13,menu_font_tablet:12,menu_font_mobile:11
  };
  let current={...defaults},logoFile=null,mobileLogoFile=null,adminLogoFile=null,partnerLogoFile=null,watermarkFile=null,logoObjectUrl='',mobileLogoObjectUrl='',adminLogoObjectUrl='',partnerLogoObjectUrl='',watermarkObjectUrl='';
  const num=(id,fallback)=>{const n=Number(q(id)?.value);return Number.isFinite(n)?n:fallback};
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||min));
  const publicAssetUrl=path=>`${SB_URL}/storage/v1/object/public/site-branding/${path.split('/').map(encodeURIComponent).join('/')}`;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function buildView(){
    if(q('#view-branding'))return;
    q('.main')?.insertAdjacentHTML('beforeend',`<section id="view-branding" class="view brand-admin-view">
      <div class="brand-admin-head"><div><div class="eyebrow">IDENTITETI I FAQES</div><h2>Logo & Brand</h2><p>Ndrysho logon, madhësinë dhe watermark-un e librave pa ndryshuar kodin.</p></div><div class="brand-admin-actions"><a class="secondary-btn" href="index.html" target="_blank" rel="noopener">↗ Shiko faqen</a><button class="primary-btn" id="brandSaveTop">Ruaj & apliko</button></div></div>
      <div id="brandStatus" class="brand-admin-status">Duke u përgatitur…</div>
      <div class="brand-admin-grid">
        <article class="brand-admin-card brand-main-card">
          <div class="brand-card-head"><div><h3>Logoja kryesore</h3><p>PNG, JPG, WebP ose SVG · maksimumi 5 MB.</p></div></div>
          <div class="brand-logo-preview-shell"><div id="brandLogoPreview" class="brand-logo-preview"><img alt="Logo preview"></div></div>
          <label class="brand-upload"><span>Zgjidh logo të re</span><input id="brandLogoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          <div class="brand-dim-grid">
            <label>Desktop — gjerësi (px)<input id="brandLogoWidth" type="number" min="120" max="360" step="1"></label>
            <label>Desktop — lartësi (px)<input id="brandLogoHeight" type="number" min="40" max="140" step="1"></label>
            <label>Footer — gjerësi (px)<input id="brandFooterWidth" type="number" min="120" max="360" step="1"></label>
            <label>Footer — lartësi (px)<input id="brandFooterHeight" type="number" min="40" max="140" step="1"></label>
          </div>
          <div style="margin-top:20px;padding-top:18px;border-top:1px solid #e8eeee">
            <div class="brand-card-head"><div><h3>Logo vetëm për telefon</h3><p>Kjo logo shfaqet vetëm në mobile. Desktopi dhe tableti nuk ndryshojnë.</p></div></div>
            <div class="brand-logo-preview-shell"><div id="brandMobileLogoPreview" class="brand-logo-preview"><img alt="Mobile logo preview"></div></div>
            <label class="brand-upload"><span>Zgjidh logo mobile të re</span><input id="brandMobileLogoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
            <div class="brand-dim-grid">
              <label>Mobile — gjerësi (px)<input id="brandMobileWidth" type="number" min="140" max="360" step="1"></label>
              <label>Mobile — lartësi (px)<input id="brandMobileHeight" type="number" min="45" max="160" step="1"></label>
            </div>
          </div>
        </article>
        <article class="brand-admin-card">
          <div class="brand-card-head"><div><h3>Logoja e Adminit</h3><p>Logo e veçantë për panelin e administrimit. Rekomandohet PNG/WebP/SVG me sfond transparent.</p></div></div>
          <div class="brand-logo-preview-shell brand-admin-logo-shell"><div id="brandAdminLogoPreview" class="brand-logo-preview brand-admin-logo-preview"><img alt="Admin logo preview"></div></div>
          <label class="brand-upload"><span>Zgjidh logo të re për Admin</span><input id="brandAdminLogoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          <div class="brand-dim-grid">
            <label>Gjerësia në sidebar (px)<input id="brandAdminLogoWidth" type="number" min="90" max="210" step="1"></label>
          </div>
          <p class="muted-small" style="margin:10px 0 0">Nëse nuk ngarkon logo të veçantë, përdoret logoja kryesore.</p>
        </article>
        <article class="brand-admin-card">
          <div class="brand-card-head"><div><h3>Logoja e Partnerëve</h3><p>Logo e veçantë për portalin e librarive partnere. Nëse nuk ngarkon një të tillë, përdoret logoja kryesore.</p></div></div>
          <div class="brand-logo-preview-shell brand-partner-logo-shell"><div id="brandPartnerLogoPreview" class="brand-logo-preview brand-partner-logo-preview"><img alt="Partner logo preview"></div></div>
          <label class="brand-upload"><span>Zgjidh logo të re për Partner</span><input id="brandPartnerLogoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          <div class="brand-dim-grid">
            <label>Gjerësia në portal (px)<input id="brandPartnerLogoWidth" type="number" min="90" max="260" step="1"></label>
          </div>
          <p class="muted-small" style="margin:10px 0 0">Kjo logo shfaqet në krye dhe në footer të faqes partner.html.</p>
        </article>
        <article class="brand-admin-card">
          <div class="brand-card-head"><div><h3>Logo e hijezuar në libra</h3><p>Aplikohet automatikisht edhe te librat dhe eBook-at që shtohen më vonë.</p></div></div>
          <label class="brand-toggle"><input id="brandWatermarkEnabled" type="checkbox"> <span>Shfaq watermark në kopertina</span></label>
          <label class="brand-toggle"><input id="brandSameWatermark" type="checkbox"> <span>Përdor të njëjtën logo si watermark</span></label>
          <label class="brand-upload secondary"><span>Logo tjetër vetëm për watermark</span><input id="brandWatermarkFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          <div class="brand-range-row"><label>Madhësia <strong id="brandWmSizeOut">34%</strong></label><input id="brandWmSize" type="range" min="10" max="70" step="1"></div>
          <div class="brand-range-row"><label>Hijezimi / transparenca <strong id="brandWmOpacityOut">20%</strong></label><input id="brandWmOpacity" type="range" min="0" max="70" step="1"></div>
          <label class="brand-select-label">Pozicioni<select id="brandWmPosition"><option value="bottom-right">Poshtë djathtas</option><option value="bottom-left">Poshtë majtas</option><option value="top-right">Lart djathtas</option><option value="top-left">Lart majtas</option><option value="center">Në qendër</option></select></label>
          <div class="brand-book-preview"><div class="brand-book-fake"><span>LIBËR</span><img id="brandWmPreview" alt="Watermark preview"></div></div>
        </article>
        <article class="brand-admin-card" style="grid-column:1/-1">
          <div class="brand-card-head"><div><h3>Shkronjat e menusë</h3><p>Rregullo madhësinë e tekstit të menusë veçmas për kompjuter, tablet dhe telefon. Vlen në të gjitha faqet publike.</p></div></div>
          <div class="brand-dim-grid">
            <label>Kompjuter — madhësia (px)<input id="brandMenuDesktop" type="number" min="10" max="24" step="1"></label>
            <label>Tablet — madhësia (px)<input id="brandMenuTablet" type="number" min="9" max="22" step="1"></label>
            <label>Telefon — madhësia (px)<input id="brandMenuMobile" type="number" min="9" max="20" step="1"></label>
          </div>
          <div id="brandMenuPreview" style="margin-top:14px;padding:14px 16px;border:1px solid #e7edef;border-radius:10px;background:#fafcfc;color:#2e4052;font-weight:800">Ballina · Libra fizikë · eBook · Oferta · Blog · Rreth nesh</div>
        </article>
      </div>
      <div class="brand-admin-footer"><button class="secondary-btn" id="brandReset">Kthe vlerat zyrtare</button><div><button class="secondary-btn" id="brandReload">Rikthe nga databaza</button> <button class="primary-btn" id="brandSaveBottom">Ruaj & apliko</button></div></div>
    </section>`);
  }

  function addNav(){
    const side=q('.side-nav');if(!side)return;
    let b=q('[data-view="branding"]');
    if(!b){b=document.createElement('button');b.type='button';b.className='nav-item';b.dataset.view='branding';b.innerHTML='<span class="side-menu-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v14H4z"/><path d="M8 15l2.5-3 2 2 3.5-4 4 5"/><circle cx="9" cy="9" r="1.3"/></svg></span><span>Logo & Brand</span>';const site=q('[data-view="site"]');if(site)site.insertAdjacentElement('afterend',b);else side.appendChild(b)}
    if(!b.dataset.brandingBound){b.dataset.brandingBound='1';b.addEventListener('click',async()=>{if(typeof setView==='function')setView('branding');const t=q('#viewTitle');if(t)t.textContent='Logo & Brand';await loadConfig()})}
  }

  function setStatus(text,type='ready'){const e=q('#brandStatus');if(!e)return;e.textContent=text;e.className='brand-admin-status '+type}
  function setInput(id,val){const e=q(id);if(e)e.value=val}
  function imgPreviewUrl(kind){
    if(kind==='logo'&&logoObjectUrl)return logoObjectUrl;
    if(kind==='mobile'&&mobileLogoObjectUrl)return mobileLogoObjectUrl;
    if(kind==='admin'&&adminLogoObjectUrl)return adminLogoObjectUrl;
    if(kind==='partner'&&partnerLogoObjectUrl)return partnerLogoObjectUrl;
    if(kind==='watermark'&&q('#brandSameWatermark')?.checked)return logoObjectUrl||current.logo_url;
    if(kind==='watermark'&&watermarkObjectUrl)return watermarkObjectUrl;
    if(kind==='mobile')return current.mobile_logo_url||current.logo_url;
    if(kind==='admin')return current.admin_logo_url||current.logo_url;
    if(kind==='partner')return current.partner_logo_url||current.logo_url;
    return kind==='logo'?current.logo_url:current.watermark_url;
  }
  function positionWatermark(box,pos){
    box.style.left=box.style.right=box.style.top=box.style.bottom='auto';box.style.transform='none';
    if(pos==='bottom-left'){box.style.left='10px';box.style.bottom='10px'}
    else if(pos==='top-right'){box.style.right='10px';box.style.top='10px'}
    else if(pos==='top-left'){box.style.left='10px';box.style.top='10px'}
    else if(pos==='center'){box.style.left='50%';box.style.top='50%';box.style.transform='translate(-50%,-50%)'}
    else{box.style.right='10px';box.style.bottom='10px'}
  }
  function preview(){
    const logo=q('#brandLogoPreview'),logoImg=logo?.querySelector('img');if(logo&&logoImg){logo.style.width=clamp(num('#brandLogoWidth',206),120,360)+'px';logo.style.height=clamp(num('#brandLogoHeight',58),40,140)+'px';logoImg.src=imgPreviewUrl('logo')}const mobile=q('#brandMobileLogoPreview'),mobileImg=mobile?.querySelector('img');if(mobile&&mobileImg){mobile.style.width=clamp(num('#brandMobileWidth',240),140,360)+'px';mobile.style.height=clamp(num('#brandMobileHeight',70),45,160)+'px';mobileImg.src=imgPreviewUrl('mobile')}const adminLogo=q('#brandAdminLogoPreview'),adminLogoImg=adminLogo?.querySelector('img');if(adminLogo&&adminLogoImg){adminLogo.style.width=clamp(num('#brandAdminLogoWidth',152),90,210)+'px';adminLogoImg.src=imgPreviewUrl('admin')}const partnerLogo=q('#brandPartnerLogoPreview'),partnerLogoImg=partnerLogo?.querySelector('img');if(partnerLogo&&partnerLogoImg){partnerLogo.style.width=clamp(num('#brandPartnerLogoWidth',142),90,260)+'px';partnerLogoImg.src=imgPreviewUrl('partner')}applyAdminSidebarBrand();
    const size=clamp(num('#brandWmSize',34),10,70),opacity=clamp(num('#brandWmOpacity',20),0,70),outS=q('#brandWmSizeOut'),outO=q('#brandWmOpacityOut');if(outS)outS.textContent=size+'%';if(outO)outO.textContent=opacity+'%';
    const wm=q('#brandWmPreview'),fake=q('.brand-book-fake');if(wm&&fake){wm.src=imgPreviewUrl('watermark');wm.style.width=size+'%';wm.style.opacity=(opacity/100).toFixed(2);wm.style.display=q('#brandWatermarkEnabled')?.checked?'block':'none';positionWatermark(wm,q('#brandWmPosition')?.value||'bottom-right')}const mp=q('#brandMenuPreview');if(mp)mp.style.fontSize=clamp(num('#brandMenuDesktop',13),10,24)+'px'
  }
  function applyAdminSidebarBrand(){
    const url=adminLogoObjectUrl||current.admin_logo_url||current.logo_url||defaults.logo_url;
    const width=clamp(num('#brandAdminLogoWidth',current.admin_logo_width||152),90,210);
    qa('[data-admin-brand-image]').forEach(img=>{img.src=url;img.style.width=width+'px';img.style.height='auto'});
  }
  async function loadAdminSidebarBrand(){
    try{const rows=await api('site_content?key=eq.branding&select=content&limit=1');current={...defaults,...(rows?.[0]?.content||{})};applyAdminSidebarBrand()}catch{applyAdminSidebarBrand()}
  }
  function fill(c){
    current={...defaults,...(c||{})};
    setInput('#brandLogoWidth',current.logo_width);setInput('#brandLogoHeight',current.logo_height);setInput('#brandAdminLogoWidth',current.admin_logo_width||152);setInput('#brandPartnerLogoWidth',current.partner_logo_width||142);setInput('#brandMobileWidth',current.logo_mobile_width);setInput('#brandMobileHeight',current.logo_mobile_height);setInput('#brandFooterWidth',current.footer_logo_width);setInput('#brandFooterHeight',current.footer_logo_height);setInput('#brandWmSize',current.watermark_size);setInput('#brandWmOpacity',current.watermark_opacity);setInput('#brandWmPosition',current.watermark_position);setInput('#brandMenuDesktop',current.menu_font_desktop);setInput('#brandMenuTablet',current.menu_font_tablet);setInput('#brandMenuMobile',current.menu_font_mobile);
    q('#brandWatermarkEnabled').checked=current.watermark_enabled!==false;
    q('#brandSameWatermark').checked=String(current.watermark_url||'')===String(current.logo_url||'');
    logoFile=mobileLogoFile=adminLogoFile=partnerLogoFile=watermarkFile=null;if(logoObjectUrl)URL.revokeObjectURL(logoObjectUrl);if(mobileLogoObjectUrl)URL.revokeObjectURL(mobileLogoObjectUrl);if(adminLogoObjectUrl)URL.revokeObjectURL(adminLogoObjectUrl);if(partnerLogoObjectUrl)URL.revokeObjectURL(partnerLogoObjectUrl);if(watermarkObjectUrl)URL.revokeObjectURL(watermarkObjectUrl);logoObjectUrl=mobileLogoObjectUrl=adminLogoObjectUrl=partnerLogoObjectUrl=watermarkObjectUrl='';
    q('#brandLogoFile').value='';q('#brandMobileLogoFile').value='';q('#brandAdminLogoFile').value='';q('#brandPartnerLogoFile').value='';q('#brandWatermarkFile').value='';preview();setStatus('Gati për ndryshime. Ndryshimet aplikohen menjëherë pasi t’i ruash.');
  }
  async function loadConfig(){
    setStatus('Duke ngarkuar…','');
    try{const rows=await api('site_content?key=eq.branding&select=content,updated_at&limit=1');fill(rows?.[0]?.content||defaults)}catch(e){setStatus('Nuk u ngarkua: '+e.message,'error');if(typeof toast==='function')toast(e.message,'error')}
  }
  async function upload(file,kind){
    if(!file)return'';
    if(file.size>5*1024*1024)throw new Error('Skedari duhet të jetë maksimumi 5 MB.');
    const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];if(!allowed.includes(file.type))throw new Error('Lejohen PNG, JPG, WebP ose SVG.');
    if(!await ensureSession())throw new Error('Sesioni ka skaduar');
    const ext=({"image/png":'png',"image/jpeg":'jpg',"image/webp":'webp',"image/svg+xml":'svg'})[file.type]||'png';
    const rand=crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2);const path=`${kind}/${Date.now()}-${rand}.${ext}`;
    const r=await fetch(`${SB_URL}/storage/v1/object/site-branding/${path}`,{method:'POST',headers:{apikey:SB_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':file.type,'x-upsert':'false','cache-control':'3600'},body:file});
    const text=await r.text();if(!r.ok){let d={};try{d=JSON.parse(text)}catch{}throw new Error(d.message||d.error||`Upload dështoi (${r.status})`)}return publicAssetUrl(path);
  }
  function gather(){return{
    logo_url:current.logo_url||defaults.logo_url,mobile_logo_url:current.mobile_logo_url||'',admin_logo_url:current.admin_logo_url||'',partner_logo_url:current.partner_logo_url||'',watermark_url:current.watermark_url||defaults.watermark_url,
    logo_width:clamp(num('#brandLogoWidth',206),120,360),logo_height:clamp(num('#brandLogoHeight',58),40,140),
    logo_mobile_width:clamp(num('#brandMobileWidth',240),140,360),logo_mobile_height:clamp(num('#brandMobileHeight',70),45,160),admin_logo_width:clamp(num('#brandAdminLogoWidth',152),90,210),partner_logo_width:clamp(num('#brandPartnerLogoWidth',142),90,260),
    footer_logo_width:clamp(num('#brandFooterWidth',206),120,360),footer_logo_height:clamp(num('#brandFooterHeight',58),40,140),
    watermark_enabled:!!q('#brandWatermarkEnabled')?.checked,watermark_size:clamp(num('#brandWmSize',34),10,70),watermark_opacity:clamp(num('#brandWmOpacity',20),0,70),watermark_position:q('#brandWmPosition')?.value||'bottom-right',menu_font_desktop:clamp(num('#brandMenuDesktop',13),10,24),menu_font_tablet:clamp(num('#brandMenuTablet',12),9,22),menu_font_mobile:clamp(num('#brandMenuMobile',11),9,20)
  }}
  async function save(){
    const buttons=[q('#brandSaveTop'),q('#brandSaveBottom')].filter(Boolean);buttons.forEach(b=>b.disabled=true);setStatus('Duke ruajtur dhe aplikuar…','');
    try{
      const cfg=gather();
      if(logoFile)cfg.logo_url=await upload(logoFile,'logo');
      if(mobileLogoFile)cfg.mobile_logo_url=await upload(mobileLogoFile,'mobile-logo');
      if(adminLogoFile)cfg.admin_logo_url=await upload(adminLogoFile,'admin-logo');
      if(partnerLogoFile)cfg.partner_logo_url=await upload(partnerLogoFile,'partner-logo');
      if(q('#brandSameWatermark')?.checked)cfg.watermark_url=cfg.logo_url;
      else if(watermarkFile)cfg.watermark_url=await upload(watermarkFile,'watermark');
      await api('site_content?key=eq.branding',{method:'PATCH',body:{content:cfg,updated_at:new Date().toISOString()},prefer:'return=minimal'});
      current={...cfg};fill(current);setStatus('U ruajt. Logoja dhe dimensionet janë aplikuar në faqe.','ready');if(typeof toast==='function')toast('Logo & Brand u ruajtën');
    }catch(e){setStatus('Ruajtja dështoi: '+e.message,'error');if(typeof toast==='function')toast(e.message,'error')}finally{buttons.forEach(b=>b.disabled=false)}
  }
  function reset(){fill(defaults);setStatus('Vlerat zyrtare u vendosën në formular. Kliko “Ruaj & apliko” për t’i aktivizuar.','ready')}
  function bind(){
    q('#brandSaveTop').onclick=save;q('#brandSaveBottom').onclick=save;q('#brandReload').onclick=loadConfig;q('#brandReset').onclick=reset;
    q('#brandLogoFile').addEventListener('change',e=>{logoFile=e.target.files?.[0]||null;if(logoObjectUrl)URL.revokeObjectURL(logoObjectUrl);logoObjectUrl=logoFile?URL.createObjectURL(logoFile):'';preview()});
    q('#brandMobileLogoFile').addEventListener('change',e=>{mobileLogoFile=e.target.files?.[0]||null;if(mobileLogoObjectUrl)URL.revokeObjectURL(mobileLogoObjectUrl);mobileLogoObjectUrl=mobileLogoFile?URL.createObjectURL(mobileLogoFile):'';preview()});
    q('#brandAdminLogoFile').addEventListener('change',e=>{adminLogoFile=e.target.files?.[0]||null;if(adminLogoObjectUrl)URL.revokeObjectURL(adminLogoObjectUrl);adminLogoObjectUrl=adminLogoFile?URL.createObjectURL(adminLogoFile):'';preview()});
    q('#brandPartnerLogoFile').addEventListener('change',e=>{partnerLogoFile=e.target.files?.[0]||null;if(partnerLogoObjectUrl)URL.revokeObjectURL(partnerLogoObjectUrl);partnerLogoObjectUrl=partnerLogoFile?URL.createObjectURL(partnerLogoFile):'';preview()});
    q('#brandWatermarkFile').addEventListener('change',e=>{watermarkFile=e.target.files?.[0]||null;if(watermarkObjectUrl)URL.revokeObjectURL(watermarkObjectUrl);watermarkObjectUrl=watermarkFile?URL.createObjectURL(watermarkFile):'';q('#brandSameWatermark').checked=false;preview()});
    ['#brandLogoWidth','#brandLogoHeight','#brandAdminLogoWidth','#brandPartnerLogoWidth','#brandMobileWidth','#brandMobileHeight','#brandFooterWidth','#brandFooterHeight','#brandWmSize','#brandWmOpacity','#brandWmPosition','#brandWatermarkEnabled','#brandSameWatermark','#brandMenuDesktop','#brandMenuTablet','#brandMenuMobile'].forEach(id=>q(id)?.addEventListener('input',preview));
    q('#brandSameWatermark')?.addEventListener('change',preview);
  }
  function init(){buildView();addNav();bind();loadAdminSidebarBrand();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));else setTimeout(init,180);
})();
