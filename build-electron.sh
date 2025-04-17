
#!/bin/bash

# Build the React app
echo "Building the React app..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: 'dist' directory not found. React build may have failed."
  exit 1
fi

# Create release directory if it doesn't exist
if [ ! -d "release" ]; then
  mkdir -p release
  echo "Created 'release' directory."
fi

# Install electron-builder if needed
if ! npm list -g electron-builder > /dev/null 2>&1; then
    echo "Installing electron-builder..."
    npm install -g electron-builder
fi

# Make sure we have the resources directory
if [ ! -d "electron/resources" ]; then
  mkdir -p electron/resources
  echo "Created 'electron/resources' directory."
fi

# Build the Electron app for macOS
echo "Building Electron app for macOS..."
npx electron-builder --mac --config electron-builder.yml

echo "Build complete! The app should be in the 'release' directory."
echo "If the release directory is empty, please check for errors above."
echo "Current working directory: $(pwd)"
echo "Contents of release directory: $(ls -la release 2>/dev/null || echo 'Directory not found or empty')"
