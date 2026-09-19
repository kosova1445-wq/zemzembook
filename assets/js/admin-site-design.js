(()=>{
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const defaults={
    menu_colors:['#ffe8df','#e7f2ff','#eee8ff','#fff4c7','#e5f5e7','#e4f6f5'],
    category_colors:['#ffe4d9','#e2efff','#fff0b8','#def0e1','#dff1f1','#e8e0fb'],
    feature_colors:['#dfefff','#ddf4e7','#ffe7d4'],
    why_colors:['#ffdcd0','#fff0aa','#dcecff','#e7ddff'],
    rail_colors:['#ffd8cb','#ffedab','#dce9fb','#e5def8'],
    hover_strength:'vivid',
    hero_background:'library',
    hero_tint:'#f3cfc5',
    hero_shelf_opacity:22,
    collection_rail:[{icon:'−10%',label:'Oferta',subtitle:'Kurse me PayPal',href:'#oferta',visible:true},{icon:'✦',label:'Të sapoardhurat',subtitle:'Titujt më të rinj',href:'#new-arrivals',visible:true},{icon:'★',label:'Më të shiturit',subtitle:'Zgjedhjet e lexuesve',href:'#bestsellers',visible:true},{icon:'◈',label:'Zgjedhja ZemZem',subtitle:'Përzgjedhur me kujdes',href:'#trending',visible:true}]
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const colorBlock=(id,label,arr)=>'<div class="site-field"><label>'+label+'</label><div class="site-design-colors" id="'+id+'">'+arr.map((v,i)=>'<label class="site-design-color"><input type="color" value="'+esc(v)+'"><span>Ngjyra '+(i+1)+'</span></label>').join('')+'</div></div>';
  function injectStyle(){
    if(q('#siteDesignAdminStyle'))return;
    document.head.insertAdjacentHTML('beforeend',`<style id="siteDesignAdminStyle">
      .site-design-card{grid-column:span 2}.site-design-colors{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:9px}.site-design-color{display:grid;grid-template-columns:42px 1fr;gap:8px;align-items:center;padding:8px;border:1px solid #edf1f4;border-radius:7px;background:#fbfcfd}.site-design-color input{width:42px;height:36px;padding:2px;border:1px solid #dfe7eb;border-radius:6px;background:#fff}.site-design-color span{font-size:10px;font-weight:800;color:#667786}.site-design-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.site-design-range{display:grid;grid-template-columns:1fr 54px;gap:8px;align-items:center}.site-design-range output{font-size:11px;font-weight:800;color:#536574;text-align:right}.site-rail-row{display:grid;grid-template-columns:48px 1fr 1.2fr 1.2fr 86px 90px;gap:8px;align-items:center;padding:9px;border:1px solid #edf1f4;border-radius:7px;background:#fbfcfd}.site-rail-row input{width:100%;border:1px solid #e2e8ec;background:#fff;border-radius:6px;padding:9px 10px;font-size:11px}.site-rail-actions{display:flex;gap:5px}.site-rail-actions button{width:26px;height:26px;border:1px solid #e3e9ed;background:#fff;border-radius:5px}.site-rail-row .site-check{margin:0}@media(max-width:1150px){.site-design-colors{grid-template-columns:repeat(3,1fr)}}@media(max-width:820px){.site-design-card{grid-column:auto}.site-design-colors{grid-template-columns:repeat(2,1fr)}.site-design-two{grid-template-columns:1fr}.site-rail-row{grid-template-columns:44px 1fr 1fr}.site-rail-row input[data-rail='href']{grid-column:2/4}.site-rail-row .site-check,.site-rail-actions{grid-column:2/4}}
    </style>`);
  }
  function readColors(id){return qa('#'+id+' input[type=color]').map(x=>x.value)}
  function railData(){return qa('#siteRailRows .site-rail-row').map(r=>({icon:r.querySelector('[data-rail="icon"]').value.trim(),label:r.querySelector('[data-rail="label"]').value.trim(),subtitle:r.querySelector('[data-rail="subtitle"]').value.trim(),href:r.querySelector('[data-rail="href"]').value.trim(),visible:r.querySelector('[data-rail="visible"]').checked})).filter(x=>x.label)}
  function renderRail(items){const box=q('#siteRailRows');if(!box)return;const arr=Array.isArray(items)?items:defaults.collection_rail;box.innerHTML=arr.map((x,i)=>`<div class="site-rail-row"><input data-rail="icon" value="${esc(x.icon||'')}"><input data-rail="label" value="${esc(x.label||'')}"><input data-rail="subtitle" value="${esc(x.subtitle||'')}"><input data-rail="href" value="${esc(x.href||'')}"><label class="site-check"><input data-rail="visible" type="checkbox" ${x.visible!==false?'checked':''}> Shfaqe</label><div class="site-rail-actions"><button type="button" data-up>↑</button><button type="button" data-down>↓</button></div></div>`).join('');qa('#siteRailRows .site-rail-row').forEach((r,i)=>{r.querySelector('[data-up]').onclick=()=>moveRail(i,-1);r.querySelector('[data-down]').onclick=()=>moveRail(i,1)})}
  function moveRail(i,d){const a=railData(),j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];renderRail(a)}
  function collect(){
    return{
      menu_colors:readColors('siteDesignMenu'),
      category_colors:readColors('siteDesignCategories'),
      feature_colors:readColors('siteDesignFeatures'),
      why_colors:readColors('siteDesignWhy'),
      rail_colors:readColors('siteDesignRail'),
      hover_strength:q('#siteDesignHover')?.value||'vivid',
      hero_background:q('#siteDesignHeroMode')?.value||'library',
      hero_tint:q('#siteDesignHeroTint')?.value||'#f3cfc5',
      hero_shelf_opacity:Number(q('#siteDesignShelf')?.value||22),
      collection_rail:railData()
    }
  }
  function applyControls(d){
    d={...defaults,...(d||{})};
    const set=(id,a)=>qa('#'+id+' input[type=color]').forEach((x,i)=>x.value=a?.[i]||defaults[id==='siteDesignMenu'?'menu_colors':id==='siteDesignCategories'?'category_colors':id==='siteDesignFeatures'?'feature_colors':id==='siteDesignWhy'?'why_colors':'rail_colors'][i]||'#ffffff');
    set('siteDesignMenu',d.menu_colors);set('siteDesignCategories',d.category_colors);set('siteDesignFeatures',d.feature_colors);set('siteDesignWhy',d.why_colors);set('siteDesignRail',d.rail_colors);
    if(q('#siteDesignHover'))q('#siteDesignHover').value=d.hover_strength||'vivid';
    if(q('#siteDesignHeroMode'))q('#siteDesignHeroMode').value=d.hero_background||'library';
    if(q('#siteDesignHeroTint'))q('#siteDesignHeroTint').value=d.hero_tint||'#f3cfc5';
    if(q('#siteDesignShelf')){q('#siteDesignShelf').value=Number(d.hero_shelf_opacity??22);q('#siteDesignShelfOut').textContent=q('#siteDesignShelf').value+'%'};renderRail(d.collection_rail||defaults.collection_rail)
  }
  async function loadDesign(){
    try{
      const rows=await window.api('site_content?key=eq.homepage&select=content&limit=1');
      applyControls(rows?.[0]?.content?.design||defaults);
    }catch(e){console.warn('Design config load failed',e)}
  }
  async function saveDesign(){
    try{
      const rows=await window.api('site_content?key=eq.homepage&select=content&limit=1');
      const cfg=collect();const content={...(rows?.[0]?.content||{}),design:{...cfg,collection_rail:undefined},collection_rail:cfg.collection_rail};
      await window.api('site_content?key=eq.homepage',{method:'PATCH',body:{content,updated_at:new Date().toISOString()},prefer:'return=minimal'});
      if(typeof window.toast==='function')window.toast('Dizajni i ballinës u ruajt');
    }catch(e){
      if(typeof window.toast==='function')window.toast('Dizajni nuk u ruajt: '+e.message,'error');
    }
  }
  function injectCard(){
    const grid=q('#view-site .site-editor-grid');if(!grid||q('#siteDesignCard'))return false;
    injectStyle();
    const card=document.createElement('article');card.id='siteDesignCard';card.className='site-editor-card site-design-card';
    card.innerHTML='<div class="site-card-head"><div><h3>Dizajni i Ballinës</h3><p>Ndrysho ngjyrat, hover-in dhe sfondin e hero-s pa prekur kodin.</p></div></div>'+
      colorBlock('siteDesignMenu','Menuja lart – 6 ngjyra',defaults.menu_colors)+
      colorBlock('siteDesignCategories','Kategoritë majtas – 6 ngjyra',defaults.category_colors)+
      colorBlock('siteDesignFeatures','3 kutitë informative',defaults.feature_colors)+
      colorBlock('siteDesignWhy','4 kutitë “Pse ZemZem?”',defaults.why_colors)+
      colorBlock('siteDesignRail','4 kutitë e koleksioneve',defaults.rail_colors)+
      '<div class="site-field"><label>Përmbajtja e shiritit të koleksioneve</label><div id="siteRailRows" class="site-repeat"></div></div>'+
      '<div class="site-design-two"><div class="site-field"><label>Efekti kur kalon kursori</label><select id="siteDesignHover"><option value="soft">I butë</option><option value="vivid">I ndezur</option><option value="strong">Shumë i ndezur</option></select></div><div class="site-field"><label>Sfondi i hero-s</label><select id="siteDesignHeroMode"><option value="library">Bibliotekë e hijezuar</option><option value="soft">Gradient i butë</option><option value="plain">Ngjyrë e pastër</option></select></div></div>'+
      '<div class="site-design-two"><div class="site-field"><label>Ngjyra bazë e hero-s</label><input id="siteDesignHeroTint" type="color" value="#f3cfc5"></div><div class="site-field"><label>Intensiteti i rafteve</label><div class="site-design-range"><input id="siteDesignShelf" type="range" min="0" max="50" step="1" value="22"><output id="siteDesignShelfOut">22%</output></div></div></div>';
    grid.appendChild(card);
    q('#siteDesignShelf').addEventListener('input',e=>q('#siteDesignShelfOut').textContent=e.target.value+'%');
    loadDesign();
    return true;
  }
  function wrapSave(id){
    const b=q(id);if(!b||b.dataset.designWrapped)return;
    const old=b.onclick;
    b.onclick=async function(e){if(old)await old.call(this,e);await saveDesign()};
    b.dataset.designWrapped='1';
  }
  function wrapReload(){
    const b=q('#siteReload');if(!b||b.dataset.designWrapped)return;
    const old=b.onclick;
    b.onclick=async function(e){if(old)await old.call(this,e);await loadDesign()};
    b.dataset.designWrapped='1';
  }
  function boot(){
    const timer=setInterval(()=>{
      if(injectCard()){
        wrapSave('#siteSaveTop');wrapSave('#siteSaveBottom');wrapReload();
        clearInterval(timer);
      }
    },120);
    setTimeout(()=>clearInterval(timer),12000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();