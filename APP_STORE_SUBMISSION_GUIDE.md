# TimeKind App Store Submission Guide

This guide walks you through submitting TimeKind to the iOS App Store and Google Play Store using EAS Build and Expo's managed build service.

## Prerequisites

Before you begin, ensure you have:

- An Apple Developer account ($99/year) for iOS submission
- A Google Play Developer account ($25 one-time) for Android submission
- EAS CLI installed: `npm install -g eas-cli`
- Logged into your Expo account: `eas login`

## Part 1: iOS App Store Submission

### Step 1: Create App Store Connect Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Select "iOS"
4. Fill in the following:
   - **App Name**: TimeKind
   - **Primary Language**: English
   - **Bundle ID**: `space.manus.timekind.t20260223191501`
   - **SKU**: `timekind-2026` (any unique identifier)
   - **User Access**: Select appropriate access level

### Step 2: Configure App Information

In App Store Connect, fill in the following sections:

**General Information**
- **Subtitle**: Understand Your Time, Build Better Habits
- **Description**: Use the full description from `APP_STORE_DESCRIPTIONS.md`
- **Keywords**: time tracking, task management, ADHD, neurodivergent, productivity, habit tracking, time perception, offline, accessibility, mental health
- **Support URL**: https://timekind.app/support
- **Privacy Policy URL**: https://timekind.app/privacy
- **Marketing URL**: https://timekind.app

**Pricing and Availability**
- **Price Tier**: Free
- **Availability**: Select all countries where you want to distribute

**App Icon and Screenshots**
- **App Icon** (1024×1024): Use the generated icon from `assets/images/icon-ios-1024.png`
- **Screenshots** (6 required, 1242×2208 for iPhone): Generate using the screenshot generation guide below

**Ratings**
- **Content Rating**: Select appropriate ratings for your app
- **Category**: Productivity or Health & Fitness

### Step 3: Build and Sign the App

Run the following command to create a production build:

```bash
eas build --platform ios --auto-submit
```

The `--auto-submit` flag will automatically submit your build to App Store Connect after it completes. Without this flag, you can manually submit later.

**What this does:**
- Builds your app for iOS
- Signs it with your Apple Developer certificate
- Uploads it to App Store Connect
- Queues it for review

### Step 4: Submit for Review

If you didn't use `--auto-submit`, go to App Store Connect:

1. Navigate to your app
2. Go to "App Store" tab
3. Select the build you just uploaded
4. Click "Submit for Review"
5. Answer the review questions:
   - **Encryption**: Select "No" (TimeKind doesn't use encryption)
   - **IDFA**: Select "No" (TimeKind doesn't use ad tracking)
   - **Content Rights**: Confirm you have rights to all content
   - **Export Compliance**: Select "No"

### Step 5: Wait for Review

Apple typically reviews apps within 24-48 hours. You'll receive an email when the review is complete. If rejected, address the feedback and resubmit.

## Part 2: Google Play Store Submission

### Step 1: Create Google Play Console Project

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create App"
3. Fill in:
   - **App name**: TimeKind
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free

### Step 2: Configure App Details

In Google Play Console, complete the following:

**Store listing**
- **Short description**: Understand your time. Build better habits. Offline task tracking for neurodivergent users.
- **Full description**: Use the full description from `APP_STORE_DESCRIPTIONS.md`
- **Screenshots** (4-8 required, 1080×1920): Generate using the screenshot generation guide below
- **Feature graphic** (1024×500): Optional but recommended
- **Icon** (512×512): Use the generated icon
- **Category**: Productivity
- **Content rating**: Complete the questionnaire

**App signing**
- Google Play will handle signing automatically (recommended)
- Or upload your own signing key if you prefer

### Step 3: Build and Sign the App

Run the following command to create a production build:

```bash
eas build --platform android --auto-submit
```

This will:
- Build your app for Android
- Sign it with Google Play's certificate (or yours)
- Upload it to Google Play Console
- Create a draft release

### Step 4: Create a Release

In Google Play Console:

1. Go to "Release" → "Production"
2. Click "Create new release"
3. Select the build you just uploaded
4. Review the app details
5. Click "Review release"
6. Click "Start rollout to Production"

### Step 5: Wait for Review

Google Play typically reviews apps within a few hours. You'll see the status in Google Play Console. If rejected, address the feedback and resubmit.

## Part 3: Post-Submission

### Monitor Performance

Once your app is live, monitor:

- **Downloads and active installs** (both stores)
- **Crash rates** (via analytics if enabled)
- **User ratings and reviews**
- **Performance metrics** (startup time, battery usage, etc.)

### Respond to Reviews

Both app stores allow you to respond to user reviews. Respond professionally to negative reviews and thank users for positive feedback.

### Plan Updates

- **Bug fixes**: Submit as soon as possible
- **New features**: Plan quarterly updates to keep the app fresh
- **Maintenance**: Update dependencies and address security issues

## Troubleshooting

### Build Fails

If your EAS build fails:

1. Check the build logs: `eas build:list` and click on the failed build
2. Common issues:
   - **Certificate errors**: Run `eas credentials` to manage certificates
   - **Dependency errors**: Run `npm install` and `npm test` locally first
   - **Version mismatch**: Ensure `app.config.ts` version matches your submission

### App Rejected

Common rejection reasons:

- **Crashes on startup**: Test thoroughly on real devices
- **Missing privacy policy**: Ensure URL is accessible
- **Misleading description**: Match description to actual features
- **Intellectual property**: Don't use trademarked names or icons

### App Not Appearing

After approval, apps may take a few hours to appear in app stores. Check:

- Your app name is searchable
- Keywords are indexed
- Regional availability is correct

## Versioning Strategy

For future updates, use semantic versioning:

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features
- **Major** (2.0.0): Breaking changes

Update `version` in `app.config.ts` before each submission.

## Monitoring & Analytics

TimeKind includes optional analytics (with user consent). To view analytics data:

1. Users can export their analytics from Settings
2. You can aggregate anonymized data across users (if you build a backend)
3. Consider adding Sentry for production crash monitoring (optional)

## Support & Feedback

- **User support**: Respond to reviews and support emails promptly
- **Bug reports**: Monitor crash reports and fix issues quickly
- **Feature requests**: Track common requests and prioritize updates

## Checklist Before Submission

- [ ] App name and description are accurate
- [ ] All screenshots are high quality and represent real features
- [ ] Privacy policy URL is accessible and accurate
- [ ] App icon is 1024×1024 (iOS) or 512×512 (Android)
- [ ] All tests pass locally: `npm test`
- [ ] App builds successfully: `eas build --platform ios/android`
- [ ] No console errors or warnings
- [ ] Tested on real devices (iOS and Android)
- [ ] Version number is updated in `app.config.ts`
- [ ] Bundle ID matches your developer account
- [ ] All permissions are justified and used

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
