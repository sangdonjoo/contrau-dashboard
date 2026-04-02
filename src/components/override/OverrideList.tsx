"use client";

import { useState, useEffect } from "react";
import {
  deepDives as mockDeepDives,
  monthlyPlans,
  specialTasks,
  ddStatusMap,
  mpStatusMap,
  tkStatusMap,
  type DeepDive,
  type MonthlyPlan,
} from "@/data/override-mock";

type Tab = "deep-dive" | "monthly-plan" | "special-task";

function CopyButton({ id, filePath }: { id: string; filePath: string }) {
  const [copied, setCopied] = useState(false);
  const combined = `${id} | ${filePath}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(combined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-1.5 py-0.5 text-[10px] rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
      title={`Copy: ${combined}`}
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

const MP_STEPS: { key: MonthlyPlan["status"]; label: string }[] = [
  { key: "ai_draft", label: "AI Draft" },
  { key: "pl_review", label: "PL Review" },
  { key: "pl_confirmed", label: "PL Confirm" },
  { key: "ceo_review", label: "CEO Review" },
  { key: "ceo_feedback", label: "CEO Feedback" },
  { key: "final", label: "Final" },
  { key: "confirmed", label: "Confirmed" },
];

function PlanStepBar({ currentStatus }: { currentStatus: MonthlyPlan["status"] }) {
  const currentIdx = MP_STEPS.findIndex((s) => s.key === currentStatus);
  return (
    <div className="flex items-center flex-wrap gap-y-1 mt-2">
      {MP_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <span key={step.key} className="flex items-center">
            <span
              className={[
                "text-[9px] font-medium px-1.5 py-0.5 rounded",
                isActive
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : isDone
                  ? "bg-gray-100 text-gray-400"
                  : "text-gray-300",
              ].join(" ")}
            >
              {isDone && "✓ "}
              {step.label}
            </span>
            {i < MP_STEPS.length - 1 && (
              <span className={`text-[9px] px-0.5 ${i < currentIdx ? "text-gray-300" : "text-gray-200"}`}>
                →
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function OverrideList() {
  const [tab, setTab] = useState<Tab>("deep-dive");
  const [deepDives, setDeepDives] = useState<DeepDive[]>(mockDeepDives);

  useEffect(() => {
    fetch('/api/deep-dives')
      .then(res => res.json())
      .then(data => {
        if (data.available && data.data.length > 0) {
          setDeepDives(data.data);
        }
      })
      .catch(() => { /* keep mock fallback */ });
  }, []);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "deep-dive", label: "Deep Dive", count: deepDives.length },
    { key: "monthly-plan", label: "~Monthly Plan", count: monthlyPlans.length },
    { key: "special-task", label: "~Special Task", count: specialTasks.length },
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
            Structured deep-dive interviews requested by People L1-3. Requires authentication via Telegram bot.
          </p>
          {deepDives.map((dd) => {
            const status = ddStatusMap[dd.status];
            return (
              <div key={dd.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{dd.id}</code>
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
                  <CopyButton id={dd.id} filePath={dd.filePath} />
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
            PL finalizes v1→v2 with AI → CEO feedback → confirmed. Immutable after confirmation.
          </p>
          {monthlyPlans.map((mp) => {
            const status = mpStatusMap[mp.status];
            return (
              <div key={mp.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{mp.id}</code>
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
                    <PlanStepBar currentStatus={mp.status} />
                  </div>
                  <CopyButton id={mp.id} filePath={mp.filePath} />
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
            Important tasks assigned by People L1-3. Executed via Telegram bot or terminal.
          </p>
          {specialTasks.map((tk) => {
            const status = tkStatusMap[tk.status];
            return (
              <div key={tk.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{tk.id}</code>
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
                    {tk.status === "in_progress" && (
                      <div className="mt-2">
                        <ProgressBar progress={tk.progress} />
                      </div>
                    )}
                  </div>
                  <CopyButton id={tk.id} filePath={tk.filePath} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
