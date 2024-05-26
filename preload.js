const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  backup: (backupName) => ipcRenderer.invoke("backup", backupName),
  restore: (backupName) => ipcRenderer.invoke("restore", backupName),
  list: () => ipcRenderer.invoke("list").then((response) => response.backups),
});
