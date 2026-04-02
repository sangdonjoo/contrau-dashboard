"use client";

import { useState } from "react";
import {
  deepDives,
  monthlyPlans,
  specialTasks,
  ddStatusMap,
  mpStatusMap,
  tkStatusMap,
} from "@/data/override-mock";

type Tab = "deep-dive" | "monthly-plan" | "special-task";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-1.5 py-0.5 text-[10px] rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
      title={`Copy: ${text}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function LevelBadge({ level }: { level: number }) {
  const colors: Record<number, string> = {
    1: "bg-red-50 text-red-700 border-red-200",
    2: "bg-orange-50 text-orange-700 border-orange-200",
    3: "bg-blue-50 text-blue-700 border-blue-200",
    4: "bg-gray-50 text-gray-600 border-gray-200",
    5: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-[10px] px-1 py-0.5 rounded border ${colors[level] || colors[5]}`}>
      L{level}
    </span>
  );
}

function InfoButton({ description }: { description: string }) {
  return (
    <span className="relative group">
      <button className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 text-[10px] leading-none hover:bg-gray-200 hover:text-gray-600 transition-colors">
        ?
      </button>
      <span className="absolute left-6 top-0 z-50 hidden group-hover:block w-64 p-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg">
        {description}
      </span>
    </span>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500 w-8 text-right">{progress}%</span>
    </div>
  );
}

export default function OverrideList() {
  const [tab, setTab] = useState<Tab>("deep-dive");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "deep-dive", label: "Deep Dive", count: deepDives.length },
    { key: "monthly-plan", label: "Monthly Plan", count: monthlyPlans.length },
    { key: "special-task", label: "Special Task", count: specialTasks.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-green-500 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Deep Dive list */}
      {tab === "deep-dive" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            People L1-3이 자기 레벨 이하에게 요청하는 구조화된 심층 인터뷰. 텔레그램봇 인증 후 수행.
          </p>
          {deepDives.map((dd) => {
            const status = ddStatusMap[dd.status];
            return (
              <div key={dd.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  {/* Left: ticket info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{dd.id}</code>
                      <CopyButton text={dd.id} />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
                      <InfoButton description={dd.description} />
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-snug mb-1 truncate">
                      {dd.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <LevelBadge level={dd.issuedByLevel} />
                        {dd.issuedBy}
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className="flex items-center gap-1">
                        <LevelBadge level={dd.intervieweeLevel} />
                        {dd.interviewee}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{dd.domain}</span>
                      <span className="text-gray-300">|</span>
                      <span>{dd.createdAt}</span>
                    </div>
                  </div>
                  {/* Right: file copy */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <CopyButton text={dd.filePath} />
                    <span className="text-[9px] text-gray-300">file path</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly Plan list */}
      {tab === "monthly-plan" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            PL이 AI와 v1→v2 완성 → 대표 피드백 → 최종 확정. 확정 후 불변.
          </p>
          {monthlyPlans.map((mp) => {
            const status = mpStatusMap[mp.status];
            return (
              <div key={mp.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{mp.id}</code>
                      <CopyButton text={mp.id} />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">
                        {mp.version}
                      </span>
                      <InfoButton description={mp.description} />
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-snug mb-1 truncate">
                      {mp.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <LevelBadge level={mp.plLevel} />
                        {mp.plName}
                      </span>
                      <span className="text-gray-300">↔</span>
                      <span className="flex items-center gap-1">
                        <LevelBadge level={1} />
                        CEO
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{mp.projectLabel}</span>
                      <span className="text-gray-300">|</span>
                      <span>{mp.period}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <CopyButton text={mp.filePath} />
                    <span className="text-[9px] text-gray-300">file path</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Special Task list */}
      {tab === "special-task" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            People L1-3이 자기 레벨 이하에게 요청한 중요 태스크. 텔레그램봇 또는 터미널에서 수행.
          </p>
          {specialTasks.map((tk) => {
            const status = tkStatusMap[tk.status];
            return (
              <div key={tk.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{tk.id}</code>
                      <CopyButton text={tk.id} />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
                      <InfoButton description={tk.description} />
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-snug mb-1 truncate">
                      {tk.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <LevelBadge level={tk.issuedByLevel} />
                        {tk.issuedBy}
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className="flex items-center gap-1">
                        <LevelBadge level={tk.assigneeLevel} />
                        {tk.assignee}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{tk.createdAt}</span>
                    </div>
                    {/* Progress bar for in_progress tasks */}
                    {tk.status === "in_progress" && (
                      <div className="mt-2">
                        <ProgressBar progress={tk.progress} />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <CopyButton text={tk.filePath} />
                    <span className="text-[9px] text-gray-300">file path</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
