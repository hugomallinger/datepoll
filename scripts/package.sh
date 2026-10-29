#!/bin/sh
# Builds the zip to upload to the Chrome Web Store: only the files the extension
# loads, nothing from tests, store material or development.
set -e
cd "$(dirname "$0")/.."

version=$(node -p "require('./manifest.json').version")
out="dist/datepoll-$version.zip"

mkdir -p dist
rm -f "$out"
zip -q -X "$out" \
  manifest.json \
  selectors.js fill-poll.js dates.js panel.js content.js \
  panel.css \
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png

echo "$out"
