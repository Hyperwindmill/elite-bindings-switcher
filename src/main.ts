import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs-extra";
import { Backup } from "./types";
import crypto from "crypto";

if (require("electron-squirrel-startup")) {
  app.quit();
}

const archivePath = path.join(
  process.env.HOME ||
    path.join(process.env.APPDATA, "EliteDangerousBindingsSwitcher"),
  "elite_dangerous_bindings_backup"
);
const settingsPath = path.join(archivePath, "settings.json");

const getSteamPath = () => {
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    return settings.steamPath ?? "";
  }
  return "";
};

const saveSteamPath = (steamPath: string) => {
  fs.ensureDirSync(archivePath);
  fs.writeFileSync(settingsPath, JSON.stringify({ steamPath }));
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function findBindingsPath(): string {
  if (process.platform === "win32") {
    const bindingsPath = path.join(
      process.env.APPDATA,
      "..",
      "Local",
      "Frontier Developments",
      "Elite Dangerous",
      "Options",
      "Bindings"
    );
    return fs.pathExistsSync(bindingsPath) ? bindingsPath : "";
  }

  const stp = getSteamPath();
  if (!stp) return "";

  const compatdataPath = path.join(stp, "compatdata");
  for (const candidate of fs.readdirSync(compatdataPath)) {
    const bindingsPath = path.join(
      compatdataPath,
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
    if (fs.pathExistsSync(bindingsPath)) {
      return bindingsPath;
    }
  }
  return "";
}

function findHash(targetPath: string): string {
  const bindsFiles = fs.readdirSync(targetPath)
    .filter((f) => path.extname(f) === ".binds")
    .sort();
  if (bindsFiles.length === 0) return "";
  const hash = crypto.createHash("md5");
  for (const fileName of bindsFiles) {
    hash.update(fileName); // include filename so renamed files change the hash
    hash.update(fs.readFileSync(path.join(targetPath, fileName)));
  }
  return hash.digest("hex");
}

async function backupBindings(bindingsPath: string, backupName: string) {
  const targetPath = path.join(archivePath, backupName);
  await fs.ensureDir(targetPath);
  await fs.copy(bindingsPath, targetPath);
}

async function restoreBindings(bindingsPath: string, backupName: string) {
  const sourcePath = path.join(archivePath, backupName);
  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(`Backup '${backupName}' does not exist.`);
  }
  // Remove existing .binds files before restoring to avoid stale files from previous profiles
  for (const file of await fs.readdir(bindingsPath)) {
    if (path.extname(file) === ".binds") {
      await fs.remove(path.join(bindingsPath, file));
    }
  }
  await fs.copy(sourcePath, bindingsPath);
}

async function listBackups(bindingsPath: string): Promise<Backup[]> {
  await fs.ensureDir(archivePath);
  const mainHash = findHash(bindingsPath);
  const entries = await fs.readdir(archivePath);
  const backupNames = entries.filter((e) => e !== "settings.json");

  return backupNames.map((name) => {
    const hash = findHash(path.join(archivePath, name));
    return { name, hash, active: !!mainHash && hash === mainHash };
  });
}

ipcMain.handle("backup", async (_event, backupName: string) => {
  const bindingsPath = findBindingsPath();
  try {
    if (!bindingsPath) throw new Error("Bindings path not found");
    await backupBindings(bindingsPath, backupName);
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});

ipcMain.handle("restore", async (_event, backupName: string) => {
  const bindingsPath = findBindingsPath();
  try {
    if (!bindingsPath) throw new Error("Bindings path not found");
    await restoreBindings(bindingsPath, backupName);
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});

ipcMain.handle("steamPath", (_event, steamPath: string) => {
  saveSteamPath(steamPath);
});

ipcMain.handle("list", async () => {
  try {
    const bindingsPath = findBindingsPath();
    if (!bindingsPath) throw new Error("Bindings path not found");
    const backups = await listBackups(bindingsPath);
    return { success: true, backups };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});
