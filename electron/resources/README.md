
# Electron Resources

This directory contains resources needed for building the Electron app.

For production, you would need to add proper icons to this directory:

- `icon.icns` - macOS app icon (will be auto-generated during build if missing)
- `icon.ico` - Windows app icon 
- `icons/` - Linux app icons in various sizes

The build script will attempt to proceed even if these icons are missing, but for a production app, you should add proper icons.
