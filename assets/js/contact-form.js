(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co/functions/v1/contact-message';
const KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
function init(){document.querySelectorAll('[data-zemzem-contact-form]').forEach(form=>{
  if(form.dataset.bound)return;form.dataset.bound='1';
  const status=form.querySelector('[data-contact-status]'),btn=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(form),body={first_name:String(fd.get('first_name')||'').trim(),last_name:String(fd.get('last_name')||'').trim(),email:String(fd.get('email')||'').trim(),message:String(fd.get('message')||'').trim(),website:String(fd.get('website')||''),page:location.pathname.includes('about')?'Rreth nesh':'Kontakt & Ndihmë'};
    if(!body.first_name||!body.last_name||!body.email||body.message.length<10){status.textContent='Plotëso të gjitha fushat dhe shkruaj një mesazh pak më të plotë.';status.className='zz-contact-status error';return}
    btn.disabled=true;btn.dataset.label=btn.textContent;btn.textContent='Duke dërguar…';status.textContent='';status.className='zz-contact-status';
    try{
      const r=await fetch(SB,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
      let d={};try{d=await r.json()}catch{}
      if(!r.ok||!d.ok)throw new Error(d?.error||'SEND_FAILED');
      form.reset();status.textContent='Mesazhi u dërgua me sukses. Do të të përgjigjemi në emailin që ke shkruar.';status.className='zz-contact-status success';
    }catch(err){status.textContent='Mesazhi nuk u dërgua. Provo përsëri pas pak.';status.className='zz-contact-status error'}
    finally{btn.disabled=false;btn.textContent=btn.dataset.label||'Dërgo mesazhin'}
  });
})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();