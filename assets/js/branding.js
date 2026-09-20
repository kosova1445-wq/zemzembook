(()=>{
  if(!document.querySelector('script[data-runtime-storefront]')){const s=document.createElement('script');s.src='assets/js/runtime-storefront.js?v=1';s.defer=true;s.dataset.runtimeStorefront='1';document.head.appendChild(s)}
  'use strict';
  const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
  const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
  const defaults={
    logo_url:'assets/brand/zemzem-logo.svg',mobile_logo_url:'',
    watermark_url:'assets/brand/zemzem-watermark.svg',
    logo_width:206,logo_height:58,
    logo_mobile_width:240,logo_mobile_height:70,
    footer_logo_width:206,footer_logo_height:58,
    watermark_enabled:true,watermark_size:34,watermark_opacity:20,
    watermark_position:'bottom-right',
    menu_font_desktop:13,menu_font_tablet:12,menu_font_mobile:11
  };
  const clamp=(v,min,max,fallback)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};
  const safeUrl=v=>{const s=String(v||'').trim();if(!s)return'';if(/^https:\/\//i.test(s)||/^assets\//i.test(s)||/^\.\.?\//.test(s)||/^data:image\/(?:png|jpeg|webp|svg\+xml);base64,/i.test(s))return s;return''};
  const cssUrl=v=>`url("${String(v||'').replace(/["\\\n\r]/g,'')}")`;
  function apply(raw={}){
    const c={...defaults,...raw};
    const root=document.documentElement.style;
    const logo=safeUrl(c.logo_url)||defaults.logo_url;
    const mobileLogo=safeUrl(c.mobile_logo_url)||logo;
    const wm=safeUrl(c.watermark_url)||logo||defaults.watermark_url;
    root.setProperty('--zemzem-logo-bg',cssUrl(logo));
    root.setProperty('--zemzem-mobile-logo-bg',cssUrl(mobileLogo));
    root.setProperty('--zemzem-watermark-bg',cssUrl(wm));
    root.setProperty('--zemzem-logo-width',clamp(c.logo_width,120,360,206)+'px');
    root.setProperty('--zemzem-logo-height',clamp(c.logo_height,40,140,58)+'px');
    root.setProperty('--zemzem-mobile-logo-width',clamp(c.logo_mobile_width,140,360,240)+'px');
    root.setProperty('--zemzem-mobile-logo-height',clamp(c.logo_mobile_height,45,160,70)+'px');
    root.setProperty('--zemzem-footer-logo-width',clamp(c.footer_logo_width,120,360,206)+'px');
    root.setProperty('--zemzem-footer-logo-height',clamp(c.footer_logo_height,40,140,58)+'px');
    root.setProperty('--zemzem-watermark-size',clamp(c.watermark_size,10,70,34)+'%');
    root.setProperty('--zemzem-watermark-opacity',(clamp(c.watermark_opacity,0,70,20)/100).toFixed(2));
    root.setProperty('--zemzem-watermark-display',c.watermark_enabled===false?'none':'block');
    root.setProperty('--zemzem-menu-font-desktop',clamp(c.menu_font_desktop,10,24,13)+'px');
    root.setProperty('--zemzem-menu-font-tablet',clamp(c.menu_font_tablet,9,22,12)+'px');
    root.setProperty('--zemzem-menu-font-mobile',clamp(c.menu_font_mobile,9,20,11)+'px');
    let menuStyle=document.getElementById('zemzemMenuTypography');if(!menuStyle){menuStyle=document.createElement('style');menuStyle.id='zemzemMenuTypography';document.head.appendChild(menuStyle)}
    menuStyle.textContent=`.nav-row>a,.nav-row .category-trigger,.simple-head nav a{font-size:var(--zemzem-menu-font-desktop)!important}@media (min-width:721px) and (max-width:1024px){.nav-row>a,.nav-row .category-trigger,.simple-head nav a{font-size:var(--zemzem-menu-font-tablet)!important}}@media (max-width:720px){.nav-row>a,.nav-row .category-trigger,.simple-head nav a,.zz-mobile-links a,.zz-mobile-categories a,.zz-mobile-dock small{font-size:var(--zemzem-menu-font-mobile)!important}}`;
    let mobileBrandStyle=document.getElementById('zemzemMobileBranding');if(!mobileBrandStyle){mobileBrandStyle=document.createElement('style');mobileBrandStyle.id='zemzemMobileBranding';document.head.appendChild(mobileBrandStyle)}
    mobileBrandStyle.textContent=`@media(max-width:720px){.brand{width:var(--zemzem-mobile-logo-width)!important;min-width:0!important;height:var(--zemzem-mobile-logo-height)!important;padding:0!important;background-color:#fff!important;background-image:var(--zemzem-mobile-logo-bg)!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important;overflow:hidden!important}.brand .brand-mark,.brand>span:last-child{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}}`;
    const pos=['bottom-right','bottom-left','top-right','top-left','center'].includes(c.watermark_position)?c.watermark_position:'bottom-right';
    document.documentElement.dataset.zemzemWatermarkPosition=pos;
    window.ZemZemBranding=c;
    window.dispatchEvent(new CustomEvent('zemzem:branding-ready',{detail:c}));
  }
  async function load(){
    try{
      const r=await fetch(`${SB_URL}/rest/v1/site_content?key=eq.branding&select=content&limit=1`,{headers:{apikey:SB_KEY,Accept:'application/json'},cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const rows=await r.json();
      apply(rows?.[0]?.content||defaults);
    }catch(e){console.warn('ZemZem branding fallback',e);apply(defaults)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
