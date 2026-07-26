const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

const APP_URL = process.env.POCKET_TRACKER_URL || "https://yup-pocket-tracker.lovable.app";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 380,
    minHeight: 560,
    backgroundColor: "#0b0a1f",
    title: "Pocket Tracker",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  // Keep Google / OAuth popups inside the app window flow, open the rest in the OS browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/accounts\.google\.com|supabase\.co|lovable\.app/.test(url)) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 520,
          height: 680,
          autoHideMenuBar: true,
        },
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-fail-load", (_event, _code, description) => {
    mainWindow.loadFile(path.join(__dirname, "offline.html"), {
      hash: encodeURIComponent(description || "network error"),
    });
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Pocket Tracker",
        submenu: [
          { role: "reload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { role: "resetZoom" },
          { type: "separator" },
          { role: "quit" },
        ],
      },
      { role: "editMenu" },
    ]),
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
