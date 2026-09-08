const { app, BrowserWindow, Menu, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 940,
        minWidth: 980,
        minHeight: 700,
        backgroundColor: "#030a08",
        title: "AgriMitra AI",
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("https://") || url.startsWith("http://")) {
            shell.openExternal(url);
        }
        return { action: "deny" };
    });
}

function startBackend() {
    const runtime = app.isPackaged ? process.execPath : (process.env.npm_node_execpath || process.execPath);
    const runtimeArgs = app.isPackaged ? [path.join(__dirname, "backend", "server.js")] : [path.join(__dirname, "backend", "server.js")];
    backendProcess = spawn(runtime, runtimeArgs, {
        cwd: __dirname,
        env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
        stdio: "ignore",
        windowsHide: true
    });

    backendProcess.on("error", (error) => {
        console.error("Unable to start AgriMitra backend:", error);
    });
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    startBackend();
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill();
    }
    if (process.platform !== "darwin") {
        app.quit();
    }
});
