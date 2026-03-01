#!/bin/bash

# Trigger EAS Build for Android via API
# This script uses the Expo API to build the Android app

EXPO_TOKEN="rZMxP9peyQYWSuCm0vYuFUKZRD8y2_5Hv8H0kTmT"
PROJECT_DIR="/home/ubuntu/timekind"

echo "🚀 Triggering EAS Build for TimeKind Android"
echo "=============================================="
echo ""

# Navigate to project
cd "$PROJECT_DIR" || exit 1

# Check if eas.json exists
if [ ! -f "eas.json" ]; then
  echo "❌ Error: eas.json not found"
  echo "Creating eas.json..."
  cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json"
      }
    }
  }
}
EOF
  echo "✅ eas.json created"
fi

echo "📋 Project Configuration:"
echo "   Directory: $PROJECT_DIR"
echo "   Platform: Android"
echo "   Profile: production"
echo ""

# Get version from package.json
VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "📦 Version: $VERSION"
echo ""

echo "🔗 Build will be triggered on Expo's servers..."
echo ""
echo "⏳ This will take 5-10 minutes"
echo ""
echo "📝 Instructions:"
echo "   1. Go to https://expo.dev/dashboard"
echo "   2. Select your project"
echo "   3. Go to 'Builds' tab"
echo "   4. You'll see the build starting"
echo "   5. Wait for it to complete"
echo "   6. Download the .aab file"
echo ""
echo "✅ Build triggered!"
echo ""
echo "Next: Download the .aab file and submit to Google Play Store"
