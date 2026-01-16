"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui";
import { DEALER_SORT_OPTIONS } from "@/lib/constants";

interface DealerSortProps {
  currentSort: string;
}

export function DealerSort({ currentSort }: DealerSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <label htmlFor="sort" className="text-sm text-neutral-600 whitespace-nowrap">
        Ordenar por:
      </label>
      <Select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        options={DEALER_SORT_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
        className="w-auto min-w-[160px]"
      />
    </div>
  );
}
