# Android client

This directory is reserved for a native shell. The current React web app is responsive and can be opened in Android browsers, but this repository does not yet contain a Capacitor project, Android Studio project, signing configuration, or APK.

When adding Capacitor, keep its configuration and generated `android/` project here, point its web output at `../web/dist`, and document debug and signed release builds separately. Never commit signing keys or Google OAuth secrets.
