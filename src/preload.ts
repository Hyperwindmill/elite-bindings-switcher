import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  backup: (backupName:string) => ipcRenderer.invoke("backup", backupName),
  restore: (backupName:string) => ipcRenderer.invoke("restore", backupName),
  list: () => ipcRenderer.invoke("list").then((response) => response.backups),
});
