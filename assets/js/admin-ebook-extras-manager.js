(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',SESSION='zemzem_admin_session';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let data={series:[],series_items:[],bundles:[],bundle_items:[],recommendations:[],books:[]};
function token(){try{return JSON.parse(sessionStorage.getItem(SESSION)||'null')?.access_token||''}catch{return''}}
async function call(action,body={}){const r=await fetch(SB+'/functions/v1/ebook-admin-extras',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify({action,...body}),cache:'no-store'});const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}if(!r.ok)throw new Error(d?.message||d?.error||'Veprimi dështoi');return d}
function toast(msg,err=false){const el=$('#ebookAdminToast');if(el){el.textContent=msg;el.hidden=false;el.classList.toggle('error',err);setTimeout(()=>el.hidden=true,2400)}else alert(msg)}
function optBooks(selected=[]){const set=new Set(selected.map(String));return data.books.map(b=>'<option value="'+b.id+'" '+(set.has(String(b.id))?'selected':'')+'>'+esc(b.title)+' — '+esc(b.author_name||'')+'</option>').join('')}
function selected(sel){return [...sel.selectedOptions].map(o=>o.value)}
function render(){
 const root=$('#ebookExtrasManager');if(!root)return;
 root.innerHTML=`
 <div class="ebook-extra-manager-grid">
   <section class="ebook-extra-manager-card">
     <h3>Seri eBook</h3>
     <form id="seriesForm" class="ebook-extra-manager-form">
       <input id="seriesId" type="hidden">
       <label>Emri<input id="seriesName" required placeholder="p.sh. Koleksioni i Akides"></label>
       <label>Përshkrimi<textarea id="seriesDescription" rows="3"></textarea></label>
       <label>eBook-at në seri<select id="seriesBooks" multiple size="8">${optBooks()}</select></label>
       <div><button class="ebook-primary" type="submit">Ruaj serinë</button> <button class="ebook-secondary" id="seriesReset" type="button">E re</button></div>
     </form>
     <div class="ebook-extra-list">${data.series.length?data.series.map(s=>{const n=data.series_items.filter(x=>x.series_id===s.id).length;return '<button type="button" data-edit-series="'+s.id+'"><b>'+esc(s.name)+'</b><span>'+n+' eBook</span></button>'}).join(''):'<p>Ende nuk ka seri.</p>'}</div>
   </section>

   <section class="ebook-extra-manager-card">
     <h3>Bundles eBook</h3>
     <form id="bundleForm" class="ebook-extra-manager-form">
       <input id="bundleId" type="hidden">
       <label>Titulli<input id="bundleTitle" required placeholder="p.sh. Paketa 3 libra"></label>
       <div class="two"><label>Çmimi €<input id="bundlePrice" type="number" min="0" step="0.01" required></label><label>Çmimi i vjetër €<input id="bundleCompare" type="number" min="0" step="0.01"></label></div>
       <label>Përshkrimi<textarea id="bundleDescription" rows="3"></textarea></label>
       <label>eBook-at në bundle<select id="bundleBooks" multiple size="8">${optBooks()}</select></label>
       <label class="check"><input id="bundleActive" type="checkbox" checked> Aktiv</label>
       <div><button class="ebook-primary" type="submit">Ruaj bundle</button> <button class="ebook-secondary" id="bundleReset" type="button">I ri</button></div>
     </form>
     <div class="ebook-extra-list">${data.bundles.length?data.bundles.map(b=>{const n=data.bundle_items.filter(x=>x.bundle_id===b.id).length;return '<button type="button" data-edit-bundle="'+b.id+'"><b>'+esc(b.title)+'</b><span>'+n+' eBook · '+Number(b.bundle_price||0).toFixed(2)+' €</span></button>'}).join(''):'<p>Ende nuk ka bundle.</p>'}</div>
   </section>

   <section class="ebook-extra-manager-card">
     <h3>Rekomandime manuale</h3>
     <form id="recommendForm" class="ebook-extra-manager-form">
       <label>eBook kryesor<select id="recommendSource" required><option value="">— Zgjidh —</option>${data.books.map(b=>'<option value="'+b.id+'">'+esc(b.title)+'</option>').join('')}</select></label>
       <label>Rekomando këto eBook<select id="recommendBooks" multiple size="10">${optBooks()}</select></label>
       <button class="ebook-primary" type="submit">Ruaj rekomandimet</button>
     </form>
     <p class="ebook-extra-help">Nëse nuk vendos rekomandime manuale, storefront-i mund të përdorë rekomandime automatike kur ka të dhëna të mjaftueshme.</p>
   </section>
 </div>`;
 bind();
}
function resetSeries(){ $('#seriesId').value='';$('#seriesName').value='';$('#seriesDescription').value='';[...$('#seriesBooks').options].forEach(o=>o.selected=false)}
function resetBundle(){ $('#bundleId').value='';$('#bundleTitle').value='';$('#bundlePrice').value='';$('#bundleCompare').value='';$('#bundleDescription').value='';$('#bundleActive').checked=true;[...$('#bundleBooks').options].forEach(o=>o.selected=false)}
function bind(){
 $('#seriesForm').onsubmit=async e=>{e.preventDefault();try{const saved=await call('save_series',{id:$('#seriesId').value||null,name:$('#seriesName').value.trim(),description:$('#seriesDescription').value.trim()});const id=saved.row?.id||$('#seriesId').value;await call('set_series_items',{series_id:id,ebook_ids:selected($('#seriesBooks'))});toast('Seria u ruajt');await load()}catch(err){toast(err.message,true)}};
 $('#bundleForm').onsubmit=async e=>{e.preventDefault();try{const saved=await call('save_bundle',{id:$('#bundleId').value||null,title:$('#bundleTitle').value.trim(),bundle_price:$('#bundlePrice').value,compare_at_price:$('#bundleCompare').value||null,description:$('#bundleDescription').value.trim(),is_active:$('#bundleActive').checked});const id=saved.row?.id||$('#bundleId').value;await call('set_bundle_items',{bundle_id:id,ebook_ids:selected($('#bundleBooks'))});toast('Bundle u ruajt');await load()}catch(err){toast(err.message,true)}};
 $('#recommendForm').onsubmit=async e=>{e.preventDefault();try{await call('set_recommendations',{ebook_id:$('#recommendSource').value,recommended_ids:selected($('#recommendBooks'))});toast('Rekomandimet u ruajtën');await load()}catch(err){toast(err.message,true)}};
 $('#seriesReset').onclick=resetSeries;$('#bundleReset').onclick=resetBundle;
 document.querySelectorAll('[data-edit-series]').forEach(btn=>btn.onclick=()=>{const s=data.series.find(x=>x.id===btn.dataset.editSeries);if(!s)return;$('#seriesId').value=s.id;$('#seriesName').value=s.name||'';$('#seriesDescription').value=s.description||'';const ids=data.series_items.filter(x=>x.series_id===s.id).map(x=>String(x.ebook_id));[...$('#seriesBooks').options].forEach(o=>o.selected=ids.includes(o.value));$('#seriesForm').scrollIntoView({behavior:'smooth',block:'center'})});
 document.querySelectorAll('[data-edit-bundle]').forEach(btn=>btn.onclick=()=>{const b=data.bundles.find(x=>x.id===btn.dataset.editBundle);if(!b)return;$('#bundleId').value=b.id;$('#bundleTitle').value=b.title||'';$('#bundlePrice').value=b.bundle_price??'';$('#bundleCompare').value=b.compare_at_price??'';$('#bundleDescription').value=b.description||'';$('#bundleActive').checked=b.is_active!==false;const ids=data.bundle_items.filter(x=>x.bundle_id===b.id).map(x=>String(x.ebook_id));[...$('#bundleBooks').options].forEach(o=>o.selected=ids.includes(o.value));$('#bundleForm').scrollIntoView({behavior:'smooth',block:'center'})});
 $('#recommendSource').onchange=()=>{const id=$('#recommendSource').value,ids=data.recommendations.filter(x=>x.ebook_id===id&&x.is_manual).map(x=>String(x.recommended_ebook_id));[...$('#recommendBooks').options].forEach(o=>o.selected=ids.includes(o.value)&&o.value!==id)};
}
async function load(){try{data=await call('overview');render()}catch(err){const r=$('#ebookExtrasManager');if(r)r.innerHTML='<div class="ebook-admin-empty">'+esc(err.message)+'</div>'}}
function init(){
 const tab=$('#ebookTab-features .ebook-feature-groups');if(!tab||$('#ebookExtrasManager'))return;
 tab.insertAdjacentHTML('afterend','<div class="ebook-panel" style="margin-top:18px"><div class="ebook-panel-head"><div><h2>Menaxhim: Seri, Bundles & Rekomandime</h2><p>Krijo lidhjet që shfaqen në storefront.</p></div></div><div id="ebookExtrasManager"><div class="ebook-admin-empty">Po ngarkohet…</div></div></div>');
 load();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));
})();