import type { Metadata } from "next";
import OverrideList from "@/components/override/OverrideList";

export const metadata: Metadata = {
  title: "Contrau — Context Override",
  description: "Deep Dive, Monthly Plan, Special Task management",
};

export default function OverridePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Context Override</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Deep Dive · Monthly Plan · Special Task — click Copy and paste the prompt in your terminal to proceed
        </p>
      </header>
      <OverrideList />
    </div>
  );
}
