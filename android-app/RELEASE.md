# ZemZem Android release

Current Android version: 1.1.0 (versionCode 3)

## Test build
GitHub Actions produces:
- ZemZem-Android-debug -> app-debug.apk

## Play Store bundle
GitHub Actions also produces:
- ZemZem-Android-release-aab -> app-release.aab

The release AAB is unsigned unless these environment variables are supplied:
- ANDROID_KEYSTORE_PATH
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

For Google Play production, use a permanent upload key and keep it private. Do not commit keystore files or passwords to GitHub.
