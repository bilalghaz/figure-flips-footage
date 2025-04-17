
#!/bin/bash

# Make sure we're in the project root
cd "$(dirname "$0")"

echo "Cleaning previous builds..."
rm -rf dist release

echo "Installing dependencies..."
npm install

echo "Building the React app..."
npm run build

if [ ! -d "dist" ]; then
  echo "Error: React build failed - 'dist' directory not found."
  exit 1
fi

echo "Creating electron app directories..."
mkdir -p release

echo "Building Electron app..."
# Use npx to run the locally installed electron-builder
npx electron-builder --mac --config electron-builder.yml

echo "-----------------------------------"
echo "Build Results:"
echo "-----------------------------------"
echo "Current directory: $(pwd)"
if [ -d "release" ]; then
  echo "Release contents:"
  ls -la release
else
  echo "Release directory not found!"
fi
echo "-----------------------------------"
