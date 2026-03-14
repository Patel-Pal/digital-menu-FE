import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchConfig, FilterConfig } from "./types";

interface DataTableToolbarProps {
  search?: SearchConfig;
  filters?: FilterConfig[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilters: Record<string, string>;
  onFilterChange: (filterId: string, value: string) => void;
  onClearFilters: () => void;
}

export function DataTableToolbar({
  search,
  filters,
  searchValue,
  onSearchChange,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: DataTableToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, search?.debounceMs ?? 300);
  const isInitialMount = useRef(true);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  // Sync debounced value to parent — skip initial mount to avoid triggering fetch on render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSearchChangeRef.current(debouncedSearch);
  }, [debouncedSearch]);

  // Sync external searchValue changes (e.g. clear filters resets search)
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== ""
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-4">
      {search && (
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={search.placeholder ?? "Search..."}
          icon={<Search className="h-4 w-4" />}
          aria-label="Search table"
          className="md:max-w-sm"
        />
      )}

      {filters?.map((filter) => (
        <Select
          key={filter.id}
          value={activeFilters[filter.id] ?? ""}
          onValueChange={(value) =>
            onFilterChange(filter.id, value === "__all__" ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
