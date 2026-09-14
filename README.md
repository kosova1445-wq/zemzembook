# ZemZem Webshop

Webshop-i i librave për **https://www.zemzem.al**.

## Checkout rules
- PayPal: **10% zbritje** mbi vlerën e librave
- Cash on Delivery: **+2 EUR** tarifë
- Transport Kosovë: **3 EUR**
- Transport Shqipëri: **6 EUR**
- Transport Maqedoni e Veriut: **6 EUR**

## Deployment
Deploy automatik bëhet nga GitHub Actions në cPanel përmes explicit FTPS.

Repository Secrets që duhen vendosur:
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_PORT`
- `FTP_SERVER_DIR`

Mos vendos kredenciale reale në skedarët e repository-t.
