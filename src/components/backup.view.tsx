import { ReactNode, useEffect, useState } from "react";
import { BindingsService } from "../services/bindings.service";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataView } from "primereact/dataview";
interface BVInput {
  service: BindingsService;
}
export function BackupView(options: BVInput) {
  const [backups, setBackups] = useState<Array<string>>([]);
  const loadBackups = () => {
    options.service.loadBackups().then((res) => {
      setBackups(res);
    });
  };
  const restoreBackup = (backup: string) => {
    options.service
      .restore(backup)
      .then(() => {
        alert("Backup " + backup + " restored");
      })
      .catch((err) => {
        alert("Error: " + err);
      });
  };
  useEffect(() => {
    loadBackups();
  }, []);
  const itemTemplate = (backup: string, index: number) => {
    return (
      <div className="col-12" key={backup}>
        <div
          className={classNames(
            "flex flex-column xl:flex-row xl:align-items-start p-4 gap-4",
            { "border-top-1 surface-border": index !== 0 }
          )}
        >
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="backup-name flex flex-column align-items-center sm:align-items-start gap-3">
              {backup}
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <Button
                className="p-button-rounded"
                label="Restore"
                onClick={() => restoreBackup(backup)}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const listTemplate = (items: string[]): ReactNode[] => {
    if (!items || items.length === 0) return null;

    const list = items.map((product, index) => {
      return itemTemplate(product, index);
    });

    return [<div className="grid grid-nogutter">{list}</div>];
  };
  return (
    <>
      <DataView value={backups} listTemplate={listTemplate}></DataView>
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
