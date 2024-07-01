import { useEffect, useState } from "react";
import { BindingsService } from "../services/bindings.service";
interface BVInput {
  service: BindingsService;
}
export function BackupView(options: BVInput) {
  const [backups, setBackups] = useState([]);
  const loadBackups = () => {
    options.service.loadBackups().then((res) => {
      setBackups(res);
    });
  };
  useEffect(() => {
    loadBackups();
  }, []);
  return (
    <>
      <div>
        <button id="list-backups">List Backups</button>
        <ul id="backups-list">
          {backups.map((val) => {
            return <li>{val}</li>;
          })}
        </ul>
      </div>
      <div>
        <input type="text" id="backup-name" placeholder="Backup Name" />
        <button id="backup">Backup</button>
      </div>
      <div>
        <input type="text" id="restore-name" placeholder="Backup Name" />
        <button id="restore">Restore</button>
      </div>
    </>
  );
}
