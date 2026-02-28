import { Column, ColumnBodyOptions, ColumnProps } from "primereact/column";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSortEvent,
  SortOrder,
} from "primereact/datatable";
import { ReactNode, useEffect, useState } from "react";

interface LazyTableState {
  first: number;
  rows: number;
  page?: number;
  sortField?: string;
  sortOrder?: SortOrder;
}

interface LoaderFunction<T extends Record<string, any>> {
  (page: number, rows: number): Promise<{
    totalRecords: number;
    result: T[];
  }>;
}

export interface CustomColumn extends ColumnProps {
  customContent?: (
    data: any,
    options: ColumnBodyOptions,
    refresh: () => void
  ) => ReactNode;
}

interface DataTableInput<T extends Record<string, any>> {
  loadRecords: LoaderFunction<T>;
  dataKey: string;
  columns: CustomColumn[];
}

export function GenericDataTable<T extends Record<string, any>>(
  params: DataTableInput<T>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [records, setRecords] = useState<T[]>([]);
  const [lazyState, setLazyState] = useState<LazyTableState>({
    first: 0,
    rows: 10,
    page: 1,
  });

  useEffect(() => {
    loadLazyData();
  }, [lazyState]);

  const loadLazyData = () => {
    setLoading(true);
    params.loadRecords(lazyState.page, lazyState.rows).then((result) => {
      setTotalRecords(result.totalRecords);
      setRecords(result.result);
      setLoading(false);
    });
  };

  const onPage = (event: DataTablePageEvent) => {
    setLazyState({ ...lazyState, ...event });
  };

  const onSort = (event: DataTableSortEvent) => {
    setLazyState({ ...lazyState, ...event });
  };

  return (
    <div className="card">
      <DataTable<Array<T>>
        value={records}
        lazy
        dataKey={params.dataKey}
        paginator
        first={lazyState.first}
        rows={10}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyState.sortField}
        sortOrder={lazyState.sortOrder}
        loading={loading}
      >
        {params.columns.map((column, index) => {
          const c = { ...column };
          if (c.customContent) {
            c.body = (data: any, options: ColumnBodyOptions) =>
              c.customContent(data, options, loadLazyData);
          }
          return <Column key={index} {...c} />;
        })}
      </DataTable>
    </div>
  );
}
