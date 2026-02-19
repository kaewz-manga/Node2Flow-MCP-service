import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Connection } from '@node2flow/dashboard-core';
import type { ConnectionUsageStats } from '@/lib/platform-api';

// Merged row: connection info + usage stats
export interface ConnectionRow {
  id: string;
  name: string;
  product_type: string;
  status: string;
  total_requests: number;
  successes: number;
  errors: number;
  last_used: string | null;
  logo?: string;
  plugin_name?: string;
  href?: string;
}

// Merge connections with usage stats
export function mergeConnectionData(
  connections: Connection[],
  usageStats: ConnectionUsageStats[],
  pluginMap: Map<string, { name: string; logo?: string; href?: string }>
): ConnectionRow[] {
  const usageMap = new Map(usageStats.map(u => [u.connection_id, u]));

  return connections.map(c => {
    const usage = usageMap.get(c.id);
    const plugin = pluginMap.get(c.product_type);
    return {
      id: c.id,
      name: c.name,
      product_type: c.product_type,
      status: c.status,
      total_requests: usage?.total_requests || 0,
      successes: usage?.successes || 0,
      errors: usage?.errors || 0,
      last_used: usage?.last_request_at || c.last_used_at || null,
      logo: plugin?.logo,
      plugin_name: plugin?.name || c.product_type,
      href: plugin?.href,
    };
  });
}

function createColumns(navigate: (path: string) => void): ColumnDef<ConnectionRow>[] {
  return [
  {
    accessorKey: 'plugin_name',
    header: 'Service',
    cell: ({ row }) => {
      const href = row.original.href;
      return (
        <div
          className={`flex items-center gap-2 ${href ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
          onClick={href ? () => navigate(href) : undefined}
        >
          {row.original.logo && (
            <img src={row.original.logo} alt="" className="h-4 w-4 shrink-0" />
          )}
          <span className={`text-sm ${href ? 'text-foreground hover:text-primary' : 'text-muted-foreground'}`}>{row.original.plugin_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Connection <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
          <span className="text-sm text-muted-foreground capitalize">{status}</span>
        </div>
      );
    },
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
    accessorKey: 'last_used',
    header: 'Last Used',
    cell: ({ row }) => {
      const date = row.getValue('last_used') as string | null;
      if (!date) return <span className="text-muted-foreground text-sm">Never</span>;
      return <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>;
    },
  },
];
}

interface ConnectionsDataTableProps {
  connections: Connection[];
  usageStats: ConnectionUsageStats[];
  pluginMap: Map<string, { name: string; logo?: string; href?: string }>;
}

export function ConnectionsDataTable({
  connections,
  usageStats,
  pluginMap,
}: ConnectionsDataTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => createColumns(navigate), [navigate]);

  const data = useMemo(
    () => mergeConnectionData(connections, usageStats, pluginMap),
    [connections, usageStats, pluginMap]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
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
                  No connections yet. Add a service to get started.
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
  );
}
