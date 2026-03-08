# Google Play Store Submission Guide: Closed Testing

This guide walks you through submitting TimeKind to Google Play Store for closed testing.

## Phase 1: Generate Production Build Files

### Step 1.1: Click the Publish Button
1. In the Management UI (top-right corner), click the **Publish** button
2. The system will initiate an EAS Build for both Android and iOS
3. Wait 10-30 minutes for the build to complete

### Step 1.2: Download the Android AAB File
1. Once the build completes, you'll receive a download link for the `.aab` file
2. Download the **Android App Bundle (.aab)** file to your computer
3. Save it in an easily accessible location (e.g., Downloads folder)

**Note:** The `.aab` file is the production-ready package for Google Play Store. Do NOT use the `.apk` file for store submission.

---

## Phase 2: Access Google Play Console

### Step 2.1: Open Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account (the one associated with your developer account)
3. You should see your app "TimeKind" in the app list

### Step 2.2: Navigate to Your App
1. Click on **TimeKind** to open the app dashboard
2. You're now in the app's main management interface

---

## Phase 3: Upload AAB File to Google Play Console

### Step 3.1: Navigate to Release Management
1. In the left sidebar, click **Release** → **Production** (or **Testing** if you prefer)
2. For closed testing, you'll use the **Testing** section instead
3. Click on **Closed testing** (in the left sidebar under Testing)

### Step 3.2: Create a New Release
1. Click the **Create new release** button
2. You'll see an option to upload your app bundle

### Step 3.3: Upload the AAB File
1. Click **Upload** or drag-and-drop the `.aab` file you downloaded
2. Wait for the upload to complete (usually 1-2 minutes)
3. The system will validate the file and show:
   - App name
   - Version code
   - Version name
   - File size
   - Supported devices

### Step 3.4: Review App Details
1. Verify all the information is correct
2. Check that the version number is higher than your previous release (if updating)
3. Confirm the app bundle is valid and ready

---

## Phase 4: Configure Closed Testing Track

### Step 4.1: Add Testers
1. Scroll down to the **Testers** section
2. Click **Manage testers** or **Add testers**
3. Enter the email addresses of your closed testers (one per line)
4. These testers will receive an email invitation to test the app

### Step 4.2: Create a Testing List (Optional)
1. You can create named testing groups (e.g., "Internal Team", "Beta Users")
2. Assign testers to specific groups
3. This helps organize testing phases

### Step 4.3: Set Testing Duration (Optional)
1. Choose when the closed testing period starts and ends
2. You can leave it open-ended or set an expiration date
3. Testers will have access to the app during this period

---

## Phase 5: Fill in Release Notes and App Details

### Step 5.1: Add Release Notes
1. In the **Release notes** section, describe what's new in this version
2. Example: "Added conflict resolution suggestions, improved task scheduling, fixed date picker crash"
3. Keep it concise but informative

### Step 5.2: Review Store Listing (First Release Only)
If this is your first release, you'll need to complete:
- **App title** — TimeKind (already set)
- **Short description** — One-line summary of the app
- **Full description** — Detailed explanation of features
- **Screenshots** — 2-8 screenshots showing the app in action
- **Feature graphic** — 1024x500px banner image
- **Icon** — Your app icon (already configured)
- **Category** — Productivity
- **Content rating** — Complete the questionnaire
- **Privacy policy** — Link to your privacy policy

### Step 5.3: Content Rating Questionnaire
1. Click **Content rating** in the left sidebar
2. Fill out the Google Play Content Rating Questionnaire
3. This determines age ratings for your app
4. Should take 5-10 minutes

### Step 5.4: Privacy Policy
1. Click **App policies** in the left sidebar
2. Add a link to your privacy policy
3. If you don't have one, you can use a template from [Termly](https://termly.io) or similar services

---

## Phase 6: Submit for Review

