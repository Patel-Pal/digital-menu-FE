import type { ColumnDef, FilterConfig } from "./types";

/**
 * Applies client-side search and column filters to a dataset.
 * Search and filters use AND logic (intersection) — a row must pass both to be included.
 */
export function applyClientFilters<T>(
  data: T[],
  searchQuery: string,
  activeFilters: Record<string, string>,
  columns: ColumnDef<T>[],
  filterConfigs: FilterConfig[]
): T[] {
  let filtered = data;

  // Search: case-insensitive substring match on searchable columns
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    const searchableColumns = columns.filter((c) => c.searchable);
    filtered = filtered.filter((row) =>
      searchableColumns.some((col) =>
        String(col.accessorFn(row)).toLowerCase().includes(query)
      )
    );
  }

  // Column filters: exact match via FilterConfig.accessorFn
  for (const [filterId, filterValue] of Object.entries(activeFilters)) {
    if (!filterValue) continue;
    const config = filterConfigs.find((f) => f.id === filterId);
    if (!config) continue;
    filtered = filtered.filter((row) => config.accessorFn(row) === filterValue);
  }

  return filtered;
}
