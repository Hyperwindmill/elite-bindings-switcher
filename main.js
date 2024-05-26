import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const steamPath = path.join(process.env.STEAM_PATH, "compatdata");
const archivePath = path.join(
  process.env.HOME,
  "elite_dangerous_bindings_backup"
);

if (!process.env.STEAM_PATH) {
  console.error("Error: STEAM_PATH environment variable is not set.");
  process.exit(1);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function findBindingsPath() {
  const candidates = await fs.readdir(steamPath);
  for (const candidate of candidates) {
    const bindingsPath = path.join(
      steamPath,
      candidate,
      "pfx",
      "drive_c",
      "users",
      "steamuser",
      "AppData",
      "Local",
      "Frontier Developments",
      "Elite Dangerous",
      "Options",
      "Bindings"
    );
    if (await fs.pathExists(bindingsPath)) {
      return bindingsPath;
    }
  }
  throw new Error("Bindings directory not found.");
}

async function backupBindings(bindingsPath, backupName) {
  const targetPath = path.join(archivePath, backupName);
  await fs.ensureDir(targetPath);
  await fs.copy(bindingsPath, targetPath);
}

async function restoreBindings(bindingsPath, backupName) {
  const sourcePath = path.join(archivePath, backupName);
  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(`Backup '${backupName}' does not exist.`);
  }
  await fs.copy(sourcePath, bindingsPath);
}

async function listBackups() {
  try {
    console.log("Listing backups in", archivePath);
    const backups = await fs.readdir(archivePath);
    console.log("Backups found:", backups);
    return backups;
  } catch (error) {
    console.error("Error listing backups:", error);
    throw error;
  }
}

ipcMain.handle("backup", async (event, backupName) => {
  try {
    const bindingsPath = await findBindingsPath();
    await backupBindings(bindingsPath, backupName);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("restore", async (event, backupName) => {
  try {
    const bindingsPath = await findBindingsPath();
    await restoreBindings(bindingsPath, backupName);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("list", async () => {
  try {
    const backups = await listBackups();
    return { success: true, backups };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
