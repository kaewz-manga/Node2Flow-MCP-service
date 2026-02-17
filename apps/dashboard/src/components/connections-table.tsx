import { useState, useMemo } from 'react';
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
  Badge, Button,
} from '@node2flow/dashboard-core';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
}

// Merge connections with usage stats
export function mergeConnectionData(
  connections: Connection[],
  usageStats: ConnectionUsageStats[],
  pluginMap: Map<string, { name: string; logo?: string }>
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
    };
  });
}

const columns: ColumnDef<ConnectionRow>[] = [
  {
    accessorKey: 'plugin_name',
    header: 'Service',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.logo && (
          <img src={row.original.logo} alt="" className="h-4 w-4 shrink-0" />
        )}
        <span className="text-muted-foreground text-sm">{row.original.plugin_name}</span>
      </div>
    ),
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
        <Badge variant={status === 'active' ? 'default' : 'secondary'} className="text-xs">
          {status}
        </Badge>
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

interface ConnectionsDataTableProps {
  connections: Connection[];
  usageStats: ConnectionUsageStats[];
  pluginMap: Map<string, { name: string; logo?: string }>;
  period: 7 | 30 | 90;
  onPeriodChange: (days: 7 | 30 | 90) => void;
}

export function ConnectionsDataTable({
  connections,
  usageStats,
  pluginMap,
  period,
  onPeriodChange,
}: ConnectionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo(
    () => mergeConnectionData(connections, usageStats, pluginMap),
    [connections, usageStats, pluginMap]
  );

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Connection Usage</h2>
        <ToggleGroup
          type="single"
          value={period.toString()}
          onValueChange={(v) => v && onPeriodChange(parseInt(v) as 7 | 30 | 90)}
          variant="outline"
          className="h-8"
        >
          <ToggleGroupItem value="7" className="h-8 px-2.5 text-xs">7 days</ToggleGroupItem>
          <ToggleGroupItem value="30" className="h-8 px-2.5 text-xs">30 days</ToggleGroupItem>
          <ToggleGroupItem value="90" className="h-8 px-2.5 text-xs">90 days</ToggleGroupItem>
        </ToggleGroup>
      </div>

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
