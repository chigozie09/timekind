# Google Play Store Publishing Guide for TimeKind

Complete step-by-step walkthrough for building and submitting TimeKind to Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Google Play Developer Account](#step-1-create-google-play-developer-account)
3. [Step 2: Create App in Google Play Console](#step-2-create-app-in-google-play-console)
4. [Step 3: Set Up Service Account](#step-3-set-up-service-account)
5. [Step 4: Configure GitHub Secrets](#step-4-configure-github-secrets)
6. [Step 5: Build Android App](#step-5-build-android-app)
7. [Step 6: Fill App Store Listing](#step-6-fill-app-store-listing)
8. [Step 7: Submit for Review](#step-7-submit-for-review)
9. [Step 8: Monitor Review Status](#step-8-monitor-review-status)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Google Account** — Required for Google Play Console
- **Payment Method** — $25 one-time developer fee
- **EAS CLI Installed** — `npm install -g eas-cli`
- **EAS Account** — Created and logged in
- **TimeKind Project** — Ready to build

Check your setup:

```bash
# Verify EAS login
eas whoami

# Verify Node.js version
node --version  # Should be 18+

# Verify npm
npm --version
```

---

## Step 1: Create Google Play Developer Account

### 1.1 Go to Google Play Console

Visit [https://play.google.com/console](https://play.google.com/console)

### 1.2 Sign In

- Click "Sign in" in the top right
- Use your Google account
- If you don't have one, create a new Google account

### 1.3 Accept Terms

- Read the Google Play Developer Program Policies
- Check the box: "I agree to the Google Play Developer Program Policies"
- Click "Accept"

### 1.4 Pay Developer Fee

- Enter payment information
- Pay $25 one-time fee
- Wait for confirmation (usually instant)

### 1.5 Complete Profile

- Add your developer name (can be your name or company name)
- Add contact email
- Add website (optional)
- Click "Complete signup"

**Status:** ✅ Google Play Developer Account created

---

## Step 2: Create App in Google Play Console

### 2.1 Create New App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app" button
3. Fill in app details:

| Field | Value |
|-------|-------|
| App name | TimeKind |
| Default language | English |
| App type | App |
| Category | Productivity |
| Free or paid | Free |

4. Click "Create app"

### 2.2 Accept Declaration

- Read the "Declaration of Conformity"
- Check: "I confirm that this app complies with..."
- Click "Confirm"

**Status:** ✅ App created in Google Play Console

---

## Step 3: Set Up Service Account

### 3.1 Go to Google Cloud Console

1. Visit [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create new project:
   - Click "Select a Project" at top
   - Click "NEW PROJECT"
   - **Project name:** `TimeKind`
   - Click "Create"

### 3.2 Enable Google Play Developer API

1. In Google Cloud Console, go to "APIs & Services"
2. Click "Enable APIs and Services"
3. Search for "Google Play Developer API"
4. Click on it
5. Click "Enable"

### 3.3 Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - **Service account name:** `timekind-ci`
   - **Service account ID:** `timekind-ci` (auto-filled)
   - **Description:** `CI/CD for TimeKind app deployment`
4. Click "Create and Continue"
5. Skip "Grant this service account access to project" (optional)
6. Click "Done"

### 3.4 Create JSON Key

1. Go to "APIs & Services" → "Service Accounts"
2. Click on `timekind-ci` service account
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON"
6. Click "Create"
7. **Save the JSON file securely** (you'll need this)

**Status:** ✅ Service account created with JSON key

---

## Step 4: Configure GitHub Secrets

### 4.1 Add Google Play Key to GitHub

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. **Name:** `GOOGLE_PLAY_KEY`
5. **Value:** 
   - Open the JSON file you downloaded
   - Copy all the content
   - Paste into the secret value
6. Click "Add secret"

### 4.2 Grant Service Account Access in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Settings" (bottom left)
3. Click "API access"
4. Under "Service accounts," click "Link"
5. Select the service account you created
6. Grant "Admin" role
7. Click "Invite user"

**Status:** ✅ GitHub secrets configured

---

## Step 5: Build Android App

### 5.1 Verify Configuration

Before building, verify your app configuration:

```bash
cd /home/ubuntu/timekind

# Check app.config.ts
cat app.config.ts | grep -A 5 "android"

# Verify version
cat package.json | grep version
```

### 5.2 Build for Android

Run the production build script:

```bash
# Build for Android only (no auto-submit)
npm run build:production -- --platform=android

# Or with specific version
npm run build:production -- --platform=android --version=1.0.0
```

This will:
1. Run all tests
2. Auto-increment version number
3. Build Android app via EAS Build
4. Upload localized app store content
5. Generate APK/AAB file

**Expected output:**
```
✅ Updated package.json to version 1.0.0
✅ All tests passed
✅ Android build completed
✅ App store content uploaded
```

### 5.3 Monitor Build

Check build status:

```bash
# View all builds
eas build:list

# View latest build
eas build:list | head -5

# Stream build logs
eas build:view <build-id> --log
```

Or visit [EAS Dashboard](https://expo.dev/dashboard) and click on your project.

**Status:** ✅ Android app built

---

## Step 6: Fill App Store Listing

### 6.1 Go to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select "TimeKind" app
3. Left sidebar → "Store presence" → "Main store listing"

### 6.2 Add App Icon

1. Scroll to "App icon"
2. Click "Upload image"
3. Select `assets/images/icon.png` (1024×1024)
4. Click "Upload"

### 6.3 Add Screenshots

1. Scroll to "Screenshots"
2. Click "Add screenshots"
3. Upload 5 screenshots (from `APP_STORE_SCREENSHOTS.md`):
   - Home screen
   - Insights screen
   - Templates screen
   - Journal screen
   - Settings screen
4. Each screenshot should be 1242×2208 pixels

### 6.4 Add App Description

1. Scroll to "App description"
2. **Short description** (80 characters):
   ```
   Track tasks, build better time habits
   ```
3. **Full description** (4000 characters):
   - Copy from `LOCALIZED_APP_STORE_DESCRIPTIONS.md`
   - Use the English version

### 6.5 Add Content Rating

1. Left sidebar → "Content rating"
2. Click "Fill out questionnaire"
3. Answer questions about app content:
   - Violence: No
   - Sexual content: No
   - Profanity: No
   - Alcohol/tobacco: No
   - Gambling: No
4. Click "Save questionnaire"
5. Click "Publish"

### 6.6 Add Privacy Policy

1. Left sidebar → "App content" → "Privacy policy"
2. Enter privacy policy URL
3. Example: `https://yourwebsite.com/privacy`
4. Click "Save"

### 6.7 Add Target Audience

1. Left sidebar → "App content" → "Target audience"
2. Select age group: "Unrated"
3. Click "Save"

**Status:** ✅ App store listing completed

---

## Step 7: Submit for Review

### 7.1 Prepare Release

1. Go to [Google Play Console](https://play.google.com/console)
2. Select "TimeKind" app
3. Left sidebar → "Release" → "Production"

### 7.2 Create Release

1. Click "Create new release"
2. You'll see "App bundles and APKs"

### 7.3 Upload Build

1. Click "Browse files"
2. Select the APK/AAB from your EAS build:
   - Go to [EAS Dashboard](https://expo.dev/dashboard)
   - Click on your latest Android build
   - Click "Download"
   - Select the `.aab` file (recommended) or `.apk`
3. Upload the file

### 7.4 Add Release Notes

1. Scroll to "Release notes"
2. Select language: "English"
3. Add release notes:
   ```
   TimeKind v1.0.0 - Initial Release
   
   Features:
   - Track tasks and time estimates
   - View insights and heatmap
   - Create task templates
   - Journal entries with reflections
   - 5-language support
   - Dark mode support
   - Accessibility features
   ```
4. Click "Save"

### 7.5 Review and Submit

1. Scroll down and review all information
2. Check "I confirm that this app complies with..."
3. Click "Review release"
4. Click "Start rollout to Production"
5. Confirm the rollout

**Status:** ✅ App submitted for review

---

## Step 8: Monitor Review Status

### 8.1 Check Review Status

1. Go to [Google Play Console](https://play.google.com/console)
2. Select "TimeKind" app
3. Left sidebar → "Release" → "Production"
4. View "Release status"

Possible statuses:
- **In review:** Google is reviewing your app (usually 24-48 hours)
- **Approved:** App is approved and will be published
- **Published:** App is live on Google Play Store
- **Rejected:** App was rejected (see rejection reason)

### 8.2 Review Timeline

| Stage | Duration | Action |
|-------|----------|--------|
| In review | 24-48 hours | Wait and monitor |
| Approved | 1-2 hours | App goes live |
| Published | Immediate | Available to download |

### 8.3 Monitor Downloads

Once published:

1. Go to "Metrics" tab
2. View:
   - **Installs:** New downloads
   - **Uninstalls:** Removals
   - **Active Installs:** Currently installed
   - **Ratings:** User reviews

---

## Troubleshooting

### Build Failed: "Invalid credentials"

**Solution:**

1. Verify GitHub secret `GOOGLE_PLAY_KEY` is set correctly
2. Check that service account has "Admin" role in Google Play Console
3. Verify JSON key is not expired
4. Retry build:
   ```bash
   npm run build:production -- --platform=android
   ```

### Submission Failed: "Invalid APK/AAB"

**Solution:**

1. Verify app version is higher than previous release
2. Check that bundle ID matches `app.config.ts`
3. Verify signing certificate is correct
4. Try uploading again

### App Rejected: "Violates policy"

**Solution:**

1. Read rejection reason in Google Play Console
2. Fix the issue
3. Increment version number
4. Rebuild and resubmit:
   ```bash
   npm run build:production -- --platform=android --version=1.0.1
   ```

### Screenshots Not Uploading

**Solution:**

1. Verify image dimensions: 1242×2208 pixels
2. Verify file format: PNG or JPEG
3. Verify file size: Less than 8MB
4. Try uploading one at a time

### Content Rating Issues

**Solution:**

1. Go back to "Content rating"
2. Click "Change questionnaire"
3. Re-answer all questions
4. Click "Save questionnaire"
5. Click "Publish"

---

## Post-Submission Checklist

After submitting:

- [ ] Verify app appears in "In review" status
- [ ] Monitor review status daily
- [ ] Prepare response to any rejection feedback
- [ ] Set up monitoring dashboard (see POST_LAUNCH_MONITORING.md)
- [ ] Prepare social media announcement for launch
- [ ] Test app on Android device once published
- [ ] Monitor crash reports and user reviews

---

## Quick Reference Commands

```bash
# Build Android only
npm run build:production -- --platform=android

# Build with specific version
npm run build:production -- --platform=android --version=1.0.0

# View build status
eas build:list

# Download build
eas build:view <build-id>

# Check version
cat package.json | grep version

# View app config
cat app.config.ts | grep -A 10 "android"
```

---

## Next Steps

1. **After Approval:** App will be published to Google Play Store
2. **Monitor Performance:** Use POST_LAUNCH_MONITORING.md to track metrics
3. **Respond to Reviews:** Monitor and respond to user feedback
4. **Plan Updates:** Use monitoring data to prioritize next features

---

## Support & Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
- **EAS Submit Documentation:** https://docs.expo.dev/submit/introduction/
- **App Store Policies:** https://play.google.com/about/developer-content-policy/

---

**Last Updated:** March 1, 2026
**Status:** ✅ Ready to Publish
