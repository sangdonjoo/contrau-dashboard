import type { Metadata } from "next";
import SpirulinaShell from "@/components/spirulina/SpirulinaShell";

export const metadata: Metadata = {
  title: "Contrau Spirulina Production",
  description: "Spirulina production dashboard — Tra Vinh factory",
};

export default function SpirulinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">
          Spirulina Production
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Factory monitoring dashboard
        </p>
      </header>
      <SpirulinaShell>{children}</SpirulinaShell>
    </div>
  );
}
