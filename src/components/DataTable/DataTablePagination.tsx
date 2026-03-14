import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  currentPage: number; // 1-indexed
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

/**
 * Generates the array of page numbers (and ellipsis markers) to display.
 * - If totalPages <= 7, show all pages.
 * - Otherwise, always show first, last, current, and 1 page on each side of current, with "..." for gaps.
 */
function getVisiblePages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);
  if (currentPage - 1 >= 1) pages.add(currentPage - 1);
  if (currentPage + 1 <= totalPages) pages.add(currentPage + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(sorted[i]);
  }

  return result;
}

export function DataTablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Hide pagination entirely when all items fit on one page (Req 2.6)
  if (totalItems <= pageSize) {
    return null;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Table pagination"
      className="flex flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between"
    >
      {/* Range text */}
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalItems}
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </Button>

        {/* Page number buttons — hidden on mobile, visible on sm+ */}
        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        {/* Mobile: current page indicator */}
        <span className="px-2 text-sm text-muted-foreground sm:hidden">
          {currentPage} / {totalPages}
        </span>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
