
#!/bin/bash

# Build the React app
echo "Building the React app..."
npm run build

# Install electron-builder globally if needed
if ! command -v electron-builder &> /dev/null; then
    echo "Installing electron-builder..."
    npm install -g electron-builder
fi

# Build the Electron app for macOS
echo "Building Electron app for macOS..."
electron-builder --mac --config electron-builder.yml

echo "Build complete! Check the 'release' directory for your macOS app."
