export class BindingsService {
  async loadBackups() {
    //@ts-expect-error because of electron api
    const backups = await window.api.list();
    return backups;
  }
  async backup(backupName: string) {
    //@ts-expect-error because of electron api
    const result = await window.api.backup(backupName);
    if (result.success) {
      return true;
    } else {
      throw result.message;
    }
  }
  async restore(backupName: string) {
    //@ts-expect-error because of electron api
    const result = await window.api.restore(backupName);
    if (result.success) {
      return true;
    } else {
      throw result.message;
    }
  }
}
