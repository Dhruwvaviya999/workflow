"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

/**
 * Debounced search input. Calls `onSearch` ~300ms after typing stops, so
 * pages don't refetch on every keystroke.
 */
export function SearchBar({
  placeholder = "Search…",
  onSearch,
  initialValue = "",
}: {
  placeholder?: string;
  onSearch: (value: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const id = setTimeout(() => onSearch(value.trim()), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
