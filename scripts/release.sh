#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"

echo "Building version ${VERSION}..."
npm run build

echo "Creating dist.zip..."
cd dist
zip -r ../dist.zip . -x '*.DS_Store'
cd ..

echo "Building Android APK..."
npx cap sync
cd android
./gradlew assembleRelease
cd ..
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

echo "Creating GitHub release ${TAG}..."
gh release create "${TAG}" dist.zip "${APK_PATH}" \
  --title "${TAG}" \
  --generate-notes \
  --latest

echo "Release ${TAG} published!"
rm dist.zip
