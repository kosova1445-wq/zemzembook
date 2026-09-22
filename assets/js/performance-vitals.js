(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const sent=new Set();
const device=matchMedia('(max-width:700px)').matches?'mobile':'desktop';
function rating(name,v){if(name==='LCP')return v<=2500?'good':v<=4000?'needs-improvement':'poor';if(name==='INP')return v<=200?'good':v<=500?'needs-improvement':'poor';if(name==='CLS')return v<=.1?'good':v<=.25?'needs-improvement':'poor';if(name==='TTFB')return v<=800?'good':v<=1800?'needs-improvement':'poor';return''}
function send(metric,value){if(!Number.isFinite(value)||value<0||sent.has(metric))return;sent.add(metric);fetch(SB+'/rest/v1/web_vitals',{method:'POST',keepalive:true,headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({metric,value:Number(value.toFixed(metric==='CLS'?4:1)),rating:rating(metric,value),page_path:location.pathname,device})}).catch(()=>{})}
try{const nav=performance.getEntriesByType('navigation')[0];if(nav)send('TTFB',nav.responseStart)}catch{}
let lcp=0,cls=0,inp=0;
try{new PerformanceObserver(l=>{for(const e of l.getEntries())lcp=Math.max(lcp,e.startTime)}).observe({type:'largest-contentful-paint',buffered:true})}catch{}
try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)cls+=e.value}).observe({type:'layout-shift',buffered:true})}catch{}
try{new PerformanceObserver(l=>{for(const e of l.getEntries())inp=Math.max(inp,e.duration||0)}).observe({type:'event',buffered:true,durationThreshold:40})}catch{}
function flush(){send('LCP',lcp);send('CLS',cls);if(inp)send('INP',inp)}
addEventListener('pagehide',flush,{once:true});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()},{once:true});
})();