### Step 6.1: Review Everything
Before submitting, verify:
- ✅ AAB file uploaded and validated
- ✅ Release notes added
- ✅ Testers added to closed testing track
- ✅ Store listing complete (for first release)
- ✅ Content rating completed
- ✅ Privacy policy linked
- ✅ App icon and screenshots look good

### Step 6.2: Submit for Review
1. Click the **Review** button (usually at the bottom of the page)
2. Google Play will perform automated checks on your app
3. Once checks pass, click **Submit** to send for review
4. You'll see a confirmation message

### Step 6.3: Monitor Review Status
1. Return to the app dashboard
2. In the left sidebar, click **Release** → **Closed testing**
3. You'll see the release status:
   - **In review** — Google is reviewing your app (usually 1-3 hours)
   - **Approved** — Your app is approved and available to testers
   - **Rejected** — Google found issues; you'll see detailed feedback

---

## Phase 7: Distribute to Testers

### Step 7.1: Share Testing Link
Once your app is **Approved**, testers will receive an email with:
- A link to test the app
- Instructions on how to install it
- A feedback form to report issues

### Step 7.2: Collect Feedback
1. Testers can install the app directly from the link
2. They can leave reviews and feedback in the Play Store
3. You can respond to feedback in the Play Console

### Step 7.3: Monitor Crash Reports
1. In the left sidebar, click **Quality** → **Crashes & ANRs**
2. Monitor any crashes reported by testers
3. Fix critical issues and upload a new build if needed

---

## Common Issues & Solutions

### Issue: "App bundle rejected due to missing permissions"
**Solution:** Check `app.config.ts` to ensure all required permissions are declared. Common ones for TimeKind:
- `POST_NOTIFICATIONS` (for push notifications)
- `INTERNET` (for API calls)
- `ACCESS_FINE_LOCATION` (if using location features)

### Issue: "Version code already exists"
**Solution:** Each new build must have a higher version code. Update `app.config.ts`:
```ts
version: "1.0.1", // Increment this
```
Then rebuild via the Publish button.

### Issue: "Content rating not completed"
**Solution:** Go to **App policies** → **Content rating** and complete the questionnaire before submitting.

### Issue: "Screenshots don't meet requirements"
**Solution:** Screenshots must be:
- PNG or JPEG format
- Minimum 320px, maximum 3840px on the longest side
- Minimum 16:9 or 9:16 aspect ratio
- No borders or frames

---

## Next Steps After Approval

### For Closed Testing
1. **Gather feedback** from testers over 1-2 weeks
2. **Fix bugs** and issues reported by testers
3. **Upload new builds** as needed (repeat the submission process)
4. **Iterate** until the app is stable and ready for wider release

### For Production Release
1. Once testing is complete and stable, move the release to **Production**
2. This makes the app available to all users on Google Play
3. Follow the same submission process but select **Production** instead of **Closed testing**

---

## Timeline Expectations

| Step | Time |
|------|------|
| Build generation (Publish button) | 10-30 minutes |
| AAB upload to Play Console | 1-2 minutes |
| Automated validation | 5-15 minutes |
| Google review | 1-3 hours (usually) |
| Testers receive email | 5-10 minutes after approval |
| Testing phase | 1-2 weeks (recommended) |

---

## Support & Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **App Bundle Documentation:** https://developer.android.com/guide/app-bundle
- **Content Rating Guide:** https://support.google.com/googleplay/android-developer/answer/188189

---

## Checklist Before Submitting

- [ ] Publish button clicked and build completed
- [ ] AAB file downloaded
- [ ] Google Play Console opened
- [ ] AAB file uploaded to closed testing track
- [ ] Testers added
- [ ] Release notes written
- [ ] Store listing complete (first release only)
- [ ] Content rating completed
- [ ] Privacy policy linked
- [ ] All details reviewed
- [ ] Submitted for review
- [ ] Received approval confirmation
- [ ] Testers received invitation email
