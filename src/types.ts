export interface Backup {
  name: string;
  hash: string;
  devices?: string[];
  active: boolean;
}

interface EliteApi {
  backup(name: string): Promise<{ success: boolean; message?: string }>;
  restore(name: string): Promise<{ success: boolean; message?: string }>;
  setSteamPath(path: string): Promise<void>;
  list(): Promise<Backup[]>;
}

declare global {
  interface Window {
    api: EliteApi;
  }
}
