"use client";

import FactorySelector from "@/components/spirulina/FactorySelector";
import SpirulinaNav from "@/components/spirulina/SpirulinaNav";
import { FactoryProvider, useFactory } from "@/components/spirulina/FactoryContext";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { selectedFactoryId, setSelectedFactoryId } = useFactory();
  return (
    <>
      <div className="mb-2">
        <FactorySelector
          selectedId={selectedFactoryId}
          onSelect={setSelectedFactoryId}
        />
      </div>
      <SpirulinaNav />
      <main className="mt-4">{children}</main>
    </>
  );
}

export default function SpirulinaShell({ children }: { children: React.ReactNode }) {
  return (
    <FactoryProvider>
      <ShellInner>{children}</ShellInner>
    </FactoryProvider>
  );
}
