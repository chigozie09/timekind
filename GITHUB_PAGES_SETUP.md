# How to Host Privacy Policy on GitHub Pages

This guide walks you through creating a GitHub repository and hosting your privacy policy publicly using GitHub Pages. This takes about 10-15 minutes.

---

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com
2. Click **Sign up**
3. Enter your email, create a password, choose a username
4. Click **Create account**
5. Verify your email address
6. Complete the setup wizard

**Your GitHub username will be used in your privacy policy URL.**

---

## Step 2: Create a New Repository

1. Log in to GitHub at https://github.com
2. Click the **+** icon in the top right corner
3. Select **New repository**

### Repository Settings

Fill in these details:

| Field | Value | Notes |
|-------|-------|-------|
| Repository name | `timekind-legal` | Keep it simple and descriptive |
| Description | `Legal documents for TimeKind app` | Optional but helpful |
| Public/Private | **Public** | Must be public for GitHub Pages to work |
| Initialize with README | ✅ Yes | Helps with setup |
| .gitignore | None needed | Skip this |
| License | MIT | Optional but recommended |

4. Click **Create repository**

**You now have a GitHub repository!**

---

## Step 3: Add Your Privacy Policy

### Option A: Upload via GitHub Web Interface (Easiest)

1. Go to your new repository (you should already be there)
2. Click **Add file** → **Create new file**
3. Name the file: `privacy-policy.md`
4. Copy and paste the content from your `PRIVACY_POLICY.md` file
5. Scroll down and click **Commit new file**
6. Add commit message: "Add privacy policy"
7. Click **Commit changes**

### Option B: Upload via Git Command Line (More Advanced)

If you prefer using Git:

```bash
# Clone your repository
git clone https://github.com/YOUR-USERNAME/timekind-legal.git
cd timekind-legal

# Copy your privacy policy file
cp /path/to/PRIVACY_POLICY.md privacy-policy.md

# Add, commit, and push
git add privacy-policy.md
git commit -m "Add privacy policy"
git push origin main
```

---

## Step 4: Add Terms of Service (Optional)

Repeat Step 3 to add your Terms of Service:

1. Click **Add file** → **Create new file**
2. Name the file: `terms-of-service.md`
3. Paste your Terms of Service content
4. Click **Commit new file**

---

## Step 5: Enable GitHub Pages

Now we'll make your files publicly accessible as a website.

1. Go to your repository
2. Click **Settings** (top right, gear icon)
3. In the left sidebar, click **Pages** (under "Code and automation")

### Configure GitHub Pages

1. Under **Source**, select **Deploy from a branch**
2. Under **Branch**, select:
   - Branch: `main`
   - Folder: `/ (root)`
3. Click **Save**

**GitHub Pages is now enabled!**

---

## Step 6: Get Your Privacy Policy URL

Your privacy policy will be available at:

```
https://YOUR-USERNAME.github.io/timekind-legal/privacy-policy
```

**Replace `YOUR-USERNAME` with your actual GitHub username.**

### Example

If your GitHub username is `kingsley09`, your URL would be:

```
https://kingsley09.github.io/timekind-legal/privacy-policy
```

### Verify It Works

1. Open the URL in your browser
2. You should see your privacy policy rendered as a webpage
3. Copy this URL for your Google Play Store submission

---

## Step 7: Add a Custom Domain (Optional)

If you want a shorter, custom URL like `https://timekind.app/privacy-policy`, you can:

1. Buy a domain (GoDaddy, Namecheap, Google Domains)
2. Go to repository **Settings** → **Pages**
3. Under **Custom domain**, enter your domain
4. Update your domain's DNS settings (GitHub provides instructions)

**For now, the GitHub Pages URL is fine for Google Play Store.**

---

## Step 8: Create a README (Optional but Recommended)

Add a nice README to your repository:

1. Click **Add file** → **Create new file**
2. Name it: `README.md`
3. Paste this content:

