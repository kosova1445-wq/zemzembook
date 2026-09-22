(()=>{
'use strict';
let rows=[],reports=[],filter='pending',loaded=false;
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const labels={pending:'Në pritje',approved:'Aprovuar',rejected:'Refuzuar'};
async function load(){
  if(!window.api)return;
  const [bookRows,reportRows]=await Promise.all([window.api('free_library_books?select=*&order=created_at.desc&limit=1000'),window.api('rpc/admin_free_library_reports',{method:'POST',body:{}})]);
  rows=bookRows||[];reports=reportRows||[];
  loaded=true; ensureReportsPanel(); render(); renderReports(); updateBadge();
}
function ensureReportsPanel(){const view=q('#view-free-library');if(!view||q('#freeLibraryReportsPanel'))return;view.insertAdjacentHTML('beforeend','<section class="panel" id="freeLibraryReportsPanel" style="margin-top:18px"><div class="panel-head"><div><h2>Raportet & Copyright</h2><p>Probleme të raportuara nga vizitorët për PDF-të publike.</p></div><span class="status-pill status-pending" id="freeLibraryReportsCount">0 në pritje</span></div><div class="table-wrap"><table><thead><tr><th>Libri</th><th>Arsyeja</th><th>Detaje</th><th>Data</th><th>Veprimet</th></tr></thead><tbody id="freeLibraryReportsBody"></tbody></table></div><div id="freeLibraryReportsEmpty" class="empty-state" hidden>Nuk ka raporte.</div></section>')}
const reportLabels={copyright:'Copyright',broken_file:'PDF nuk hapet',wrong_metadata:'Të dhëna të pasakta',inappropriate:'Përmbajtje e papërshtatshme',other:'Tjetër'};
function renderReports(){ensureReportsPanel();const body=q('#freeLibraryReportsBody');if(!body)return;const pending=reports.filter(r=>r.status==='pending').length;const count=q('#freeLibraryReportsCount');if(count)count.textContent=pending+' në pritje';body.innerHTML=reports.map(r=>'<tr><td><strong>'+esc(r.book_title||'—')+'</strong><div class="muted-small">'+esc(r.reporter_email||'Anonim')+'</div></td><td>'+esc(reportLabels[r.reason]||r.reason)+'</td><td>'+esc((r.details||'—').slice(0,180))+'</td><td>'+new Date(r.created_at).toLocaleString('sq-AL')+'</td><td><div class="table-actions">'+(r.status==='pending'?'<button class="table-action" data-fl-report-action="'+r.id+'" data-status="actioned">Trajtuar</button><button class="table-action" data-fl-report-action="'+r.id+'" data-status="dismissed">Mbyll</button>':'<span class="status-pill status-'+esc(r.status)+'">'+esc(r.status)+'</span>')+'</div></td></tr>').join('');q('#freeLibraryReportsEmpty').hidden=!!reports.length;qa('[data-fl-report-action]').forEach(b=>b.onclick=()=>reviewReport(b.dataset.flReportAction,b.dataset.status))}
async function reviewReport(id,status){const note=prompt('Shënim administrativ (opsionale):','')||null;try{await window.api('rpc/admin_review_free_library_report',{method:'POST',body:{p_report_id:id,p_status:status,p_admin_note:note}});await load();window.toast?.('Raporti u përditësua')}catch(e){window.toast?.(e.message,'error')}}
function updateBadge(){
  const n=rows.filter(x=>x.status==='pending').length,b=q('#freeLibraryPendingBadge');
  if(!b)return;b.textContent=n;b.hidden=!n;
}
function pill(s){return '<span class="status-pill status-'+esc(s)+'">'+esc(labels[s]||s)+'</span>'}
function render(){
  const body=q('#freeLibraryAdminBody'); if(!body)return;
  const list=rows.filter(x=>filter==='all'||x.status===filter);
  body.innerHTML=list.map(r=>'<tr><td><strong>'+esc(r.title)+'</strong><div class="muted-small">'+esc(r.original_filename||'')+'</div></td><td>'+esc(r.author_name||'—')+'<div class="muted-small">'+esc(r.category||'Pa kategori')+'</div></td><td>'+new Date(r.created_at).toLocaleString('sq-AL')+'</td><td>'+pill(r.status)+'</td><td><div class="table-actions"><button class="table-action" data-fl-preview="'+r.id+'">PDF</button>'+(r.status!=='approved'?'<button class="table-action" data-fl-approve="'+r.id+'">Aprovo</button>':'')+(r.status!=='rejected'?'<button class="table-action danger" data-fl-reject="'+r.id+'">Refuzo</button>':'')+'</div></td></tr>').join('');
  q('#freeLibraryAdminEmpty').hidden=!!list.length;
  qa('[data-fl-approve]').forEach(b=>b.onclick=()=>setStatus(b.dataset.flApprove,'approved'));
  qa('[data-fl-reject]').forEach(b=>b.onclick=()=>setStatus(b.dataset.flReject,'rejected'));
  qa('[data-fl-preview]').forEach(b=>b.onclick=()=>preview(b.dataset.flPreview));
}
async function setStatus(id,status){
  const note=status==='rejected'?(prompt('Arsyeja e refuzimit (opsionale):','')||null):null;
  try{
    await window.api('free_library_books?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:{status,admin_note:note,approved_at:status==='approved'?new Date().toISOString():null,updated_at:new Date().toISOString()},prefer:'return=minimal'});
    await load(); if(typeof window.toast==='function')window.toast(status==='approved'?'PDF u aprovua':'PDF u refuzua');
  }catch(e){if(typeof window.toast==='function')window.toast(e.message,'error');else alert(e.message)}
}
async function preview(id){
  const r=rows.find(x=>x.id===id); if(!r)return;
  try{
    const s=JSON.parse(sessionStorage.getItem('zemzem_admin_session')||'null');
    if(!s?.access_token)throw new Error('Sesioni ka skaduar');
    const path=r.pdf_path.split('/').map(encodeURIComponent).join('/');
    const res=await fetch('https://ysvtrhizgcioyycwlkrk.supabase.co/storage/v1/object/authenticated/free-library-pdfs/'+path,{headers:{apikey:'sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',Authorization:'Bearer '+s.access_token}});
    if(!res.ok)throw new Error('PDF nuk u hap.');
    const blob=await res.blob(),url=URL.createObjectURL(blob);window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(e){if(typeof window.toast==='function')window.toast(e.message,'error');else alert(e.message)}
}
function bind(){
  q('#freeLibraryRefresh')?.addEventListener('click',load);
  qa('[data-fl-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.flFilter;qa('[data-fl-filter]').forEach(x=>x.classList.toggle('active',x===b));render()}));
  q('[data-view="free-library"]')?.addEventListener('click',()=>{if(!loaded)load().catch(e=>window.toast?.(e.message,'error'))});
  const tryInitial=()=>{if(window.ZemZemAdminAccess&&!loaded)load().catch(()=>{})};
  setTimeout(tryInitial,800);setTimeout(tryInitial,2200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();