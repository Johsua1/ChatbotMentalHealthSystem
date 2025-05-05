import { spawn } from 'child_process';
import path from 'path';

// Start Vite dev server
const vite = spawn('npm', ['run', 'vite'], {
  stdio: 'inherit',
  shell: true
});

// Start Python backend server
const python = spawn('python', ['Backend/app.py'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
const cleanup = () => {
  vite.kill();
  python.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);