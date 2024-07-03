import { Column, ColumnProps } from "primereact/column";
import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMeta,
  DataTablePageEvent,
  DataTableSelectAllChangeEvent,
  DataTableSortEvent,
  SortOrder,
} from "primereact/datatable";
import { useEffect, useState } from "react";
interface LazyTableState {
  first: number;
  rows: number;
  page?: number;
  sortField?: string;
  sortOrder?: SortOrder;
  filters?: DataTableFilterMeta;
}
interface LoaderFunction<T extends Record<string, any>> {
  (page: number, rows: number): Promise<{
    totalRecords: number;
    result: T[];
  }>;
}
interface DataTableInput<T extends Record<string, any>> {
  loadRecords: LoaderFunction<T>;
  dataKey: string;
  columns: ColumnProps[];
}
export function GenericDataTable<T extends Record<string, any>>(
  params: DataTableInput<T>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [records, setRecords] = useState<T[]>(null);
  const [selectedRecords, setSelectedRecords] = useState<T[] | null>(null);
  const [lazyState, setlazyState] = useState<LazyTableState>({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    filters: null,
  });
  useEffect(() => {
    loadLazyData();
  }, [lazyState]);

  const loadLazyData = () => {
    setLoading(true);
    params.loadRecords(lazyState.page, lazyState.rows).then((result) => {
      console.log(result);
      setTotalRecords(result.totalRecords);
      setRecords(result.result);
      setLoading(false);
    });
  };
  const onPage = (event: DataTablePageEvent) => {
    setlazyState({ ...lazyState, ...event });
  };

  const onSort = (event: DataTableSortEvent) => {
    setlazyState({ ...lazyState, ...event });
  };

  const onFilter = (event: DataTableFilterEvent) => {
    event["first"] = 0;
    setlazyState({ ...lazyState, ...event });
  };

  const onSelectionChange = (event: any) => {
    const value = event.value;
    setSelectedRecords(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event: DataTableSelectAllChangeEvent) => {
    const selectAll = event.checked;

    if (selectAll) {
      params.loadRecords(0, 0).then((data) => {
        setSelectAll(true);
        setSelectedRecords(data.result);
      });
    } else {
      setSelectAll(false);
      setSelectedRecords([]);
    }
  };

  return (
    <div className="card">
      <DataTable<Array<T>>
        value={records}
        lazy
        filterDisplay="row"
        dataKey={params.dataKey}
        paginator
        selectionMode="multiple"
        first={lazyState.first}
        rows={10}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyState.sortField}
        sortOrder={lazyState.sortOrder}
        onFilter={onFilter}
        filters={lazyState.filters}
        loading={loading}
        selection={selectedRecords}
        onSelectionChange={onSelectionChange}
        selectAll={selectAll}
        onSelectAllChange={onSelectAllChange}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        {params.columns.map((column) => (
          <Column {...column} />
        ))}
      </DataTable>
    </div>
  );
}
