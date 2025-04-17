
// Simple script to start electron in development mode
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Electron in development mode...');
try {
  execSync('node electron/dev-runner.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running Electron:', error);
}
