# Google Play Store Submission Checklist for TimeKind

This checklist covers everything required for a successful Google Play Store submission. Complete all items before uploading your app.

---

## 1. App Details & Branding

### Required Information

- [x] **App Name**: TimeKind
- [x] **App Slug**: timekind
- [x] **Package Name**: com.timekind (must match app.config.ts)
- [x] **App Category**: Productivity
- [x] **Content Rating**: General Audiences (PEGI 3)
- [x] **Target Audience**: Adults, Teens, Children (all ages)

### Branding Assets

You need to prepare these images:

| Asset | Dimensions | Format | Purpose |
|-------|-----------|--------|---------|
| App Icon | 512×512 px | PNG | App launcher icon |
| Feature Graphic | 1024×500 px | PNG | Play Store listing header |
| Screenshots (5+) | 1080×1920 px | PNG/JPG | Show app features |
| Promo Graphic | 180×120 px | PNG | Optional promotional image |

**Where to get these:**
- App Icon: Already have in `assets/images/icon.png` (512×512)
- Feature Graphic: Need to create (1024×500)
- Screenshots: Need to capture from app (5-8 recommended)
- Promo Graphic: Optional but recommended

---

## 2. App Description & Store Listing

### Short Description (80 characters max)

```
A neurodivergent-friendly task tracker with productivity insights
```

**Status**: [ ] Create and review

### Full Description (4000 characters max)

Use the content from `RELEASE_NOTES.md` or create a marketing-focused version:

```
TimeKind is a task tracking and routine building app designed for neurodivergent individuals who struggle with time perception and task management.

Features:
• Task management with time tracking
• Productivity insights and heatmaps
• Task templates and smart scheduling
• Journal entries with history
• Multi-language support (5 languages)
• Offline-first, privacy-focused design

Designed with accessibility in mind for ADHD, autism, dyslexia, and other neurodivergent conditions.
```

**Status**: [ ] Create and review

---

## 3. Privacy Policy

### What You Need

A **Privacy Policy** document that explains:

1. **Data Collection**: What data you collect (if any)
2. **Data Usage**: How you use the data
3. **Data Storage**: Where data is stored
4. **User Rights**: How users can access/delete their data
5. **Third-party Services**: Any external services used
6. **Contact Information**: How users can contact you

### TimeKind Privacy Policy Template

Create `PRIVACY_POLICY.md`:

```markdown
# Privacy Policy for TimeKind

**Last Updated**: March 2026

## Overview

TimeKind is designed with privacy as a core principle. We do not collect, store, or transmit personal data about your tasks or activities.

## Data Collection

TimeKind does NOT collect:
- Personal information (name, email, phone)
- Task data or content
- Location data
- Device identifiers
- Usage analytics (unless you opt-in)

## Data Storage

All data is stored locally on your device:
- Tasks are stored in your device's local storage
- No data is sent to our servers
- No cloud backup or sync
- You have full control over your data

## Optional Features

### Analytics (Opt-in)
If you enable analytics, we collect:
- App usage patterns (anonymous)
- Feature usage statistics
- Crash reports (if enabled)

This data is used to improve the app. You can disable analytics anytime in Settings.

### Crash Reporting (Opt-in)
If you enable crash reporting, we collect:
- Crash stack traces (anonymous)
- Device OS version
- App version

This helps us fix bugs. No personal data is included.

## Third-party Services

TimeKind uses:
- **Firebase Crashlytics** (optional crash reporting)
- **Google Analytics** (optional usage analytics)

Both are optional and can be disabled in Settings.

## User Rights

You have the right to:
- Access your data anytime
- Delete your data anytime (Settings → Clear Data)
- Disable analytics anytime
- Export your data anytime

## Contact

For privacy questions, contact: [your-email@example.com]

## Changes to Policy

We may update this policy. Changes will be posted here with an updated date.
```

**Status**: [ ] Create privacy policy document

### Hosting Your Privacy Policy

Google Play requires a **publicly accessible URL** to your privacy policy:

**Option 1: GitHub Pages (Free)**
1. Create a GitHub repository
2. Add `PRIVACY_POLICY.md` to the repo
3. Enable GitHub Pages
4. Get the URL: `https://yourusername.github.io/timekind/privacy-policy`

**Option 2: Personal Website**
- Host on your website
- Example: `https://yoursite.com/timekind/privacy-policy`

**Option 3: Google Sites (Free)**
1. Create a new Google Site
2. Add privacy policy content
3. Publish and get the URL

**Status**: [ ] Host privacy policy and get URL

---

## 4. Content Rating Questionnaire

### What It Is

Google Play requires you to fill out a content rating questionnaire to determine age appropriateness.

### How to Complete It

1. Go to Google Play Console
2. Navigate to **App content** → **Content rating**
3. Click **Fill out questionnaire**
4. Answer questions about your app's content:
   - Violence
   - Sexual content
   - Profanity
   - Substance abuse
   - etc.

