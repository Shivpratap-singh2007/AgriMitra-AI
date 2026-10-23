/**
 * AgriMitra AI - Electron Main Process for Windows Desktop
 * Launches the embedded FastAPI backend and wraps the production web UI
 * in a native Windows desktop window.
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let backendProcess = null;
const BACKEND_PORT = 5001;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

function isBackendRunning(callback) {
  const req = http.get(`${BACKEND_URL}/api/health`, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
  });
  req.on('error', () => callback(false));
  req.setTimeout(1000, () => {
    req.abort();
    callback(false);
  });
}

function startBackend() {
  const isWin = process.platform === 'win32';
  const rootDir = path.resolve(__dirname, '..');
  const pythonExecutable = isWin
    ? path.join(rootDir, '.venv', 'Scripts', 'python.exe')
    : path.join(rootDir, '.venv', 'bin', 'python');

  console.log('[Electron] Starting Python FastAPI backend...');
  backendProcess = spawn(
    pythonExecutable,
    ['-m', 'uvicorn', 'main:app', '--app-dir', 'backend', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)],
    {
      cwd: rootDir,
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
      stdio: 'pipe'
    }
  );

  backendProcess.stdout.on('data', (data) => {
    console.log(`[FastAPI] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[FastAPI Error] ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`[FastAPI] Process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'AgriMitra AI — Crop Doctor & Farming Assistant',
    icon: path.join(__dirname, '..', 'frontend', 'public', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    autoHideMenuBar: true,
    backgroundColor: '#F3F5F7'
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Poll backend health until ready, then load URL
  let attempts = 0;
  const pollInterval = setInterval(() => {
    attempts++;
    isBackendRunning((running) => {
      if (running) {
        clearInterval(pollInterval);
        console.log('[Electron] Backend is live. Loading web application...');
        mainWindow.loadURL(BACKEND_URL);
      } else if (attempts > 30) {
        clearInterval(pollInterval);
        console.error('[Electron] Backend failed to start within timeout.');
        mainWindow.loadURL(`data:text/html,<h2>AgriMitra AI failed to start backend server. Please check python environment.</h2>`);
      }
    });
  }, 500);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  isBackendRunning((alreadyRunning) => {
    if (!alreadyRunning) {
      startBackend();
    } else {
      console.log('[Electron] Existing backend detected on port 5001.');
    }
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      console.log('[Electron] Terminating background Python server...');
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
