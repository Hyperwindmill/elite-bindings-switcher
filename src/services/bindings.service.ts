import { Backup } from "../types";

export class BindingsService {
  async loadBackups(): Promise<Backup[]> {
    return window.api.list();
  }

  async saveSteamPath(steamPath: string): Promise<void> {
    return window.api.setSteamPath(steamPath);
  }

  async backup(backupName: string): Promise<boolean> {
    const result = await window.api.backup(backupName);
    if (result.success) return true;
    throw new Error(result.message);
  }

  async restore(backupName: string): Promise<boolean> {
    const result = await window.api.restore(backupName);
    if (result.success) return true;
    throw new Error(result.message);
  }
}
