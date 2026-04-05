"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/company", label: "Company" },
  { href: "/people", label: "People" },
  { href: "/accounting", label: "~Accounting" },
  { href: "/override", label: "Context" },
  { href: "divider", label: "" },
  { href: "/shrimp", label: "~Shrimp" },
  { href: "/spirulina", label: "~Algae" },
];

export default function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-12 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link href="/company" className="flex items-center gap-1.5 mr-4 shrink-0">
          <img src="/logo.png" alt="Contrau" className="h-6 w-auto" />
          <span className="text-sm font-bold text-gray-900">Contrau</span>
        </Link>
        {navItems.map((item) => {
          if (item.href.startsWith("divider")) {
            return (
              <span key={item.href} className="mx-2 text-gray-300 select-none">|</span>
            );
          }
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
