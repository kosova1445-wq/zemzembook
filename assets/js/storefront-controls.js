(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
let cfg={flags:{},shipping:[]};
function enabled(k,def=true){const x=cfg.flags?.[k];return x?x.enabled!==false:def}
async function load(){
 try{
  const r=await fetch(SB+'/rest/v1/rpc/storefront_runtime_config_v1',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:'{}',cache:'no-store'});
  if(r.ok)cfg=await r.json()||cfg;
 }catch{}
 apply();
 window.ZemZemRuntimeConfig=cfg;
 window.dispatchEvent(new CustomEvent('zemzem:runtime-config',{detail:cfg}));
}
function etaText(){
 const sel=document.querySelector('#country'),cc=sel?.value||'KS',z=(cfg.shipping||[]).find(x=>x.country_code===cc);
 if(!z)return '';
 const a=Number(z.eta_min_days||0),b=Number(z.eta_max_days||0);
 if(!a&&!b)return '';
 return a===b?'Dorëzimi i pritshëm: '+a+' ditë pune':'Dorëzimi i pritshëm: '+a+'–'+b+' ditë pune';
}
function ensureEta(){
 if(!/checkout\.html$/i.test(location.pathname))return;
 let box=document.querySelector('#zzDeliveryEta');
 if(!box){
  box=document.createElement('div');box.id='zzDeliveryEta';box.style.cssText='margin:10px 0;padding:10px 12px;border:1px solid #dfe8e3;border-radius:9px;background:#f5faf7;font-size:12px;font-weight:700;color:#315744';
  const target=document.querySelector('.pay-options')||document.querySelector('#checkoutForm');
  target?.insertAdjacentElement('beforebegin',box);
 }
 box.textContent=etaText()||'Koha e dorëzimit llogaritet sipas shtetit.';
}
function apply(){
 document.documentElement.dataset.zzFlagsReady='1';
 const cod=document.querySelector('input[name="payment_method"][value="cod"]')?.closest('.pay-option');
 const pp=document.querySelector('input[name="payment_method"][value="paypal"]')?.closest('.pay-option');
 if(cod)cod.hidden=!enabled('cod',true);
 if(pp)pp.hidden=!enabled('paypal',true);
 const selected=document.querySelector('input[name="payment_method"]:checked');
 if(selected?.closest('.pay-option')?.hidden){
  const alt=[...document.querySelectorAll('input[name="payment_method"]')].find(x=>!x.closest('.pay-option')?.hidden);
  if(alt){alt.checked=true;alt.dispatchEvent(new Event('change',{bubbles:true}))}
 }
 ensureEta();
 document.querySelector('#country')?.addEventListener('change',ensureEta,{passive:true});
 document.querySelectorAll('[data-feature-flag]').forEach(el=>{el.hidden=!enabled(el.dataset.featureFlag,true)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();