### For TimeKind

TimeKind should receive a **General Audiences (PEGI 3)** rating because:
- No violence
- No sexual content
- No profanity
- No substance abuse
- Educational/productivity focus

**Status**: [ ] Complete content rating questionnaire

---

## 5. App Store Listing Details

### Permissions

TimeKind requests these permissions:

| Permission | Why | Required |
|-----------|-----|----------|
| Microphone | Optional audio recording for tasks | No |
| Notifications | Optional task reminders | No |
| Storage | File access for export | No |

**Status**: [ ] Verify permissions in app.config.ts

### Target Devices

- **Minimum SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 14+ (API 34+)
- **Screen Sizes**: Phones and tablets
- **Languages**: 5 (English, Spanish, French, German, Japanese)

**Status**: [ ] Verify in app.config.ts

### Supported Languages

TimeKind supports:
- English
- Spanish (Español)
- French (Français)
- German (Deutsch)
- Japanese (日本語)

Add these to your Play Store listing for better discoverability.

**Status**: [ ] Add all 5 languages to listing

---

## 6. Screenshots & Graphics

### App Screenshots (Required)

You need **5-8 screenshots** showing:

1. **Home Screen**: Task list and main interface
2. **Task Creation**: How to add a new task
3. **Task Tracking**: Timer and tracking interface
4. **Insights**: Productivity heatmap
5. **Settings**: Language and theme options
6. **Journal**: Task history and notes
7. **Multi-language**: Show language support
8. **Dark Mode**: Show dark theme

**Specifications**:
- Dimensions: 1080×1920 px (9:16 aspect ratio)
- Format: PNG or JPG
- File size: < 8 MB each
- Minimum 5, recommended 8

**How to Capture**:
1. Run TimeKind in Expo Go or emulator
2. Use Android Studio emulator screenshot tool
3. Crop to 1080×1920 if needed
4. Save as PNG

**Status**: [ ] Capture 5-8 screenshots

### Feature Graphic (Required)

- **Dimensions**: 1024×500 px
- **Format**: PNG or JPG
- **Purpose**: Header image on Play Store listing
- **Content**: App name, key features, tagline

**Design Tips**:
- Use TimeKind brand colors
- Include app icon
- Add tagline: "Task Tracking for Neurodivergent Minds"
- Keep text readable

**Status**: [ ] Create feature graphic

### Promo Graphic (Optional)

- **Dimensions**: 180×120 px
- **Format**: PNG or JPG
- **Purpose**: Promotional use on Play Store

**Status**: [ ] Create promo graphic (optional)

---

## 7. App Signing & Build

### Android App Bundle (.aab)

- [x] **File**: timekind.aab
- [x] **Size**: 50-60 MB
- [x] **Source**: Generated by EAS Build
- [x] **Signed**: Yes (with your keystore)

**Status**: [ ] Download .aab file from EAS Build

### Keystore Information

- [x] **Keystore File**: timekind.jks
- [x] **Keystore Password**: Stored securely
- [x] **Key Alias**: timekind-key
- [x] **Key Password**: Stored securely

**Status**: [ ] Verify keystore is backed up

---

## 8. Compliance & Legal

### Privacy Policy

- [ ] Created and hosted publicly
- [ ] URL added to Play Store listing
- [ ] Explains data collection practices
- [ ] Includes contact information

### Terms of Service (Optional but Recommended)

Create a basic Terms of Service:

```markdown
# Terms of Service for TimeKind

## Use License

TimeKind is provided "as is" for personal, non-commercial use.

## Disclaimer

TimeKind is provided without warranty. We are not liable for:
- Data loss or corruption
- Inaccurate time tracking
- App crashes or errors
- Missed tasks or reminders

## Limitation of Liability

In no event shall TimeKind be liable for any damages arising from use of the app.

## Modifications

We reserve the right to modify this app and these terms at any time.

## Governing Law

These terms are governed by [Your Country/State] law.
```

**Status**: [ ] Create Terms of Service (optional)

### Content Rating

- [ ] Completed questionnaire
- [ ] Rating assigned (should be PEGI 3)
- [ ] No flagged content

**Status**: [ ] Complete content rating

### Permissions Justified

- [ ] Microphone permission explained (optional)
- [ ] Notification permission explained (optional)
- [ ] Storage permission explained (optional)

**Status**: [ ] Add permission explanations

---

## 9. Account & Payment

### Google Play Developer Account

- [x] **Account Created**: Yes
- [x] **Payment Method**: Added
- [x] **Developer Name**: Your name or company
- [x] **Developer Email**: Your email
- [x] **Developer Website**: (optional)

**Status**: [ ] Verify account is active

### Registration Fee

- [x] **One-time Fee**: $25 USD
- [x] **Payment Status**: Paid
- [x] **Account Status**: Active

**Status**: [ ] Confirm payment processed

