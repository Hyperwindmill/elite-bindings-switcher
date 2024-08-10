import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
import { Backup } from "./components/backup.view";
import { Md5 } from "ts-md5";
dotenv.config();
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const steamPath = path.join(process.env.STEAM_PATH, "compatdata");
const archivePath = path.join(
  process.env.HOME,
  "elite_dangerous_bindings_backup"
);

if (!process.env.STEAM_PATH) {
  console.error("Error: STEAM_PATH environment variable is not set.");
  process.exit(1);
}
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
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
  await fs.copy(sourcePath, bindingsPath);
}
function findHash(targetPath: string): string {
  let hash = "";
  const files = fs.readdirSync(targetPath);
  files.forEach((fileName) => {
    if (path.extname(fileName) === ".binds") {
      console.log("found file " + fileName + " -> " + path.extname(fileName));
      hash = Md5.hashStr(
        fs.readFileSync(path.join(targetPath, fileName), {
          encoding: "base64",
        })
      );
    }
  });
  return hash;
}
async function listBackups(bindingsPath?: string): Promise<Backup[]> {
  try {
    const mainHash = bindingsPath ? findHash(bindingsPath) : "";
    console.log('MAIN: '+mainHash);
    console.log("Listing backups in", archivePath);
    const backups = await fs.readdir(archivePath);
    console.log("Backups found:", backups);
    return backups.map((name) => {
      const hashCurrent = findHash(path.join(archivePath, name));
      return {
        name: name,
        hash: hashCurrent,
        active: mainHash && hashCurrent === mainHash,
      };
    });
  } catch (error) {
    console.error("Error listing backups:", error);
    throw error;
  }
}

ipcMain.handle("backup", async (event, backupName) => {
  try {
    const bindingsPath = await findBindingsPath();
    console.log(
      "Backing up current bindings from " + bindingsPath + " to " + backupName
    );
    await backupBindings(bindingsPath, backupName);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("restore", async (event, backupName) => {
  try {
    const bindingsPath = await findBindingsPath();
    console.log(
      "Restoring bindings from " + backupName + " to " + bindingsPath
    );
    await restoreBindings(bindingsPath, backupName);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("list", async () => {
  try {
    const bindingsPath = await findBindingsPath();
    const backups = await listBackups(bindingsPath);
    return { success: true, backups };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
