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
const checkout=read('checkout.html')+'\n'+read('assets/js/checkout-v2.js');
ok(/paypal/i.test(checkout),'Checkout includes PayPal');
ok(/cod|cash on delivery/i.test(checkout),'Checkout includes COD');
ok(/coupon/i.test(checkout),'Checkout includes coupons');
ok(/shipping/i.test(checkout),'Checkout includes shipping calculation');
ok(/total/i.test(checkout),'Checkout includes totals');

const partner=read('partner.html')+'\n'+read('assets/js/partner-fulfillment.js')+'\n'+read('assets/js/partner-invoice.js');
for(const s of ['pending','preparing','shipped','delivered']) ok(partner.includes(s),'Partner flow includes '+s);
ok(/invoice|fatur/i.test(partner),'Partner flow includes invoice');
ok(/supplier_due|settlement|zemzem_margin_total/i.test(partner),'Partner flow includes settlement/accounting data');

const index=read('index.html'),shop=read('shop.html'),product=read('product.html');
ok(/rel=["']canonical["']/i.test(index),'Homepage canonical exists');
ok(/rel=["']canonical["']/i.test(shop),'Shop canonical exists');
ok(/seo-product\.js/i.test(product),'Product dynamic SEO is enabled');
ok(fs.existsSync('sitemap.xml'),'Sitemap exists');
ok(/Sitemap:\s*https:\/\/www\.zemzem\.al\/sitemap\.xml/i.test(read('robots.txt')),'robots.txt points to sitemap');
ok(/Disallow:\s*\/admin\.html/i.test(read('robots.txt')),'Admin blocked from crawling');
ok(/Disallow:\s*\/partner\.html/i.test(read('robots.txt')),'Partner portal blocked from crawling');

const admin=read('admin.html');
const adminScripts=[...admin.matchAll(/<script\b[^>]*\ssrc=["'][^"']+["'][^>]*>/gi)].map(x=>x[0]);
if(adminScripts.length>35) warn.push('Admin still has '+adminScripts.length+' external scripts; all are deferred, but module consolidation remains a future optimization.');

for(const w of warn) console.warn('WARN:',w);
if(fail.length){
  console.error('\nFINAL PRODUCTION AUDIT FAILED');
  for(const f of fail) console.error('✗',f);
  process.exit(1);
}
console.log('\nFINAL PRODUCTION AUDIT PASSED');
