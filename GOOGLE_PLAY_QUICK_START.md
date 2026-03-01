# Google Play Store - Quick Start Checklist

Fast-track checklist for publishing TimeKind to Google Play Store.

## 📋 Pre-Submission Checklist

### Account Setup (30 minutes)

- [ ] Create Google Play Developer Account at https://play.google.com/console
- [ ] Pay $25 developer fee
- [ ] Create new app named "TimeKind"
- [ ] Select category: "Productivity"

### Service Account Setup (15 minutes)

- [ ] Create Google Cloud project at https://console.cloud.google.com
- [ ] Enable "Google Play Developer API"
- [ ] Create service account named "timekind-ci"
- [ ] Download JSON key file
- [ ] Grant service account "Admin" role in Google Play Console

### Build Preparation (5 minutes)

- [ ] Verify app version in `package.json`
- [ ] Verify bundle ID in `app.config.ts`
- [ ] Run tests: `npm test`
- [ ] All tests passing ✅

---

## 🚀 Build & Submit Steps

### Step 1: Build Android App (5-10 minutes)

**Option A: EAS Build (Recommended)**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# Wait for build to complete
# Download the .aab file when ready
```

**Option B: Local Build**

See `ANDROID_LOCAL_BUILD_GUIDE.md` for detailed instructions.

### Step 2: Prepare App Store Listing (15 minutes)

Go to [Google Play Console](https://play.google.com/console) → TimeKind app

**Add App Icon:**
- [ ] Upload `assets/images/icon.png` (1024×1024)

**Add Screenshots:**
- [ ] Upload 5 screenshots (1242×2208 each)
- [ ] See `APP_STORE_SCREENSHOTS.md` for screenshots

**Add Description:**
- [ ] Short description (80 chars): "Track tasks, build better time habits"
- [ ] Full description: Copy from `LOCALIZED_APP_STORE_DESCRIPTIONS.md`

**Content Rating:**
- [ ] Fill out content rating questionnaire
- [ ] All answers: "No" for violence, sexual content, profanity, etc.
- [ ] Publish rating

**Privacy Policy:**
- [ ] Add privacy policy URL (required)

**Target Audience:**
- [ ] Select "Unrated"

### Step 3: Upload Build (5 minutes)

Go to [Google Play Console](https://play.google.com/console) → TimeKind → Release → Production

- [ ] Click "Create new release"
- [ ] Upload `.aab` file from EAS build
- [ ] Add release notes:
  ```
  TimeKind v1.0.0 - Initial Release
  
  Features:
  - Track tasks and time estimates
  - View insights and heatmap
  - Create task templates
  - Journal entries
  - 5-language support
  - Dark mode
  - Accessibility features
  ```

### Step 4: Submit for Review (2 minutes)

- [ ] Review all information
- [ ] Check "I confirm this app complies with..."
- [ ] Click "Start rollout to Production"
- [ ] Confirm submission

---

## ✅ Post-Submission

### Monitor Review Status

- [ ] Check status daily at Google Play Console
- [ ] Expected review time: 24-48 hours
- [ ] Status will change to "Approved" then "Published"

### After Approval

- [ ] App appears on Google Play Store
- [ ] Monitor downloads and ratings
- [ ] Respond to user reviews
- [ ] Track crash reports

### Monitoring

See `POST_LAUNCH_MONITORING.md` for detailed monitoring guide.

---

## 📱 Testing Before Submission

### Test on Device

```bash
# Generate QR code for Expo Go testing
npm run qr

# Scan with phone camera
# Open in Expo Go app
# Test all features
```

### Test Checklist

- [ ] App launches without crashes
- [ ] All screens load correctly
- [ ] Language switching works
- [ ] Dark mode works
- [ ] Accessibility features work
- [ ] Tasks can be created/completed
- [ ] Insights display correctly
- [ ] Settings save properly

---

## 🔧 Troubleshooting

### Build Failed

```bash
# Check build status
eas build:list

# View build logs
eas build:view <build-id> --log

# Retry build
eas build --platform android --profile production
```

### Submission Rejected

1. Read rejection reason in Google Play Console
2. Fix the issue
3. Increment version: `1.0.0` → `1.0.1`
4. Rebuild and resubmit

### App Not Appearing

- [ ] Check app is "Published" status
- [ ] Search by app name "TimeKind"
- [ ] Check it's available in your region
- [ ] Wait 1-2 hours for indexing

---

## 📞 Support Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Docs:** https://docs.expo.dev

---

## 🎯 Timeline

| Step | Time | Status |
|------|------|--------|
| Account Setup | 30 min | ⏳ |
| Service Account | 15 min | ⏳ |
| Build App | 10 min | ⏳ |
| Prepare Listing | 15 min | ⏳ |
| Upload Build | 5 min | ⏳ |
| Submit | 2 min | ⏳ |
| **Total** | **~77 min** | **⏳** |
| Review (Google) | 24-48 hrs | ⏳ |
| **Live on Store** | **48-72 hrs** | ✅ |

---

## 📝 Files You'll Need

- `GOOGLE_PLAY_PUBLISHING_GUIDE.md` — Detailed step-by-step guide
- `ANDROID_LOCAL_BUILD_GUIDE.md` — Local build instructions
- `LOCALIZED_APP_STORE_DESCRIPTIONS.md` — App descriptions
- `APP_STORE_SCREENSHOTS.md` — Screenshots
- `POST_LAUNCH_MONITORING.md` — Monitoring guide
- `assets/images/icon.png` — App icon (1024×1024)

---

**Last Updated:** March 1, 2026
**Status:** ✅ Ready to Submit
