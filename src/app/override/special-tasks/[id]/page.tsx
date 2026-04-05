"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { STStatus } from "@/app/api/special-tasks/route";
import type { TaskStep } from "@/app/api/special-tasks/[id]/route";

interface SpecialTaskDetail {
  id: string;
  title: string;
  description: string;
  reason: string;
  criteria: string;
  assignedBy: string;
  assignedByLevel: number;
  assignee: string;
  assigneeLevel: number;
  status: STStatus;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  steps: TaskStep[];
  stepsDone: number;
  stepsTotal: number;
  currentStepIndex: number;
}

const LEVEL_MAP: [string, number][] = [
  ['sangdon', 1],
  ['jihyun', 2], ['yoo jihyun', 2],
  ['nhi', 2], ['ly hoang man nhi', 2],
  ['vicky', 2], ['nguyen thi tuong vi', 2],
  ['charlie', 3], ['nguyen van cu', 3],
  ['youngin', 3], ['seo youngin', 3],
  ['quynh', 3], ['to thi ngoc quynh', 3],
];

function localPersonLevel(name: string): number {
  const lower = name.toLowerCase();
  let best = 4;
  for (const [key, lvl] of LEVEL_MAP) {
    if (lower.includes(key)) best = Math.min(best, lvl);
  }
  return best;
}

const mdComponents = {
  h1: ({children}: {children?: React.ReactNode}) => <h1 className="text-xl font-bold text-gray-900 mt-8 mb-3 first:mt-0">{children}</h1>,
  h2: ({children}: {children?: React.ReactNode}) => <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-8 mb-3 first:mt-0 pb-1.5 border-b-2 border-gray-100">{children}</h2>,
  h3: ({children}: {children?: React.ReactNode}) => <h3 className="text-base font-semibold text-gray-900 mt-8 mb-3 pl-3 border-l-[3px] border-green-400 first:mt-0">{children}</h3>,
  p: ({children}: {children?: React.ReactNode}) => <p className="text-[14px] text-gray-700 leading-[1.8] mb-4 last:mb-0">{children}</p>,
  ul: ({children}: {children?: React.ReactNode}) => <ul className="list-disc list-outside ml-4 space-y-1.5 mb-4 last:mb-0">{children}</ul>,
  ol: ({children}: {children?: React.ReactNode}) => <ol className="list-decimal list-outside ml-4 space-y-1.5 mb-4 last:mb-0">{children}</ol>,
  li: ({children}: {children?: React.ReactNode}) => <li className="text-[14px] text-gray-700 leading-[1.8]">{children}</li>,
  strong: ({children}: {children?: React.ReactNode}) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({children}: {children?: React.ReactNode}) => <em className="italic text-gray-500">{children}</em>,
  hr: () => <hr className="border-gray-100 my-6" />,
  blockquote: ({children}: {children?: React.ReactNode}) => <blockquote className="border-l-4 border-green-200 pl-4 text-[14px] text-gray-500 italic my-4 bg-gray-50 py-2 rounded-r">{children}</blockquote>,
};

const statusMap: Record<STStatus, { label: string; color: string }> = {
  prepared:    { label: "Prepared",    color: "bg-blue-50 text-blue-600" },
  in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-700" },
  completed:   { label: "Completed",   color: "bg-green-50 text-green-700" },
};

const stepStatusMap: Record<TaskStep['stepStatus'], { label: string; color: string }> = {
  prepared:    { label: "Prepared",    color: "bg-blue-50 text-blue-500" },
  in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-700" },
  completed:   { label: "Completed",   color: "bg-green-50 text-green-700" },
};

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

function CopyPromptButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const prompt = `contrau-dashboard/data/special-tasks/${id}.md 를 읽고 진행 단계+진행자에 맞춰 진행해줘.`;
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="px-2 py-1 text-[11px] rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
    >
      {copied ? "Copied!" : "Copy Prompt"}
    </button>
  );
}

/** Parse the first segment before " — " as the step title, rest is detail. */
function parseStepDescription(description: string): { title: string; detail: string } {
  const sep = description.indexOf(' — ');
  if (sep !== -1) {
    return { title: description.slice(0, sep).trim(), detail: description.slice(sep + 3).trim() };
  }
  return { title: description, detail: '' };
}

