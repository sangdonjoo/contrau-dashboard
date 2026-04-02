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
          딥다이브 · 먼쓸리 플랜 · 특수 태스크 — 티켓 번호를 터미널에서 로드하여 대응
        </p>
      </header>
      <OverrideList />
    </div>
  );
}