```markdown
# TimeKind Legal Documents

This repository contains the legal documents for the TimeKind mobile app.

## Documents

- [Privacy Policy](https://YOUR-USERNAME.github.io/timekind-legal/privacy-policy)
- [Terms of Service](https://YOUR-USERNAME.github.io/timekind-legal/terms-of-service)

## About TimeKind

TimeKind is a neurodivergent-friendly task tracking app available on Google Play Store.

- **App**: [TimeKind on Google Play](https://play.google.com/store/apps/details?id=com.timekind)
- **Website**: [timekind.app](https://timekind.app)
```

4. Click **Commit new file**

---

## Your Privacy Policy URL

Once you complete these steps, you'll have:

**Privacy Policy URL:**
```
https://YOUR-USERNAME.github.io/timekind-legal/privacy-policy
```

**Use this URL in Google Play Console:**
1. Go to Google Play Console
2. Select TimeKind app
3. Go to **App content**
4. Paste the privacy policy URL in the **Privacy policy** field
5. Save

---

## Troubleshooting

### URL Shows 404 Error

**Problem**: The page says "404 - Not Found"

**Solution**:
1. Wait 5-10 minutes for GitHub Pages to build
2. Check that the file is named `privacy-policy.md` (lowercase, with hyphens)
3. Verify the repository is **Public** (not Private)
4. Check that GitHub Pages is enabled in Settings → Pages

### Markdown Not Rendering

**Problem**: You see raw markdown code instead of formatted text

**Solution**:
1. Make sure the file ends with `.md` extension
2. GitHub automatically renders `.md` files as HTML
3. If it still doesn't work, refresh the page

### Can't Find Settings → Pages

**Problem**: The Pages option isn't visible in Settings

**Solution**:
1. Make sure the repository is **Public**
2. GitHub Pages is only available for public repositories
3. If private, you need GitHub Pro (paid)

---

## What Your Privacy Policy URL Looks Like

When you visit your privacy policy URL, it will look like this:

```
https://kingsley09.github.io/timekind-legal/privacy-policy
```

The page will display your privacy policy in a clean, readable format with:
- Proper markdown formatting
- Headings and sections
- Links and formatting
- Professional appearance

---

## Next Steps After Setup

1. **Copy your privacy policy URL**
2. **Go to Google Play Console**
3. **Navigate to App content**
4. **Paste the URL in the Privacy policy field**
5. **Save and submit your app**

---

## Quick Reference

| Step | Action | Time |
|------|--------|------|
| 1 | Create GitHub account | 5 min |
| 2 | Create repository | 2 min |
| 3 | Add privacy policy file | 2 min |
| 4 | Enable GitHub Pages | 1 min |
| 5 | Get URL | 1 min |
| 6 | Test URL | 2 min |
| **Total** | | **13 min** |

---

## Example: Complete Setup

Here's what your repository will look like:

```
timekind-legal/
├── README.md                 (Overview of the repo)
├── privacy-policy.md         (Your privacy policy)
└── terms-of-service.md       (Your terms of service)
```

**Public URLs:**
- Privacy Policy: `https://kingsley09.github.io/timekind-legal/privacy-policy`
- Terms of Service: `https://kingsley09.github.io/timekind-legal/terms-of-service`

---

## Tips for Success

✅ **Use a descriptive repository name** - `timekind-legal` is clear  
✅ **Make the repository public** - Required for GitHub Pages  
✅ **Wait a few minutes** - GitHub Pages takes time to build  
✅ **Test the URL** - Visit it in your browser before submitting  
✅ **Keep files updated** - Update privacy policy if terms change  
✅ **Add a README** - Helps visitors understand the repo  

---

## Support

If you get stuck:

1. **GitHub Pages Help**: https://docs.github.com/en/pages
2. **GitHub Community**: https://github.community
3. **Stack Overflow**: Search "GitHub Pages" + your issue

---

**You're all set!** Your privacy policy will be publicly accessible and ready for Google Play Store submission. 🚀