---

## 10. Pre-Submission Checklist

### App Quality

- [x] App launches without crashes
- [x] All features work as described
- [x] No console errors or warnings
- [x] Tested on multiple Android versions
- [x] Tested on different screen sizes
- [x] Dark mode works correctly
- [x] All languages display correctly
- [x] Permissions work as expected

**Status**: [ ] Perform final QA testing

### Store Listing

- [ ] App name is clear and descriptive
- [ ] Short description is compelling
- [ ] Full description is accurate and complete
- [ ] Screenshots are high quality and representative
- [ ] Feature graphic is professional
- [ ] All required fields are filled
- [ ] No placeholder text remaining
- [ ] Spelling and grammar checked

**Status**: [ ] Review all store listing text

### Legal & Compliance

- [ ] Privacy policy is accurate and complete
- [ ] Privacy policy URL is publicly accessible
- [ ] Content rating questionnaire completed
- [ ] No restricted content
- [ ] All permissions are justified
- [ ] Terms of Service (if applicable) are clear

**Status**: [ ] Final legal review

### Technical

- [ ] .aab file is valid and signed
- [ ] Minimum SDK is set correctly
- [ ] Target SDK is current
- [ ] App icon is correct size (512×512)
- [ ] All screenshots are correct size (1080×1920)
- [ ] Feature graphic is correct size (1024×500)
- [ ] No hardcoded test data
- [ ] Build number is incremented

**Status**: [ ] Final technical review

---

## 11. Submission Steps

### Step 1: Prepare Store Listing

1. Go to Google Play Console
2. Select TimeKind app
3. Go to **Store listing**
4. Fill in all required fields:
   - App name
   - Short description
   - Full description
   - Screenshots (5-8)
   - Feature graphic
   - Category
   - Content rating
   - Privacy policy URL

**Status**: [ ] Complete store listing

### Step 2: Set App Content

1. Go to **App content**
2. Complete **Content rating** questionnaire
3. Set **Target audience**
4. Declare **permissions**
5. Add **privacy policy URL**

**Status**: [ ] Complete app content

### Step 3: Create Release

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `.aab` file
4. Add **release notes**
5. Review all information
6. Click **Start rollout to Production**

**Status**: [ ] Submit release

### Step 4: Monitor Review

1. Check **Release status** page
2. Monitor email for updates
3. Expected review time: 24-48 hours
4. Watch for rejection reasons (if any)

**Status**: [ ] Monitor submission

---

## 12. Post-Submission

### After Approval

- [ ] App appears on Play Store
- [ ] Share link with users
- [ ] Monitor crash reports
- [ ] Respond to reviews
- [ ] Track download metrics

### If Rejected

- [ ] Read rejection reason carefully
- [ ] Fix the issue
- [ ] Resubmit for review
- [ ] Common reasons: missing privacy policy, misleading description, crashes

---

## Summary Checklist

**Documents to Create:**
- [ ] Privacy Policy (PRIVACY_POLICY.md)
- [ ] Terms of Service (optional)
- [ ] Release Notes (GOOGLE_PLAY_RELEASE_NOTES.txt)

**Assets to Prepare:**
- [ ] App Icon (512×512) - already have
- [ ] Feature Graphic (1024×500) - need to create
- [ ] Screenshots (1080×1920) - need to capture
- [ ] Promo Graphic (180×120) - optional

**Information to Gather:**
- [ ] App description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL
- [ ] Developer name and email
- [ ] Contact information

**Technical:**
- [x] .aab file downloaded
- [x] App tested thoroughly
- [x] All features working
- [x] No crashes or errors

**Legal:**
- [ ] Privacy policy created and hosted
- [ ] Content rating completed
- [ ] Permissions justified
- [ ] No restricted content

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Prepare documents | 1-2 hours | [ ] |
| Create assets | 2-4 hours | [ ] |
| Fill store listing | 1-2 hours | [ ] |
| Submit for review | 5 minutes | [ ] |
| Google review | 24-48 hours | [ ] |
| App goes live | Immediate | [ ] |

**Total time**: 4-8 hours preparation + 24-48 hours review

---

## Need Help?

**Google Play Console Help**: https://support.google.com/googleplay/android-developer/

**Common Issues**:
1. **Missing Privacy Policy** → Create and host publicly
2. **Misleading Description** → Be accurate about features
3. **Crashes** → Fix bugs and retest
4. **Permissions Not Justified** → Explain why each permission is needed
5. **Content Rating Issues** → Complete questionnaire honestly

---

## Final Notes

- **Keep it simple**: Focus on core features and benefits
- **Be honest**: Describe your app accurately
- **Privacy first**: Explain your privacy practices clearly
- **Quality matters**: High-quality screenshots and graphics help
- **Test thoroughly**: Catch bugs before submission
- **Be patient**: Google's review takes 24-48 hours

Good luck with your submission! 🚀
