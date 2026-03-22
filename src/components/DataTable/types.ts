import { ReactNode } from "react";

export interface ColumnDef<T> {
  /** Unique key for the column, used as React key */
  id: string;
  /** Column header label */
  header: string;
  /** Function to extract the cell value from a row */
  accessorFn: (row: T) => unknown;
  /** Optional custom render function for the cell */
  cell?: (row: T) => ReactNode;
  /** Whether this column is searchable in client-side mode */
  searchable?: boolean;
  /** Optional className for the header <th> */
  headerClassName?: string;
  /** Optional className for each <td> in this column */
  cellClassName?: string;
}

export interface FilterConfig {
  /** Unique key matching a data field */
  id: string;
  /** Display label for the filter */
  label: string;
  /** Filter options */
  options: { label: string; value: string }[];
  /** Accessor function to get the filterable value from a row */
  accessorFn: (row: any) => string;
}

export interface SearchConfig {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export interface EmptyStateConfig {
  /** Icon to display */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
}

export interface PaginationState {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items (required for server mode) */
  totalItems: number;
}

/** Server-side mode props */
export interface ServerModeProps<T> {
  mode: "server";
  data: T[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
}

/** Client-side mode props */
export interface ClientModeProps<T> {
  mode: "client";
  data: T[];
  pageSize?: number; // default 10
  onSearch?: never;
  onPageChange?: never;
  onFilterChange?: never;
}

/** Discriminated union of common props with either server or client mode */
export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  search?: SearchConfig;
  filters?: FilterConfig[];
  loading?: boolean;
  emptyState?: EmptyStateConfig;
  /** Optional className for the wrapping Card */
  className?: string;
  /** ID of the currently expanded row (matched against row index or a key) */
  expandedRowId?: string | null;
  /** Function to get a unique key from a row for expansion matching */
  rowKey?: (row: T) => string;
  /** Render function for the expanded row content */
  renderExpandedRow?: (row: T) => ReactNode;
} & (ServerModeProps<T> | ClientModeProps<T>);
