# Android Local Build Guide for Google Play Store

Complete guide for building TimeKind locally and submitting to Google Play Store without EAS Build.

## Quick Summary

**Two Options:**

1. **Option A: Use EAS Build (Recommended)** — Cloud-based builds, no local setup needed
2. **Option B: Local Build** — Build on your machine, requires Android SDK setup

This guide covers **Option B** for local building.

---

## Option A: EAS Build (Recommended - Fastest)

If you want to use cloud-based EAS Build instead:

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to EAS

```bash
eas login
# Follow the prompts to sign in with your Expo account
```

### Step 3: Build for Android

```bash
cd /home/ubuntu/timekind

# Build for Android
eas build --platform android --profile production

# Wait for build to complete (5-10 minutes)
# You'll get a download link for the APK/AAB
```

### Step 4: Download Build

Once complete, you'll see a download link. Download the `.aab` file (recommended) or `.apk`.

**Then skip to "Step 6: Fill App Store Listing" in GOOGLE_PLAY_PUBLISHING_GUIDE.md**

---

## Option B: Local Android Build

If you prefer to build locally on your machine:

### Prerequisites

- **Android SDK** installed
- **Java Development Kit (JDK)** 11 or higher
- **Gradle** (included with Android SDK)
- **Mac, Windows, or Linux** with 10GB free disk space

### Step 1: Install Android SDK

#### On macOS (with Homebrew):

```bash
# Install Android SDK
brew install android-sdk

# Set environment variables
export ANDROID_SDK_ROOT=/usr/local/share/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools
```

#### On Windows:

1. Download Android Studio from https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → Settings → SDK Manager
4. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
5. Note the SDK location (usually `C:\Users\YourName\AppData\Local\Android\Sdk`)

#### On Linux:

```bash
# Install Android SDK
sudo apt-get install android-sdk

# Set environment variables
export ANDROID_SDK_ROOT=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools
```

### Step 2: Install Java Development Kit

#### On macOS:

```bash
brew install openjdk@11
export JAVA_HOME=/usr/local/opt/openjdk@11
```

#### On Windows:

1. Download JDK 11 from https://www.oracle.com/java/technologies/downloads/
2. Install to default location
3. Set JAVA_HOME environment variable to installation path

#### On Linux:

```bash
sudo apt-get install openjdk-11-jdk
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

### Step 3: Configure Gradle

Create or update `android/gradle.properties`:

```properties
# Gradle settings
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
org.gradle.parallel=true
org.gradle.daemon=true

# Android settings
android.useAndroidX=true
android.enableJetifier=true
```

### Step 4: Build APK/AAB

```bash
cd /home/ubuntu/timekind

# Generate Android build
expo build:android

# Or with Gradle directly
cd android
./gradlew bundleRelease

# Output will be in:
# android/app/build/outputs/bundle/release/app-release.aab
# or
# android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Sign APK/AAB

If building with Gradle, the APK/AAB is already signed. If not:

```bash
# Generate keystore (one-time)
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app-release.apk my-key-alias

# Verify signature
jarsigner -verify -verbose -certs app-release.apk
```

### Step 6: Upload to Google Play Store

Follow "Step 6: Fill App Store Listing" in GOOGLE_PLAY_PUBLISHING_GUIDE.md

---

## Troubleshooting Local Build

### Error: "Android SDK not found"

**Solution:**

```bash
# Set Android SDK path
export ANDROID_SDK_ROOT=/path/to/android/sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

# Verify
echo $ANDROID_SDK_ROOT
```

### Error: "Java not found"

**Solution:**

```bash
# Set Java home
export JAVA_HOME=/path/to/java

# Verify
java -version
```

### Error: "Gradle build failed"

**Solution:**

```bash
# Clean build
cd android
./gradlew clean

# Rebuild
./gradlew bundleRelease
```

### APK is too large (>100MB)

**Solution:**

1. Enable ProGuard/R8 minification
2. Remove unused dependencies
3. Use AAB format instead of APK (recommended)

---

## Recommended: Use EAS Build

For simplicity and reliability, I recommend using EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform android --profile production

# Download when complete
```

This handles all the complexity and produces an optimized build.

---

## Next Steps

1. **Build APK/AAB** using either Option A or B
2. **Follow GOOGLE_PLAY_PUBLISHING_GUIDE.md** starting at "Step 6: Fill App Store Listing"
3. **Upload to Google Play Console**
4. **Submit for review**
5. **Monitor review status**

---

## Support

- **Expo Build Documentation:** https://docs.expo.dev/build/introduction/
- **Android Build Documentation:** https://developer.android.com/build
- **Google Play Console Help:** https://support.google.com/googleplay/android-developer

---

**Last Updated:** March 1, 2026
**Status:** ✅ Ready to Build
