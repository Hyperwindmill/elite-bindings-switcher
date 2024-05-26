import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

// Carica le variabili di ambiente dal file .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usa il percorso di Steam dalla variabile di ambiente e aggiungi compatdata
const steamPath = path.join(process.env.STEAM_PATH, "compatdata");
const archivePath = path.join(
  process.env.HOME,
  "elite_dangerous_bindings_backup"
);

if (!process.env.STEAM_PATH) {
  console.error("Error: please set the STEAM_PATH environment variable.");
  process.exit(1);
}

// Funzione per trovare il percorso dei bindings di Elite Dangerous
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
  throw new Error("Could not locate ED directory.");
}

// Funzione per eseguire il backup
async function backupBindings(bindingsPath, backupName) {
  const targetPath = path.join(archivePath, backupName);
  await fs.ensureDir(targetPath);
  await fs.copy(bindingsPath, targetPath);
  console.log(`Bindings saved as '${backupName}'.`);
}

// Funzione per ripristinare un backup
async function restoreBindings(bindingsPath, backupName) {
  const sourcePath = path.join(archivePath, backupName);
  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(`backup '${backupName}' does not exist.`);
  }
  await fs.copy(sourcePath, bindingsPath);
  console.log(`Bindings restored from '${backupName}'.`);
}

// Funzione per elencare i backup disponibili
async function listBackups() {
  const backups = await fs.readdir(archivePath);
  if (backups.length === 0) {
    console.log("No backup available.");
  } else {
    console.log("Backups available:");
    backups.forEach((backup) => console.log(backup));
  }
}

// Funzione principale
(async () => {
  try {
    await fs.ensureDir(archivePath);
    const bindingsPath = await findBindingsPath();

    const { action, backupName } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select an action",
        choices: ["backup", "restore", "list"],
      },
      {
        type: "input",
        name: "backupName",
        message: "Insert backup name: ",
        when: (answers) => answers.action !== "list",
      },
    ]);

    switch (action) {
      case "backup":
        await backupBindings(bindingsPath, backupName);
        break;
      case "restore":
        await restoreBindings(bindingsPath, backupName);
        break;
      case "list":
        await listBackups();
        break;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