/** Step node icon based on status */
function StepIcon({ status, order }: { status: TaskStep['stepStatus']; order: number }) {
  if (status === 'completed') {
    return (
      <span className="w-6 h-6 rounded-full bg-green-400 border-2 border-green-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
        ✓
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
        {order}
      </span>
    );
  }
  return (
    <span className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-[9px] font-medium text-gray-400 shrink-0">
      {order}
    </span>
  );
}

/** Single relay step row */
function RelayStep({
  step,
  isLast,
  assignee,
  assigneeLevel,
}: {
  step: TaskStep;
  isLast: boolean;
  assignee: string;
  assigneeLevel: number;
}) {
  const { title, detail } = parseStepDescription(step.description);
  const ss = stepStatusMap[step.stepStatus];
  const isActive = step.stepStatus === 'in_progress';
  const isDone = step.stepStatus === 'completed';

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <StepIcon status={step.stepStatus} order={step.order} />
        {!isLast && (
          <div className={`w-px flex-1 mt-1 ${isDone ? 'bg-green-200' : 'bg-gray-100'}`} style={{ minHeight: '28px' }} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-5 min-w-0 ${isActive ? 'rounded-lg border border-yellow-200 bg-yellow-50/40 px-3 pt-2.5 pb-3 -mt-0.5' : ''}`}>
        {/* Top row: step title + status badge */}
        <div className="flex items-start gap-2 flex-wrap mb-1">
          <span className={`text-[13px] font-semibold leading-snug ${isDone ? 'text-gray-400' : isActive ? 'text-gray-800' : 'text-gray-600'}`}>
            {title}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${ss.color} shrink-0`}>
            {ss.label}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-1 mb-1.5">
          <LevelBadge level={assigneeLevel} />
          <span className="text-[11px] text-gray-500">{assignee}</span>
        </div>

        {/* Detail text */}
        {detail && (
          <p className={`text-[12px] leading-[1.7] ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
            {detail}
          </p>
        )}

        {/* In-progress bar */}
        {isActive && (
          <div className="mt-2 space-y-0.5">
            <div className="h-1 bg-yellow-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full w-3/5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpecialTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<SpecialTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/special-tasks/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(setTask)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500">Special task not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-xs text-green-600 hover:underline">
          Back
        </button>
      </div>
    );
  }

  const status = statusMap[task.status];

  // Determine per-step assignee: parse from description or alternate between assignedBy/assignee
  function stepAssignee(step: TaskStep): { name: string; level: number } {
    // Heuristic: even order steps = assignedBy, odd = assignee (relay pattern)
    // This can be refined when descriptions embed assignee info
    const isEven = step.order % 2 === 0;
    const name = isEven ? task!.assignedBy : task!.assignee;
    return { name, level: localPersonLevel(name) };
  }

  const bigPicture = [task.description, task.reason, task.criteria].filter(Boolean).join('\n\n');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Back */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Back
        </button>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs font-mono text-gray-500">{task.id}</code>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
              {status.label}
            </span>
            <span className="flex-1" />
            <span className="text-[11px] text-gray-400">{task.createdAt}</span>
            <CopyPromptButton id={task.id} />
          </div>
          <p className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</p>
        </div>

        {/* Created by */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="text-gray-400">Created by</span>
          <LevelBadge level={task.assignedByLevel} />
          <span>{task.assignedBy}</span>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>Progress</span>
            <span>{task.progress}%{task.stepsTotal > 0 ? ` · ${task.stepsDone}/${task.stepsTotal} steps` : ''}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Big Picture card */}
      {bigPicture && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Big Picture</p>
          <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
            {bigPicture}
          </ReactMarkdown>
        </div>
      )}

      {/* Relay Steps */}
      {task.steps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm space-y-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Relay Steps</p>
          <hr className="border-gray-100" />
          <div className="pt-1">
            {task.steps.map((step, idx) => {
              const { name, level } = stepAssignee(step);
              return (
                <RelayStep
                  key={step.id}
                  step={step}
                  isLast={idx === task.steps.length - 1}
                  assignee={name}
                  assigneeLevel={level}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
