#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"
REPO="Youwenqwq/ysu-client"

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

# Read versionName from build.gradle and compute versionCode
APK_VERSION_NAME=$(grep 'versionName' android/app/build.gradle | grep -oP '"[0-9]+\.[0-9]+\.[0-9]+"' | tr -d '"')
IFS='.' read -r V_MAJOR V_MINOR V_PATCH <<< "${APK_VERSION_NAME}"
APK_VERSION_CODE=$(( V_MAJOR * 10000 + V_MINOR * 100 + V_PATCH ))

echo "Generating version.json..."
cat > version.json <<EOF
{
  "apkVersionCode": ${APK_VERSION_CODE},
  "webVersion": "${VERSION}",
  "apkDownloadUrl": "https://github.com/${REPO}/releases/download/${TAG}/app-release.apk"
}
EOF

echo "Creating GitHub release ${TAG}..."
gh release create "${TAG}" dist.zip "${APK_PATH}" version.json \
  --title "${TAG}" \
  --generate-notes \
  --latest

echo "Release ${TAG} published!"
rm dist.zip version.json
