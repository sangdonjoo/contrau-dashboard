"use client";

import KpiCard from "@/components/KpiCard";
import PondMap from "@/components/spirulina/overview/PondMap";
import HarvestChart from "@/components/spirulina/overview/HarvestChart";
import { factories } from "@/data/spirulina-mock";
import { useFactory } from "@/components/spirulina/FactoryContext";

export default function SpirulinaOverviewPage() {
  const { selectedFactoryId } = useFactory();

  const factory = factories.find((f) => f.id === selectedFactoryId) ?? factories[0];
  const allPonds = factory.zones.flatMap((z) => z.ponds);
  const activePonds = allPonds.filter((p) => p.status === "active");

  const avgOd =
    activePonds.length > 0
      ? activePonds.reduce((sum, p) => sum + (p.od ?? 0), 0) / activePonds.length
      : 0;

  // Simulated today harvest from active ponds with high OD
  const todayHarvest = activePonds
    .filter((p) => p.od !== null && p.od >= 1.5)
    .reduce((sum, p) => sum + Math.round((p.od ?? 0) * 60), 0);

  // Simulated avg color index
  const avgColorIndex = 710;

  return (
    <div className="space-y-4">
      {/* KPI Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          title="Active Ponds"
          value={`${activePonds.length}`}
          subtitle={`of ${allPonds.length} total`}
          accent
        />
        <KpiCard
          title="Today Harvest"
          value={`${todayHarvest}`}
          unit="kg"
        />
        <KpiCard
          title="Avg OD"
          value={avgOd.toFixed(2)}
          accent
        />
        <KpiCard
          title="Avg Color Index"
          value={`${avgColorIndex}`}
        />
      </section>

      {/* Pond Map */}
      <PondMap factory={factory} />

      {/* Charts */}
      <HarvestChart />
    </div>
  );
}
