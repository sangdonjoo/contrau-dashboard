"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/spirulina", label: "~Overview" },
  { href: "/spirulina/data-status", label: "~Data Status" },
  { href: "/spirulina/operations", label: "~Operations" },
  { href: "/spirulina/inventory", label: "~Inventory" },
  { href: "/spirulina/output", label: "~Output" },
  { href: "/spirulina/experiment", label: "~Experiment" },
];

export default function SpirulinaNav() {
  const pathname = usePathname();

  return (
    <nav className="flex overflow-x-auto gap-1 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/spirulina"
            ? pathname === "/spirulina"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
