import { useState, useEffect, useMemo } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button,
} from '@node2flow/dashboard-core';
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getClientUsage, type ClientUsageStats } from '@/lib/platform-api';

const columns: ColumnDef<ClientUsageStats>[] = [
  {
    accessorKey: 'client_name',
    header: 'Client',
    cell: ({ row }) => <span className="font-medium">{row.getValue('client_name')}</span>,
  },
  {
    accessorKey: 'total_requests',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Requests <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{(row.getValue('total_requests') as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'successes',
    header: 'Success',
    cell: ({ row }) => (
      <span className="tabular-nums text-green-500">{(row.getValue('successes') as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'errors',
    header: 'Errors',
    cell: ({ row }) => {
      const errors = row.getValue('errors') as number;
      return (
        <span className={`tabular-nums ${errors > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {errors.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: 'connections_used',
    header: 'Connections',
    cell: ({ row }) => (
      <span className="tabular-nums">{(row.getValue('connections_used') as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'last_seen_at',
    header: 'Last Seen',
    cell: ({ row }) => {
      const date = row.getValue('last_seen_at') as string | null;
      if (!date) return <span className="text-muted-foreground text-sm">Never</span>;
      return <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>;
    },
  },
];

const periods = [7, 30, 90, 180] as const;
const periodLabels: Record<number, string> = { 7: '7 days', 30: '30 days', 90: '90 days', 180: '180 days' };

export default function Clients() {
  const [clients, setClients] = useState<ClientUsageStats[]>([]);
  const [period, setPeriod] = useState<7 | 30 | 90 | 180>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setLoading(true);
    setError('');
    const res = await getClientUsage(period);
    if (res.data) setClients(res.data.clients);
    else setError(res.error?.message || 'Failed to load');
    setLoading(false);
  }

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center gap-2 px-4 lg:px-6">
          {periods.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="px-4 lg:px-6 text-sm text-red-500">{error}</div>
        ) : (
          <div className="space-y-4 px-4 lg:px-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        No client activity yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
