#!/bin/bash
set -e

echo "🔨 Building TimeKind Android App Bundle..."
echo ""

# Check prerequisites
if ! command -v gradle &> /dev/null; then
  echo "❌ Gradle not found. Installing..."
  # Gradle will be available through Android SDK
fi

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build the AAB (Android App Bundle)
echo "📦 Building Android App Bundle (AAB)..."
./gradlew bundleRelease

# Find the generated AAB
AAB_FILE=$(find . -name "*.aab" -type f | head -1)

if [ -z "$AAB_FILE" ]; then
  echo "❌ Failed to build AAB"
  exit 1
fi

echo ""
echo "✅ Build successful!"
echo "📍 AAB location: $AAB_FILE"
echo ""
echo "Next steps:"
echo "1. Download the AAB file"
echo "2. Go to Google Play Console"
echo "3. Navigate to your app → Release → Production"
echo "4. Click 'Create new release'"
echo "5. Upload the AAB file"
echo "6. Add release notes and submit for review"
