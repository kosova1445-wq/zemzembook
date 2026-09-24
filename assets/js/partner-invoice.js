(()=>{
'use strict';
if(window.__zzPartnerInvoice)return;window.__zzPartnerInvoice=1;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>Number(n||0).toFixed(2)+' €';
const statusLabels={pending:'Në pritje',confirmed:'Konfirmuar',processing:'Në përpunim',shipped:'Nisur',delivered:'Dorëzuar',cancelled:'Anuluar'};
async function print(orderId){
 const p=window.open('','_blank');
 if(!p){alert('Lejo dritaret pop-up për ZemZem që të hapet fatura.');return}
 p.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Duke përgatitur faturën…</title></head><body style="font:14px Arial;padding:32px;color:#17394a">Duke përgatitur faturën…</body></html>');p.document.close();
 try{
  const data=await window.ZemZemPartner.rpc('partner_customer_invoice',{p_order_id:orderId});
  const o=data?.order||{},items=data?.items||[],cfg=data?.settings||{};
  const invoiceNo=String(o.invoice_number||o.order_number||('ZZ-'+String(o.id||'').replace(/-/g,'').slice(0,12).toUpperCase()));
  const discount=Number(o.discount_amount||0)+Number(o.payment_discount_amount||0);
  const fees=Number(o.shipping_amount||0)+Number(o.cod_fee||0);
  const tracking=o.tracking_number?String((o.shipping_carrier||'')+' '+o.tracking_number).trim():'';
  const sellerName=cfg.legal_name||cfg.seller_name||'ZemZem';
  const logo=cfg.logo_url||'assets/brand/zemzem-logo.svg';
  const rows=items.map((i,idx)=>'<tr><td class="num">'+(idx+1)+'</td><td><strong>'+esc(i.title)+'</strong>'+(i.sku?'<div class="muted">SKU: '+esc(i.sku)+'</div>':'')+'</td><td class="num">'+Number(i.quantity||0)+'</td><td class="money">'+money(i.unit_price)+'</td><td class="money">'+money(i.line_total)+'</td></tr>').join('');
  const html='<!doctype html><html><head><meta charset="utf-8"><title>Fatura '+esc(invoiceNo)+'</title><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#17394a;background:#fff}.sheet{max-width:900px;margin:auto}.print{position:fixed;right:18px;top:18px;border:0;border-radius:8px;background:#17394a;color:#fff;padding:10px 14px;font-weight:700;cursor:pointer}.head{display:flex;justify-content:space-between;gap:28px;border-bottom:3px solid #17394a;padding-bottom:18px}.brand{display:flex;align-items:center;gap:14px}.brand img{width:78px;height:78px;object-fit:contain}.brand h1{margin:0;font-size:24px}.muted{color:#71808a;font-size:12px}.invoice-title{text-align:right}.invoice-title h2{font-size:30px;margin:0 0 4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}.box{border:1px solid #dce5e8;border-radius:12px;padding:14px}.box h3{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.box p{margin:3px 0;line-height:1.45}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#17394a;color:#fff;text-align:left;padding:10px;font-size:12px}td{padding:10px;border-bottom:1px solid #e6ecef;font-size:12px}.num{text-align:center}.money{text-align:right;white-space:nowrap}.totals{margin:18px 0 0 auto;width:min(360px,100%)}.line{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e7ecef}.line.total{font-size:17px;font-weight:800;border-top:2px solid #17394a;border-bottom:0;margin-top:5px;padding-top:11px}.footer{margin-top:30px;border-top:1px solid #dce5e8;padding-top:14px;font-size:11px;color:#677781}.status{display:inline-block;padding:5px 8px;border-radius:999px;background:#edf5f1;color:#24553d;font-weight:700;font-size:11px}@media print{.print{display:none}.sheet{max-width:none}}</style></head><body>'+
  '<button class="print" onclick="window.print()">Printo / Ruaj PDF</button><main class="sheet">'+
  '<div class="head"><div class="brand"><img src="'+esc(logo)+'" alt="ZemZem"><div><h1>'+esc(sellerName)+'</h1><div class="muted">'+esc(cfg.address_line1||'')+'</div><div class="muted">'+esc(cfg.city_country||'')+'</div><div class="muted">'+(cfg.phone?'Tel: '+esc(cfg.phone):'')+'</div><div class="muted">'+(cfg.email?esc(cfg.email):'')+'</div></div></div>'+
  '<div class="invoice-title"><h2>FATURË</h2><strong>'+esc(invoiceNo)+'</strong><div class="muted">'+new Date(o.created_at).toLocaleString('sq-AL')+'</div><div style="margin-top:8px"><span class="status">'+esc(statusLabels[o.order_status]||o.order_status||'Në pritje')+'</span></div></div></div>'+
  '<div class="grid"><div class="box"><h3>Klienti</h3><p><strong>'+esc(o.first_name||'')+' '+esc(o.last_name||'')+'</strong></p><p>'+esc(o.guest_email||'')+'</p><p>'+esc(o.phone||'')+'</p></div>'+
  '<div class="box"><h3>Dërgesa</h3><p>'+esc(o.address_line1||'')+(o.address_line2?'<br>'+esc(o.address_line2):'')+'</p><p>'+esc(o.postal_code||'')+' '+esc(o.city||'')+' · '+esc(o.country_code||'')+'</p>'+(tracking?'<p><strong>Tracking:</strong> '+esc(tracking)+'</p>':'')+'</div></div>'+
  '<table><thead><tr><th>#</th><th>Artikulli</th><th style="text-align:center">Sasia</th><th style="text-align:right">Çmimi</th><th style="text-align:right">Gjithsej</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<div class="totals"><div class="line"><span>Librat</span><strong>'+money(o.subtotal)+'</strong></div>'+(discount?'<div class="line"><span>Zbritjet</span><strong>− '+money(discount)+'</strong></div>':'')+'<div class="line"><span>Transporti & tarifat</span><strong>'+money(fees)+'</strong></div><div class="line total"><span>Totali</span><span>'+money(o.total)+'</span></div></div>'+
  '<div class="footer"><strong>'+esc(cfg.thank_you||'Faleminderit për porosinë tuaj!')+'</strong><p>'+esc(cfg.footer_note||'Ky dokument paraqet të dhënat e porosisë nga ZemZem.al.')+'</p>'+(cfg.fiscal_no?'<p>Nr. fiskal: '+esc(cfg.fiscal_no)+'</p>':'')+(cfg.vat_no?'<p>TVSH: '+esc(cfg.vat_no)+'</p>':'')+'</div>'+
  '</main></body></html>';
  p.document.open();p.document.write(html);p.document.close();try{p.opener=null}catch(_){}
 }catch(e){try{p.close()}catch(_){}alert(e.message||'Fatura nuk u krijua.')}
}
window.ZemZemPartnerInvoice={print};
})();