import { ColumnBodyOptions } from "primereact/column";
import { BindingsService } from "../services/bindings.service";
import { GenericDataTable } from "./datatable";
import { Button } from "primereact/button";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Backup } from "../types";

interface BVInput {
  service: BindingsService;
}

export function BackupView({ service }: BVInput) {
  const [missingPath, setMissingPath] = useState<boolean>(false);
  const [manualPath, setManualPath] = useState<string>("");
  const [backupName, setBackupName] = useState<string>("");
  const [tableKey, setTableKey] = useState<number>(0);

  const loadBackups = async (_page: number, _rows: number) => {
    try {
      const bk = await service.loadBackups();
      return { totalRecords: bk.length, result: bk };
    } catch {
      setMissingPath(true);
    }
  };

  const createBackup = () => {
    if (!backupName.trim()) return;
    service
      .backup(backupName.trim())
      .then(() => {
        setBackupName("");
        setTableKey((k) => k + 1);
      })
      .catch((err: Error) => alert("Error: " + err.message));
  };

  const restoreBackup = (backup: string, refresh: () => void) => {
    service
      .restore(backup)
      .catch((err: Error) => alert("Error: " + err.message))
      .finally(refresh);
  };

  if (missingPath) {
    return (
      <div className="flex flex-column gap-2 p-3">
        <label>Enter your Steam directory path:</label>
        <div className="flex gap-2">
          <InputText
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            placeholder="/home/user/.steam/steam"
          />
          <Button
            label="Save"
            onClick={() =>
              service.saveSteamPath(manualPath).then(() => setMissingPath(false))
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-3 p-3">
      <div className="flex gap-2">
        <InputText
          value={backupName}
          onChange={(e) => setBackupName(e.target.value)}
          placeholder="Backup name"
          onKeyDown={(e) => e.key === "Enter" && createBackup()}
        />
        <Button
          label="Backup current"
          icon="pi pi-save"
          disabled={!backupName.trim()}
          onClick={createBackup}
        />
      </div>
      <GenericDataTable<Backup>
        key={tableKey}
        loadRecords={loadBackups}
        dataKey="name"
        columns={[
          { field: "name", header: "Backup name", sortable: false, filter: false },
          {
            field: "active",
            header: "Active",
            sortable: false,
            filter: false,
            body: (values: Backup) =>
              values.active ? <Button label="Active" severity="success" /> : <></>,
          },
          {
            header: "Restore",
            sortable: false,
            filter: false,
            customContent: (data: Backup, _options: ColumnBodyOptions, refresh: () => void) => (
              <Button label="Restore" onClick={() => restoreBackup(data.name, refresh)} />
            ),
          },
        ]}
      />
    </div>
  );
}
