import path from "path";
import os from "os";
import { app, BrowserWindow, Menu, nativeTheme, Tray } from "electron";
import isDev from "electron-is-dev";
import serve from "electron-serve";
import "./lib/log";
import "./lib/ipc";
import "./lib/update";
import { getOpenAtLogin, setOpenAtLogin } from "./lib/settings";
import { start, stop } from "./sync";

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

const platform = os.platform();

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

serve({ directory: "app" });

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 720,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#000" : "#fff",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.setAlwaysOnTop(true);

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow!.hide();
    }
  });

  if (isDev) {
    const port = process.argv[2];
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("app://./index.html");
  }

  return mainWindow;
}

function showMainWindow() {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
  mainWindow.show();
}

function createTray() {
  const tray = new Tray(
    isDev
      ? path.resolve(
          __dirname,
          platform === "win32"
            ? "../assets/icon.ico"
            : "../assets/trayTemplate.png"
        )
      : path.resolve(
          process.resourcesPath,
          platform === "win32" ? "icon.ico" : "trayTemplate.png"
        )
  );
  if (platform === "win32") {
    tray.on("click", () => {
      showMainWindow();
    });
  }
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "打开 learnX Companion",
        click: () => {
          showMainWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "退出",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ])
  );
  return tray;
}

app.on("ready", async () => {
  setOpenAtLogin(await getOpenAtLogin());
  start();

  createTray();
  app.dock?.hide();
});

app.on("activate", () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on("second-instance", () => {
  showMainWindow();
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("will-quit", () => {
  stop();
});
