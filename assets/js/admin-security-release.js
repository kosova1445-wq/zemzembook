(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const GITHUB='https://github.com/kosova1445-wq/zemzembook';

function style(){
 if(q('#zzSecurityReleaseStyle'))return;
 document.head.insertAdjacentHTML('beforeend',`<style id="zzSecurityReleaseStyle">
 .zz-sec-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}.zz-sec-card{background:#fff;border:1px solid #e4ebe7;border-radius:14px;padding:15px}.zz-sec-card span{display:block;font-size:11px;color:#78857f}.zz-sec-card strong{display:block;margin-top:6px;font-size:22px;color:#203847}.zz-sec-ok{color:#177245!important}.zz-sec-warn{color:#a15c00!important}.zz-release{display:grid;grid-template-columns:1fr 1fr;gap:14px}.zz-release-box{background:#fff;border:1px solid #e4ebe7;border-radius:14px;padding:16px}.zz-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;word-break:break-all;background:#f6f8f7;padding:9px;border-radius:9px}.zz-sec-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.zz-vital-row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #edf1ef}.zz-vital-row:last-child{border-bottom:0}.zz-vital-row small{color:#7d8983}.zz-backup-row{display:grid;grid-template-columns:1fr auto;gap:12px;padding:9px 0;border-bottom:1px solid #edf1ef}@media(max-width:900px){.zz-sec-grid{grid-template-columns:1fr 1fr}.zz-release{grid-template-columns:1fr}}@media(max-width:560px){.zz-sec-grid{grid-template-columns:1fr}}
 </style>`);
}
function build(){
 if(q('#view-security-release'))return;
 style();
 const side=q('.side-nav');
 if(side&&!q('[data-view="security-release"]')){
   const b=document.createElement('button');b.className='nav-item';b.dataset.view='security-release';b.innerHTML='🛡 Siguria & Releases';
   side.appendChild(b); b.addEventListener('click',()=>openView());
 }
 const main=q('.main'); if(!main)return;
 main.insertAdjacentHTML('beforeend',`<section id="view-security-release" class="view">
   <div class="dashboard-pro-head"><div><h2>Siguria & Releases</h2><p>Monitorim i sigurisë, Core Web Vitals, backup dhe kthim te release-i i mëparshëm.</p></div><button class="secondary-btn" id="zzSecRefresh">Rifresko</button></div>
   <div id="zzSecCards" class="zz-sec-grid"><div class="zz-sec-card">Duke kontrolluar…</div></div>
   <div class="zz-release">
    <section class="zz-release-box"><h3>Core Web Vitals · 7 ditët e fundit</h3><div id="zzVitals">—</div></section>
    <section class="zz-release-box"><h3>Release live</h3><div id="zzReleaseLive">—</div><div class="zz-sec-actions"><a class="secondary-btn" href="${GITHUB}/actions/workflows/rollback.yml" target="_blank" rel="noopener">↩ Hap Rollback</a><a class="secondary-btn" href="${GITHUB}/actions" target="_blank" rel="noopener">GitHub Actions</a></div></section>
    <section class="zz-release-box"><h3>Backup konfigurimi</h3><div class="zz-sec-actions"><button class="primary-btn" id="zzCreateBackup">Krijo backup tani</button></div><div id="zzBackups" style="margin-top:12px">—</div></section>
    <section class="zz-release-box"><h3>Release-i i mëparshëm</h3><div id="zzReleasePrevious">—</div><p style="font-size:11px;color:#78857f">Rollback-u bëhet nga workflow i dedikuar dhe kërkon SHA-n e release-it të mëparshëm.</p></section>
   </div>
 </section>`);
 q('#zzSecRefresh')?.addEventListener('click',load);
 q('#zzCreateBackup')?.addEventListener('click',createBackup);
}
function openView(){
 if(typeof window.setView==='function')window.setView('security-release');
 else {qa('.view').forEach(x=>x.classList.remove('active-view'));q('#view-security-release')?.classList.add('active-view')}
 const t=q('#viewTitle');if(t)t.textContent='Siguria & Releases';load();
}
const fmt=d=>d?new Date(d).toLocaleString('sq-AL'):'—';
async function load(){
 try{
   const s=await window.api('rpc/admin_security_snapshot_v1',{method:'POST',body:{}});
   const cards=[
    ['RLS pa mbrojtje',Number(s.rls_disabled_public_tables||0),Number(s.rls_disabled_public_tables||0)===0],
    ['RPC privileged anon',Number(s.anon_security_definer_functions||0),Number(s.anon_security_definer_functions||0)===0],
    ['Sesione të reja · 24h',Number(s.sessions_24h||0),true],
    ['Auth events · 24h',Number(s.auth_events_24h||0),true],
    ['Veprime Admin · 24h',Number(s.admin_actions_24h||0),true],
    ['Backup gjithsej',Number(s.backup_count||0),true]
   ];
   q('#zzSecCards').innerHTML=cards.map(x=>`<div class="zz-sec-card"><span>${esc(x[0])}</span><strong class="${x[2]?'zz-sec-ok':'zz-sec-warn'}">${esc(x[1])}</strong></div>`).join('');
   const v=s.web_vitals_7d||{}, order=['LCP','INP','CLS','TTFB'];
   q('#zzVitals').innerHTML=order.map(k=>{const x=v[k];return `<div class="zz-vital-row"><span><strong>${k}</strong><br><small>${x?Number(x.samples||0):0} mostra</small></span><strong>${x?(k==='CLS'?Number(x.p75).toFixed(3):Math.round(Number(x.p75))+' ms'):'—'}</strong></div>`}).join('');
   const [live,history,backs]=await Promise.all([
    fetch('release.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
    fetch('release-history.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
    window.api('admin_backups?select=id,backup_type,created_at&order=created_at.desc&limit=5').catch(()=>[])
   ]);
   q('#zzReleaseLive').innerHTML=live?`<div class="zz-code">${esc(live.sha||'—')}</div><p style="font-size:11px;color:#78857f">Deploy: ${esc(fmt(live.deployed_at))} · Run #${esc(live.run_id||'—')}</p>`:'Release manifest nuk u lexua.';
   const prev=Array.isArray(history)?history.find(x=>x.sha&&x.sha!==live?.sha):null;
   q('#zzReleasePrevious').innerHTML=prev?`<div class="zz-code">${esc(prev.sha)}</div><p style="font-size:11px;color:#78857f">${esc(fmt(prev.deployed_at))}</p>`:'Ende nuk ka release të mëparshëm në histori.';
   q('#zzBackups').innerHTML=(backs||[]).length?(backs||[]).map(b=>`<div class="zz-backup-row"><span>${esc(b.backup_type||'config')}<br><small>${esc(fmt(b.created_at))}</small></span><span class="zz-code">${esc(String(b.id).slice(0,8))}</span></div>`).join(''):'Nuk ka backup.';
 }catch(e){q('#zzSecCards').innerHTML='<div class="zz-sec-card zz-sec-warn">'+esc(e.message||e)+'</div>'}
}
async function createBackup(){
 const b=q('#zzCreateBackup');if(!b)return;const old=b.textContent;b.disabled=true;b.textContent='Duke krijuar…';
 try{await window.api('rpc/admin_create_config_backup_v1',{method:'POST',body:{}});if(typeof toast==='function')toast('Backup u krijua.');await load()}catch(e){if(typeof toast==='function')toast(e.message,'error')}
 finally{b.disabled=false;b.textContent=old}
}
function init(){build();window.addEventListener('zemzem:admin-access-ready',()=>{build();if(window.ZemZemAdminAccess?.authorized)load()});setTimeout(build,600)}
document.addEventListener('DOMContentLoaded',init);
})();