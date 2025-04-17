
const { spawn } = require('child_process');
const electron = require('electron');
const waitOn = require('wait-on');
const path = require('path');

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  env: process.env,
  stdio: 'inherit'
});

// Wait for Vite dev server to be ready
waitOn({
  resources: ['http://localhost:8080'],
  timeout: 30000
}).then(() => {
  // Start Electron
  const electronProcess = spawn(electron, [path.join(__dirname, 'main.js')], {
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:8080',
      NODE_ENV: 'development'
    },
    stdio: 'inherit'
  });

  electronProcess.on('close', () => {
    viteProcess.kill();
    process.exit();
  });
}).catch(error => {
  console.error('Error starting Electron app:', error);
  viteProcess.kill();
  process.exit(1);
});
