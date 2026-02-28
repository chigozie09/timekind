# TimeKind Publication Guide

Complete guide for publishing TimeKind to iOS App Store and Google Play Store with automated CI/CD pipeline.

## Table of Contents

1. [Pre-Publication Checklist](#pre-publication-checklist)
2. [Setup EAS Build](#setup-eas-build)
3. [Configure App Store Connect](#configure-app-store-connect)
4. [Configure Google Play Console](#configure-google-play-console)
5. [Setup GitHub Actions](#setup-github-actions)
6. [Publishing Process](#publishing-process)
7. [Post-Publication](#post-publication)

---

## Pre-Publication Checklist

Before publishing, verify all requirements are met:

- [x] App icon variants generated (iOS 1024x1024, Android adaptive icons)
- [x] App store descriptions translated (5 languages: EN, ES, FR, DE, JA)
- [x] Screenshots generated for all languages
- [x] Privacy policy and terms of service created
- [x] All 110 tests passing
- [x] Zero TypeScript errors
- [x] Analytics with user consent implemented
- [x] Crash reporting with user consent implemented
- [x] Language selection and regionalization complete
- [x] Onboarding flow implemented
- [x] Format preview in Settings working

**Status:** ✅ Ready for publication

---

## Setup EAS Build

EAS Build is Expo's cloud build service for creating iOS and Android binaries.

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Create EAS Account

```bash
eas login
```

### 3. Initialize EAS Project

```bash
eas build:configure
```

This will create `eas.json` in your project root.

### 4. Configure eas.json

Update `eas.json` with the following configuration:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json"
      }
    }
  }
}
```

---

## Configure App Store Connect

### 1. Create App ID

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+"
3. Select "New App"
4. Fill in app details:
   - **Platform:** iOS
   - **App Name:** TimeKind
   - **Primary Language:** English
   - **Bundle ID:** `space.manus.timekind.t20260228` (from app.config.ts)
   - **SKU:** `timekind-001`

### 2. Add App Information

1. Go to App Information
2. Add app icon (1024×1024 PNG)
3. Add screenshots for each language
4. Add keywords for each language

### 3. Create API Key

1. Go to Users and Access → Keys
2. Click "+" to create new key
3. Select "App Manager" role
4. Download the key (save as `app-store-key.p8`)

### 4. Get Team ID

1. Go to Membership
2. Note your Team ID (e.g., `ABC123XYZ`)

---

## Configure Google Play Console

### 1. Create Google Play Project

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - **App name:** TimeKind
   - **Default language:** English
   - **App type:** App
   - **Category:** Productivity

### 2. Add App Signing

1. Go to Setup → App signing
2. Use Google Play's app signing service (recommended)
3. Generate and download the upload key

### 3. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google Play Developer API
4. Create service account
5. Create and download JSON key (save as `google-play-key.json`)

### 4. Grant Service Account Access

1. Go to Google Play Console → Settings → API access
2. Click "Link" next to the service account
3. Grant "Admin" role

### 5. Add Store Listing

1. Go to Store presence → Main store listing
2. Add app icon, screenshots, and descriptions for each language
3. Add content rating questionnaire
4. Add privacy policy URL

---

## Setup GitHub Actions

### 1. Create GitHub Secrets

Add the following secrets to your GitHub repository:

1. **EAS_TOKEN**
   - Go to EAS dashboard → Personal access tokens
   - Create new token
   - Copy and add to GitHub secrets

2. **APP_STORE_CONNECT_KEY**
   - Base64 encode your `app-store-key.p8`
   - Add to GitHub secrets

3. **GOOGLE_PLAY_KEY**
   - Base64 encode your `google-play-key.json`
   - Add to GitHub secrets

### 2. Verify Workflow

The GitHub Actions workflow (`.github/workflows/app-store-deploy.yml`) will:

1. Build iOS app using EAS Build
2. Build Android app using EAS Build
3. Upload localized app store content
4. Submit for review (if configured)

---

## Publishing Process

### Option 1: Manual Build & Submit

```bash
# Build for iOS
npm run build:eas:ios

# Build for Android
npm run build:eas:android

# Upload app store content
npm run upload:app-store-content
```

### Option 2: Automated via GitHub Actions

1. Create a new release tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build for both platforms
   - Upload localized content
   - Submit for review

### Option 3: Manual Submission

1. **iOS App Store:**
   - Go to App Store Connect
   - Select your app
   - Go to "Prepare for Submission"
   - Review all information
   - Click "Submit for Review"

2. **Google Play Store:**
   - Go to Google Play Console
   - Select your app
   - Go to "Release" → "Production"
   - Click "Create new release"
   - Upload APK/AAB
   - Review and publish

---

## Post-Publication

### 1. Monitor App Performance

- **App Store Connect:** View downloads, crashes, ratings
- **Google Play Console:** View installs, crashes, ratings
- **Analytics:** Monitor user engagement and feature usage

### 2. Respond to Reviews

- Monitor user reviews daily
- Respond to feedback professionally
- Address bugs and feature requests

### 3. Plan Updates

- Monitor crash reports
- Collect user feedback
- Plan next features based on usage patterns

### 4. Localization Expansion

Consider expanding to additional languages:

- Portuguese (Brazil)
- Italian
- Korean
- Chinese (Simplified & Traditional)

---

## Troubleshooting

### Build Fails

1. Check EAS build logs: `eas build:list`
2. Verify `app.config.ts` is correct
3. Ensure all dependencies are installed: `npm install`
4. Run tests: `npm test`

### App Store Rejection

Common reasons for rejection:

- **Privacy Policy:** Must be accessible and complete
- **Functionality:** App must work as described
- **Content Rating:** Must be accurate
- **Metadata:** Screenshots and descriptions must match app functionality

### Google Play Rejection

Common reasons for rejection:

- **Permissions:** Must justify all requested permissions
- **Content Rating:** Must be accurate
- **Ads:** Must disclose if app contains ads
- **Functionality:** App must work as described

---

## Environment Variables

Required environment variables for CI/CD:

```bash
# EAS Build
EAS_TOKEN=your_eas_token

# App Store Connect
APP_STORE_CONNECT_KEY=base64_encoded_key
APPLE_TEAM_ID=ABC123XYZ

# Google Play
GOOGLE_PLAY_KEY=base64_encoded_json_key
```

---

## Support & Resources

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **App Store Connect:** https://help.apple.com/app-store-connect
- **Google Play Console:** https://support.google.com/googleplay/android-developer

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-02-28 | Ready | Initial release with 5-language support |

---

**Last Updated:** February 28, 2026
**Status:** ✅ Ready for Publication
