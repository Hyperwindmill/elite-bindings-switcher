import { ColumnBodyOptions } from "primereact/column";
import { BindingsService } from "../services/bindings.service";
import { GenericDataTable } from "./datatable";
import { Button } from "primereact/button";
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
  const loadBackups = async (page: number, rows: number) => {
    const bk = await options.service.loadBackups();
    return {
      totalRecords: bk.length,
      result: bk,
    };
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
  return (
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
