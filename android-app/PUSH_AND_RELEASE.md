# ZemZem Android 1.4.0 – Push & Release

## Firebase / FCM
The Android app is prepared for Firebase Cloud Messaging.

To activate real push notifications:
1. Create/register Android app `al.zemzem.app` in Firebase.
2. Download `google-services.json`.
3. Base64-encode it and save it in GitHub Actions secret:
   `GOOGLE_SERVICES_JSON_BASE64`
4. The workflow injects it securely during build.
5. The app stores the FCM token in SharedPreferences key `fcm_token`.
6. The website can read it inside the Android WebView through:
   `window.ZemZemNative.getPushToken()`

Supported notification data fields:
- `title`
- `body`
- `url`
- `type`

Supported types:
- `order_new`
- `order_status`
- `partner_order`

## Release checklist
- Version: 1.4.0
- versionCode: 7
- Package: al.zemzem.app
- targetSdk: 35
- APK build: enabled
- AAB build: enabled
- Release signing scaffold: enabled
- Deep links: zemzem.al / www.zemzem.al
- Notification permission: enabled
- Privacy page: https://www.zemzem.al/privacy.html
- Terms page: https://www.zemzem.al/terms.html
- Contact page: https://www.zemzem.al/contact.html

For production Play Store release, configure the permanent upload keystore through the existing release signing environment variables and keep the keystore/private passwords out of the repository.

<!-- Firebase secret verification trigger -->
