import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: "Inicio", href: "/" }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center flex-wrap gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-neutral-400 flex-shrink-0" />
              )}
              {isLast ? (
                <span className="text-neutral-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-neutral-500 hover:text-andino-600 transition-colors flex items-center gap-1"
                >
                  {isHome && <Home className="h-4 w-4" />}
                  {!isHome && item.label}
                </Link>
              ) : (
                <span className="text-neutral-500 flex items-center gap-1">
                  {isHome && <Home className="h-4 w-4" />}
                  {!isHome && item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
