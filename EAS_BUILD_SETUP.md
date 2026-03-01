# EAS Build Setup Guide for TimeKind

Complete step-by-step guide to set up EAS Build for automated iOS and Android app building and submission.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create EAS Account](#create-eas-account)
3. [Configure App Store Connect](#configure-app-store-connect)
4. [Configure Google Play Console](#configure-google-play-console)
5. [Setup GitHub Secrets](#setup-github-secrets)
6. [Configure eas.json](#configure-easjson)
7. [Build & Submit](#build--submit)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- npm or pnpm package manager
- GitHub account with repository access
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- EAS CLI installed: `npm install -g eas-cli`

---

## Create EAS Account

### Step 1: Sign Up for EAS

Visit [https://expo.dev](https://expo.dev) and create a free account using your GitHub credentials.

### Step 2: Create Personal Access Token

1. Go to [EAS Dashboard](https://expo.dev/dashboard)
2. Click your profile icon → Settings
3. Scroll to "Personal access tokens"
4. Click "Create token"
5. Name it "TimeKind CI/CD"
6. Copy the token (you'll need this for GitHub)

### Step 3: Link Project to EAS

```bash
cd /home/ubuntu/timekind
eas login
# Enter your Expo credentials
eas build:configure
```

This creates `eas.json` in your project root.

---

## Configure App Store Connect

### Step 1: Create App ID

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+"
3. Select "New App"
4. Fill in details:
   - **Platform:** iOS
   - **App Name:** TimeKind
   - **Primary Language:** English
   - **Bundle ID:** `space.manus.timekind` (from app.config.ts)
   - **SKU:** `timekind-001`

### Step 2: Get Team ID

1. Go to Membership
2. Note your **Team ID** (e.g., `ABC123XYZ`)
3. Save this for later

### Step 3: Create App Store Connect API Key

1. Go to Users and Access → Keys
2. Click "+" under "App Store Connect API Keys"
3. Select "App Manager" role
4. Click "Generate"
5. Download the key (`.p8` file)
6. Save it securely

### Step 4: Get Key ID and Issuer ID

From the key details page, copy:
- **Key ID** (e.g., `ABC123DEF`)
- **Issuer ID** (e.g., `12345678-1234-1234-1234-123456789012`)

---

## Configure Google Play Console

### Step 1: Create Google Play Project

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in details:
   - **App name:** TimeKind
   - **Default language:** English
   - **App type:** App
   - **Category:** Productivity

### Step 2: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "TimeKind"
3. Enable Google Play Developer API
4. Create service account:
   - Click "Create Service Account"
   - Name: `timekind-ci`
   - Grant "Editor" role
5. Create JSON key:
   - Click the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON"
   - Download and save securely

### Step 3: Grant Service Account Access

1. Go to Google Play Console → Settings → API access
2. Click "Link" next to the service account
3. Grant "Admin" role

### Step 4: Create Release

1. Go to Release → Production
2. Click "Create new release"
3. You'll upload APK/AAB here later

---

## Setup GitHub Secrets

Add the following secrets to your GitHub repository for CI/CD automation.

### Step 1: Add EAS_TOKEN

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. **Name:** `EAS_TOKEN`
4. **Value:** Your EAS personal access token from Step 2 above

### Step 2: Add App Store Connect Credentials

1. Create new secret: `APPLE_TEAM_ID`
   - **Value:** Your Team ID (e.g., `ABC123XYZ`)

2. Create new secret: `APPLE_KEY_ID`
   - **Value:** Your Key ID (e.g., `ABC123DEF`)

3. Create new secret: `APPLE_ISSUER_ID`
   - **Value:** Your Issuer ID

4. Create new secret: `APPLE_KEY_P8`
   - **Value:** Base64-encoded content of your `.p8` file
   - To encode: `cat your-key.p8 | base64 | pbcopy`

### Step 3: Add Google Play Credentials

1. Create new secret: `GOOGLE_PLAY_KEY`
   - **Value:** Base64-encoded content of your service account JSON key
   - To encode: `cat google-play-key.json | base64 | pbcopy`

---

## Configure eas.json

Update `eas.json` with production settings:

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
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_ID_FROM_APP_STORE_CONNECT"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json"
      }
    }
  }
}
```

Replace `YOUR_APP_ID_FROM_APP_STORE_CONNECT` with your actual App ID from App Store Connect.

---

## Build & Submit

### Option 1: Manual Build

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Option 2: Automated via GitHub Actions

The CI/CD workflow automatically triggers on:
- Push to `main` branch
- Creation of version tags (e.g., `git tag v1.0.0`)

To trigger a build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will automatically build and submit to both app stores.

### Option 3: Manual npm Scripts

```bash
# Build both platforms
npm run build:eas:all

# Build iOS only
npm run build:eas:ios

# Build Android only
npm run build:eas:android

# Upload app store content
npm run upload:app-store-content
```

---

## Troubleshooting

### Build Fails with "Invalid credentials"

**Solution:** Verify all GitHub secrets are correctly set:
```bash
# Check EAS login
eas whoami

# Check credentials
echo $EAS_TOKEN
```

### "Bundle ID already in use"

**Solution:** Use a unique bundle ID in `app.config.ts`:
```ts
const bundleId = "space.manus.timekind.v2"; // Add version suffix
```

### App Store Connect submission fails

**Solution:** Ensure:
1. App ID exists in App Store Connect
2. App Store Connect API key has "App Manager" role
3. Bundle ID matches exactly

### Google Play submission fails

**Solution:** Ensure:
1. Service account has "Admin" role in Google Play Console
2. JSON key is valid and not expired
3. First release must be manually created in Google Play Console

### "Provisioning profile not found"

**Solution:** EAS Build will automatically create profiles. If it fails:
1. Go to Apple Developer Account → Certificates, Identifiers & Profiles
2. Delete old provisioning profiles
3. Retry build

---

## Next Steps

1. **Monitor Build Status**
   - Go to [EAS Dashboard](https://expo.dev/dashboard)
   - View build logs in real-time

2. **Review App Store Listings**
   - App Store Connect: Review metadata and screenshots
   - Google Play Console: Review store listing

3. **Submit for Review**
   - App Store Connect: Click "Submit for Review"
   - Google Play Console: Click "Review" → "Start rollout"

4. **Monitor Performance**
   - Track downloads, crashes, and user ratings
   - Respond to user reviews

---

## Security Best Practices

- **Never commit secrets** to version control
- **Rotate API keys** annually
- **Use GitHub Environments** for different deployment stages
- **Enable two-factor authentication** on all accounts
- **Monitor build logs** for sensitive data leaks

---

## Support

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **GitHub Actions Help:** https://docs.github.com/en/actions
- **App Store Connect Help:** https://help.apple.com/app-store-connect
- **Google Play Help:** https://support.google.com/googleplay

---

**Last Updated:** February 28, 2026
**Status:** ✅ Ready to Configure
