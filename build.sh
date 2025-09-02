#!/bin/bash

echo "Building Figma plugin..."

mkdir -p dist

npx tsc src/code.ts --outDir dist --target ES2020 --module ES2020 --lib ES2020 --skipLibCheck

npx tsc src/ui.ts --outDir dist --target ES2020 --module ES2020 --lib ES2020,DOM --skipLibCheck

cp src/ui.html dist/ui.html

cp manifest.json dist/manifest.json

echo "Build complete! Files in dist/"