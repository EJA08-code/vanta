#!/bin/bash
# Builds Vanta.app next to vanta.html. Run: bash native/build_app.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -I src/build.py
APP=Vanta.app; rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
swiftc -O -framework Cocoa -framework WebKit native/main.swift -o "$APP/Contents/MacOS/Vanta"
cp native/Info.plist "$APP/Contents/"
cp vanta.html "$APP/Contents/Resources/"
cp assets/Vanta.icns "$APP/Contents/Resources/"
codesign --force --deep --sign - "$APP"
echo "built $APP"
