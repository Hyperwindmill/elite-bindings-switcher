import { ColumnBodyOptions } from "primereact/column";
import { BindingsService } from "../services/bindings.service";
import { GenericDataTable } from "./datatable";
import { Button } from "primereact/button";
import { useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
interface BVInput {
  service: BindingsService;
}
export interface Backup {
  name: string;
  hash: string;
  devices?: Array<string>;
  active: boolean;
}
export function BackupView(options: BVInput) {
  const [missingPath, setMissingPath] = useState<boolean>(false);
  const [manualPath, setManualPath] = useState<string>("");
  const loadBackups = async (page: number, rows: number) => {
    try {
      const bk = await options.service.loadBackups();
      return {
        totalRecords: bk.length,
        result: bk,
      };
    } catch (e) {
      setMissingPath(true);
    }
  };
  const restoreBackup = (backup: string, finalStep?: () => void) => {
    options.service
      .restore(backup)
      /* .then(() => {
        alert("Backup " + backup + " restored");
      }) */
      .catch((err) => {
        alert("Error: " + err);
      })
      .finally(finalStep);
  };
  return missingPath ? (
    <div>
      <FileUpload
        accept="webkitdirectory"
        multiple={false}
        chooseLabel="Select your Steam directory"
        mode="basic"
        auto
        customUpload
        uploadHandler={(e) => {
          const path = e.files[0].path;
          options.service.saveSteamPath(path).then(() => {
            setMissingPath(false);
          });
        }}
      ></FileUpload>
      <InputText
        value={manualPath}
        onChange={(e) => {
          setManualPath(e.target.value);
        }}
      ></InputText>
      <Button
        label="Enter manually"
        onClick={() => {
          options.service.saveSteamPath(manualPath).then(() => {
            setMissingPath(false);
          });
        }}
      ></Button>
    </div>
  ) : (
    <GenericDataTable<Backup>
      loadRecords={loadBackups}
      dataKey="name"
      columns={[
        {
          field: "name",
          header: "Backup name",
          sortable: false,
          filter: false,
        },
        {
          field: "active",
          header: "Active",
          sortable: false,
          filter: false,
          body: (values: Backup) => {
            return values.active ? (
              <Button label="Active" severity="success"></Button>
            ) : (
              <></>
            );
          },
        },
        {
          header: "Restore",
          sortable: false,
          filter: false,
          customContent: (data, options, refresh) => {
            return (
              <Button
                label="Restore"
                onClick={() => {
                  restoreBackup(data.name, () => refresh());
                }}
              ></Button>
            );
          },
        },
      ]}
    ></GenericDataTable>
  );
}
