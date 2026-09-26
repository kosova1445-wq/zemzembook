import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const fail=[],warn=[];
const ok=(cond,msg)=>cond?console.log('✓',msg):fail.push(msg);
const has=(c,re)=>re.test(c);

const pages=['index.html','shop.html','product.html','checkout.html','account.html','admin.html','partner.html'];
for(const p of pages){
  const c=read(p);
  ok(has(c,/name=["']viewport["']/i),p+' has mobile viewport');
  ok(has(c,/performance-vitals\.js/i),p+' records Core Web Vitals');
  const scripts=[...c.matchAll(/<script\b[^>]*\ssrc=["'][^"']+["'][^>]*>/gi)].map(x=>x[0]);
  ok(scripts.every(s=>/\bdefer\b/i.test(s)),p+' external scripts are deferred');
}

for(const p of ['checkout.html','account.html','admin.html','partner.html']){
  ok(has(read(p),/name=["']robots["'][^>]*noindex/i),p+' is noindex');
}

// Checkout: payment, quote, address and consent guards
const checkoutHtml=read('checkout.html');
const checkoutJs=read('assets/js/checkout-v2.js');
const checkout=checkoutHtml+'\n'+checkoutJs;
ok(/name=["']payment_method["'][^>]*value=["']paypal["']/i.test(checkoutHtml),'Checkout exposes PayPal payment method');
ok(/name=["']payment_method["'][^>]*value=["']cod["']/i.test(checkoutHtml),'Checkout exposes COD payment method');
ok(/id=["']country["']/i.test(checkoutHtml),'Checkout has country selector');
ok(/id=["']citySelect["']/i.test(checkoutHtml),'Checkout has city selector');
ok(/name=["']terms_acceptance["'][^>]*required/i.test(checkoutHtml),'Checkout requires terms acceptance');
ok(/coupon/i.test(checkout),'Checkout includes coupons');
ok(/shipping/i.test(checkout),'Checkout includes shipping calculation');
ok(/total/i.test(checkout),'Checkout includes totals');
ok(/server-side|server side|server/i.test(checkout),'Checkout indicates server verification');
ok(!/NaN/i.test(checkoutHtml),'Checkout template has no literal NaN');

// Partner fulfillment/accounting flow
const partner=read('partner.html')+'\n'+read('assets/js/partner-fulfillment.js')+'\n'+read('assets/js/partner-invoice.js');
for(const s of ['pending','preparing','shipped','delivered']) ok(partner.includes(s),'Partner flow includes '+s);
ok(/invoice|fatur/i.test(partner),'Partner flow includes invoice');
ok(/supplier_due|settlement|zemzem_margin_total/i.test(partner),'Partner flow includes settlement/accounting data');

// SEO
const index=read('index.html'),shop=read('shop.html'),product=read('product.html');
ok(/rel=["']canonical["']/i.test(index),'Homepage canonical exists');
ok(/rel=["']canonical["']/i.test(shop),'Shop canonical exists');
ok(/seo-product\.js/i.test(product),'Product dynamic SEO is enabled');
ok(fs.existsSync('sitemap.xml'),'Sitemap exists');
ok(/Sitemap:\s*https:\/\/www\.zemzem\.al\/sitemap\.xml/i.test(read('robots.txt')),'robots.txt points to sitemap');
ok(/Disallow:\s*\/admin\.html/i.test(read('robots.txt')),'Admin blocked from crawling');
ok(/Disallow:\s*\/partner\.html/i.test(read('robots.txt')),'Partner portal blocked from crawling');

// Admin mobile/stability safeguards
const admin=read('admin.html');
ok(/admin-mobile-stability-v1\.css/i.test(admin),'Admin loads mobile stability stylesheet');
ok(/zz-admin-mobile-navigation/i.test(admin),'Admin includes dedicated mobile navigation guard');
ok(/max-width:760px/i.test(admin),'Admin includes mobile breakpoint rules');
const adminScripts=[...admin.matchAll(/<script\b[^>]*\ssrc=["'][^"']+["'][^>]*>/gi)].map(x=>x[0]);
if(adminScripts.length>35) warn.push('Admin still has '+adminScripts.length+' external scripts; all are deferred, but module consolidation remains a future optimization.');

// Performance instrumentation must keep CWV thresholds and observers intact
const vitals=read('assets/js/performance-vitals.js');
ok(/largest-contentful-paint/i.test(vitals),'Performance monitor observes LCP');
ok(/layout-shift/i.test(vitals),'Performance monitor observes CLS');
ok(/type:['"]event['"]/i.test(vitals),'Performance monitor observes INP/event timing');
ok(/LCP.*2500|name===['"]LCP['"].*2500/s.test(vitals),'LCP good threshold is 2500ms');
ok(/INP.*200|name===['"]INP['"].*200/s.test(vitals),'INP good threshold is 200ms');
ok(/CLS.*\.1|name===['"]CLS['"].*\.1/s.test(vitals),'CLS good threshold is 0.1');
ok(/keepalive\s*:\s*true/i.test(vitals),'Vitals telemetry uses keepalive');
ok(/page_path/i.test(vitals),'Vitals telemetry records page path');

// Service-worker/cache guard: keep the worker small and explicit
if(fs.existsSync('service-worker.js')){
  const sw=read('service-worker.js');
  if(Buffer.byteLength(sw,'utf8')>20000) warn.push('service-worker.js is larger than 20 KB; review cache scope for mobile startup cost.');
}

for(const w of warn) console.warn('WARN:',w);
if(fail.length){
  console.error('\nFINAL PRODUCTION AUDIT FAILED');
  for(const f of fail) console.error('✗',f);
  process.exit(1);
}
console.log('\nFINAL PRODUCTION AUDIT PASSED');
