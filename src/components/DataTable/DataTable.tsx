import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { applyClientFilters } from "./utils";
import type { DataTableProps } from "./types";

const DEFAULT_PAGE_SIZE = 10;
const SKELETON_ROW_COUNT = 5;

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    data: rawData,
    search,
    filters,
    loading = false,
    emptyState,
    className,
  } = props;

  const data = rawData ?? [];

  // Client-mode internal state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);

  const isServer = props.mode === "server";
  const pageSize = isServer ? props.pagination.pageSize : (props.pageSize ?? DEFAULT_PAGE_SIZE);

  // Extract server callbacks safely (avoids conditional access on discriminated union)
  const serverOnSearch = props.mode === "server" ? props.onSearch : undefined;
  const serverOnFilterChange = props.mode === "server" ? props.onFilterChange : undefined;
  const serverOnPageChange = props.mode === "server" ? props.onPageChange : undefined;

  // --- Search handler ---
  const handleSearchChange = useCallback(
    (value: string) => {
      if (isServer) {
        serverOnSearch?.(value);
      } else {
        setSearchQuery(value);
        setCurrentPage(1);
      }
    },
    [isServer, serverOnSearch]
  );

  // --- Filter handler ---
  const handleFilterChange = useCallback(
    (filterId: string, value: string) => {
      if (isServer) {
        const updated = { ...activeFilters, [filterId]: value };
        setActiveFilters(updated);
        serverOnFilterChange?.(updated);
      } else {
        setActiveFilters((prev) => ({ ...prev, [filterId]: value }));
        setCurrentPage(1);
      }
    },
    [isServer, activeFilters, serverOnFilterChange]
  );

  // --- Clear filters ---
  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
    if (isServer) {
      serverOnFilterChange?.({});
    } else {
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [isServer, serverOnFilterChange]);

  // --- Page change handler ---
  const handlePageChange = useCallback(
    (page: number) => {
      if (isServer) {
        serverOnPageChange?.(page);
      } else {
        setCurrentPage(page);
      }
    },
    [isServer, serverOnPageChange]
  );

  // --- Filtered + paginated data ---
  const filteredData = useMemo(() => {
    if (isServer) return data;
    return applyClientFilters(data, searchQuery, activeFilters, columns, filters ?? []);
  }, [isServer, data, searchQuery, activeFilters, columns, filters]);

  const totalItems = isServer ? props.pagination.totalItems : filteredData.length;
  const serverCurrentPage = isServer ? props.pagination.currentPage : currentPage;

  const paginatedData = useMemo(() => {
    if (isServer) return data;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [isServer, data, filteredData, currentPage, pageSize]);

  // --- Aria-live announcement ---
  const rangeStart = totalItems > 0 ? (serverCurrentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(serverCurrentPage * pageSize, totalItems);

  const showEmptyState = !loading && paginatedData.length === 0;

  return (
    <Card className={cn(className)}>
      <DataTableToolbar
        search={search}
        filters={filters}
        searchValue={isServer ? "" : searchQuery}
        onSearchChange={handleSearchChange}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`}>
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.cellClassName}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showEmptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    {emptyState?.icon && (
                      <div className="mb-3 text-muted-foreground">
                        {emptyState.icon}
                      </div>
                    )}
                    <p className="text-lg font-medium">
                      {emptyState?.title ?? "No data"}
                    </p>
                    {emptyState?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {emptyState.description}
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.cellClassName}>
                      {col.cell
                        ? col.cell(row)
                        : String(col.accessorFn(row))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={serverCurrentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />

      {/* Screen reader announcement for result count changes */}
      <div aria-live="polite" className="sr-only">
        {totalItems > 0
          ? `Showing ${rangeStart} to ${rangeEnd} of ${totalItems} results`
          : "No results found"}
      </div>
    </Card>
  );
}
