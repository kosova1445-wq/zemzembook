(()=>{
  const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
  const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
  const defaults={
    hero_label_1:'ZemZem Select',hero_label_2:'Editor’s Pick',hero_label_3:'Featured',
    mega_categories_kicker:'Shfleto koleksionet',mega_categories_title:'Kategoritë',
    mega_picks_kicker:'Përzgjedhja ZemZem',mega_picks_title:'Të rekomanduara',
    digital_kicker:'ZemZem Digital',digital_title:'Lexo në formatin që të përshtatet.',
    digital_description:'Libra fizikë për bibliotekën tënde dhe eBook për qasje të menjëhershme nga llogaria ZemZem.',
    featured_kicker:'Featured Collection',featured_title:'Një koleksion që meriton vend në bibliotekë.',
    featured_description:'Një përzgjedhje vizuale me titujt më të veçuar të katalogut.',
    editorial_kicker:'ZemZem Editorial',editorial_title:'Jo vetëm dyqan. Një vend ku libri prezantohet me peshën që meriton.',
    editorial_description:'Ballina ndërtohet si një ekspozitë editoriale: koleksione të kuruara, tituj të zgjedhur, përmbajtje nga Blogu dhe qasje e drejtpërdrejtë te libri fizik ose digjital.'
  };
  let labels={...defaults};
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  function setText(sel,value,root=document){const el=q(sel,root);if(el&&value!==undefined&&value!==null)el.textContent=String(value)}
  function apply(){
    const hero=[labels.hero_label_1,labels.hero_label_2,labels.hero_label_3];
    qa('.home-slide .wow-hero-label').forEach((el,i)=>{if(hero[i])el.textContent=hero[i]});
    const panels=qa('.mega-menu .mega-panel');
    if(panels[0]){setText('.mega-eyebrow',labels.mega_categories_kicker,panels[0]);setText('.mega-title',labels.mega_categories_title,panels[0])}
    if(panels[1]){setText('.mega-eyebrow',labels.mega_picks_kicker,panels[1]);setText('.mega-title',labels.mega_picks_title,panels[1])}
    if(panels[2]){setText('.mega-eyebrow',labels.digital_kicker,panels[2]);setText('h3',labels.digital_title,panels[2]);setText('p',labels.digital_description,panels[2])}
    const feat=q('#wowFeatured');
    if(feat){setText('.section-kicker',labels.featured_kicker,feat);setText('.wow-featured-copy h2',labels.featured_title,feat);setText('.wow-featured-copy p',labels.featured_description,feat)}
    const editorial=q('#wowEditorial');
    if(editorial){setText('.section-kicker',labels.editorial_kicker,editorial);setText('.wow-editorial-copy h2',labels.editorial_title,editorial);setText('.wow-editorial-copy p',labels.editorial_description,editorial)}
  }
  async function load(){
    try{
      const r=await fetch(`${SB_URL}/rest/v1/site_content?key=eq.home_labels&select=content&limit=1`,{headers:{apikey:SB_KEY},cache:'no-store'});
      if(r.ok){const rows=await r.json();labels={...defaults,...(rows?.[0]?.content||{})}}
    }catch{}
    apply();
    let n=0;const t=setInterval(()=>{apply();if(++n>12)clearInterval(t)},500);
    if('MutationObserver'in window){const mo=new MutationObserver(()=>apply());mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),12000)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
