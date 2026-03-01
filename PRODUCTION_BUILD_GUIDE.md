# Production Build Guide for TimeKind

Step-by-step guide for building and deploying TimeKind to iOS App Store and Google Play Store.

## Quick Start

### One-Command Build & Submit

```bash
# Build and submit to both app stores
npm run build:production:submit
```

This command will:
1. Auto-increment version number
2. Run all tests
3. Build for iOS and Android
4. Upload localized app store content
5. Submit to both app stores

### Build Without Submission

```bash
# Build for both platforms (no submission)
npm run build:production

# Build for iOS only
npm run build:production -- --platform=ios

# Build for Android only
npm run build:production -- --platform=android
```

### Test Build Without Making Changes

```bash
# See what would happen without executing
npm run build:production:dry-run
```

---

## Detailed Build Process

### Step 1: Verify Prerequisites

Before building, ensure you have:

- All GitHub secrets configured (see EAS_BUILD_SETUP.md)
- EAS CLI installed: `npm install -g eas-cli`
- Logged into EAS: `eas login`
- All tests passing: `npm test`

### Step 2: Version Management

The build script automatically handles versioning:

```bash
# Auto-increment patch version (1.0.0 → 1.0.1)
npm run build:production

# Set specific version
npm run build:production -- --version=2.0.0
```

Version is updated in:
- `package.json` (npm version)
- Git tag (v1.0.1)

### Step 3: Build for Platforms

The script builds for both iOS and Android:

```bash
# Build both platforms
npm run build:production

# Build specific platform
npm run build:production -- --platform=ios
npm run build:production -- --platform=android
```

Build process includes:
- Running all tests
- Uploading localized app store content
- Creating production builds via EAS Build
- Generating iOS IPA and Android APK

### Step 4: Submit to App Stores

#### Option A: Auto-Submit (Recommended)

```bash
npm run build:production:submit
```

This automatically submits builds to:
- iOS App Store
- Google Play Store

#### Option B: Manual Submission

```bash
# Build without submitting
npm run build:production

# Review builds in EAS Dashboard
# Then manually submit:
eas submit --platform ios --latest
eas submit --platform android --latest
```

#### Option C: Staged Submission

```bash
# Build
npm run build:production

# Test on devices
# Review in EAS Dashboard
# Then submit when ready
npm run build:production -- --version=1.0.1 --submit
```

---

## Build Scripts Reference

### Available npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run build:production` | Build for both platforms (no submit) |
| `npm run build:production:submit` | Build and auto-submit to app stores |
| `npm run build:production:dry-run` | Preview build without executing |
| `npm run build:eas:ios` | Build iOS only via EAS |
| `npm run build:eas:android` | Build Android only via EAS |
| `npm run build:eas:all` | Build both platforms via EAS |
| `npm run upload:app-store-content` | Upload localized descriptions & screenshots |

### Command Line Options

```bash
node scripts/build-production.js [options]

Options:
  --platform ios|android|all    Platform to build (default: all)
  --version X.Y.Z               Set version (default: auto-increment)
  --submit                      Auto-submit to app stores
  --dry-run                      Show what would happen without executing
```

Examples:

```bash
# Build iOS only, version 2.0.0, with submission
node scripts/build-production.js --platform=ios --version=2.0.0 --submit

# Preview Android build without making changes
node scripts/build-production.js --platform=android --dry-run
```

---

## Monitoring Build Status

### EAS Dashboard

Monitor builds in real-time:

```bash
# View all builds
eas build:list

# View specific build
eas build:view <build-id>

# Stream build logs
eas build:view <build-id> --log
```

Or visit [https://expo.dev/dashboard](https://expo.dev/dashboard)

### App Store Connect

Monitor iOS submission:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select TimeKind app
3. Go to "App Store" → "Prepare for Submission"
4. Check "Build" section for submitted builds
5. Monitor review status

### Google Play Console

Monitor Android submission:

1. Go to [Google Play Console](https://play.google.com/console)
2. Select TimeKind app
3. Go to "Release" → "Production"
4. Check "Releases" section for submitted builds
5. Monitor review status

---

## Troubleshooting

### Build Fails: "Tests failed"

```bash
# Fix failing tests
npm test

# Review test output
npm test -- --reporter=verbose

# Fix issues, then retry
npm run build:production
```

### Build Fails: "EAS credentials not found"

```bash
# Login to EAS
eas login

# Verify login
eas whoami

# Retry build
npm run build:production
```

### Build Fails: "App Store Connect API error"

**Solution:** Verify GitHub secrets are correctly set:

1. Go to GitHub repo → Settings → Secrets
2. Verify these secrets exist:
   - `APPLE_TEAM_ID`
   - `APPLE_KEY_ID`
   - `APPLE_ISSUER_ID`
   - `APPLE_KEY_P8`

3. If missing, follow EAS_BUILD_SETUP.md to add them

### Build Fails: "Google Play API error"

**Solution:** Verify Google Play service account:

1. Go to GitHub repo → Settings → Secrets
2. Verify `GOOGLE_PLAY_KEY` secret exists
3. Verify service account has "Admin" role in Google Play Console
4. Verify JSON key is not expired

### App Store Rejection: "Metadata not matching"

**Solution:** Ensure app store content is up-to-date:

```bash
# Update app store content
npm run upload:app-store-content

# Verify in App Store Connect
# Then resubmit
```

### Submission Hangs or Times Out

**Solution:** Submit manually:

```bash
# Check build status
eas build:list

# Get build ID of latest build
# Then submit manually
eas submit --platform ios --id <build-id>
eas submit --platform android --id <build-id>
```

---

## Version Numbering

TimeKind uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes, major features (1.0.0 → 2.0.0)
- **MINOR:** New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH:** Bug fixes, small improvements (1.0.0 → 1.0.1)

### Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-02-28 | Released | Initial launch with 5-language support |

---

## Post-Build Checklist

After successful build and submission:

- [ ] Verify build appears in EAS Dashboard
- [ ] Check iOS build in App Store Connect
- [ ] Check Android build in Google Play Console
- [ ] Review app store metadata for accuracy
- [ ] Verify screenshots display correctly
- [ ] Check localized descriptions for all languages
- [ ] Submit for review in both stores
- [ ] Monitor review status daily
- [ ] Prepare response to any review feedback
- [ ] Plan next feature release

---

## Continuous Deployment

For automated builds on every commit:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```
   GitHub Actions will automatically build and test

2. **Create release tag:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
   GitHub Actions will build, test, and submit to app stores

3. **Monitor in GitHub:**
   - Go to repo → Actions
   - View workflow status
   - Check build logs

---

## Support & Resources

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **App Store Connect:** https://help.apple.com/app-store-connect
- **Google Play Console:** https://support.google.com/googleplay

---

**Last Updated:** February 28, 2026
**Status:** ✅ Ready to Build
