import type { Metadata } from "next";
import PipelineStatus from "@/components/company/PipelineStatus";
import SourceVolumeChart from "@/components/company/SourceVolumeChart";
import CompanyVolumeChart from "@/components/company/CompanyVolumeChart";

export const metadata: Metadata = {
  title: "Contrau — Company Overview",
  description: "SSOT pipeline status and message collection dashboard",
};

export default function CompanyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <header className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Company Overview</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          SSOT pipeline status · message collection trends
        </p>
      </header>
      <PipelineStatus />
      <SourceVolumeChart />
      <CompanyVolumeChart />
    </div>
  );
}
