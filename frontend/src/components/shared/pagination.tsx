"use client";

import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20; // mirrors DRF DEFAULT_PAGINATION_CLASS page_size

/** Prev/next pager driven by DRF's `count` + current page. */
export function Pagination({
  page,
  count,
  onPageChange,
  pageSize = PAGE_SIZE,
}: {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {count} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
