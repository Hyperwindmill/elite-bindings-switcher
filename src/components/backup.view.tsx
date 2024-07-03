import { ColumnBodyOptions } from "primereact/column";
import { BindingsService } from "../services/bindings.service";
import { GenericDataTable } from "./datatable";
import { Button } from "primereact/button";
interface BVInput {
  service: BindingsService;
}
interface Backup {
  name: string;
}
export function BackupView(options: BVInput) {
  const loadBackups = async (page: number, rows: number) => {
    const bk = await options.service.loadBackups();
    return {
      totalRecords: bk.length,
      result: bk.map((el) => {
        return {
          name: el,
        };
      }),
    };
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
  return (
    <GenericDataTable<Backup>
      loadRecords={loadBackups}
      dataKey="name"
      columns={[
        {
          field: "name",
          header: "Backup name",
          sortable: true,
          filter: true,
          filterHeader: "Search",
        },
        {
          header: "Restore",
          sortable: false,
          filter: false,
          body: (data: any, options: ColumnBodyOptions) => {
            return (
              <Button
                label="Restore"
                onClick={() => {
                  restoreBackup(data.name);
                }}
              ></Button>
            );
          },
        },
      ]}
    ></GenericDataTable>
  );
}
