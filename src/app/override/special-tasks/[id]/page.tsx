"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { STStatus } from "@/app/api/special-tasks/route";
import type { TaskStep, TaskLog } from "@/app/api/special-tasks/[id]/route";

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
  logs: (TaskLog & { authorLevel: number; createdAt: string })[];
  stepsDone: number;
  stepsTotal: number;
}

interface LocalLog {
  id: string;
  author: string;
  authorLevel: number;
  createdAt: string;
  content: string;
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
  pending:     { label: "Pending",     color: "bg-gray-100 text-gray-600" },
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

function CopyButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="px-2 py-1 text-[11px] rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
    >
      {copied ? "Copied!" : "Copy ID"}
    </button>
  );
}

export default function SpecialTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<SpecialTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Step local state
  const [localDone, setLocalDone] = useState<Record<string, boolean>>({});

  // Activity log local state
  const [logName, setLogName] = useState("");
  const [logText, setLogText] = useState("");
  const [localLogs, setLocalLogs] = useState<LocalLog[]>([]);

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
          ← Back
        </button>
      </div>
    );
  }

  const status = statusMap[task.status];

  const isDone = (step: TaskStep) => localDone[step.id] ?? step.done;
  const handleStepClick = (step: TaskStep) => {
    if (isDone(step)) return;
    setLocalDone(prev => ({ ...prev, [step.id]: true }));
  };

  const handleAddLog = () => {
    const name = logName.trim();
    const content = logText.trim();
    if (!name || !content) return;
    const now = new Date();
    const createdAt = now.toISOString().slice(0, 16).replace('T', ' ');
    setLocalLogs(prev => [{
      id: `local-${Date.now()}`,
      author: name,
      authorLevel: localPersonLevel(name),
      createdAt,
      content,
    }, ...prev]);
    setLogText("");
  };

  const allLogs = [...localLogs, ...task.logs];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Back */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </button>
      </div>

      {/* Meta card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs font-mono text-gray-500">{task.id}</code>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
              {status.label}
            </span>
            <span className="flex-1" />
            <span className="text-[11px] text-gray-400">{task.createdAt}</span>
            <CopyButton id={task.id} />
          </div>
          <p className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <LevelBadge level={task.assignedByLevel} />
            {task.assignedBy}
          </span>
          <span className="text-gray-300">→</span>
          <span className="flex items-center gap-1">
            <LevelBadge level={task.assigneeLevel} />
            {task.assignee}
          </span>
        </div>

        {/* Progress bar */}
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

      {/* What / Why / Criteria */}
      {(task.description || task.reason || task.criteria) && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm space-y-6">
          {task.description && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">What</p>
              <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
            </div>
          )}
          {task.reason && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Why</p>
              <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>{task.reason}</ReactMarkdown>
            </div>
          )}
          {task.criteria && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Definition of Done</p>
              <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>{task.criteria}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Steps checklist */}
      {task.steps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm space-y-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Steps</p>
          <hr className="border-gray-100" />
          <ol className="space-y-2">
            {task.steps.map((step, idx) => (
              <li
                key={step.id}
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => handleStepClick(step)}
              >
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-colors ${
                  isDone(step)
                    ? 'bg-green-400 border-green-400 text-white'
                    : 'border-gray-300 text-gray-400 group-hover:border-green-300'
                }`}>
                  {isDone(step) ? '✓' : idx + 1}
                </span>
                <span className={`text-[14px] leading-[1.7] ${isDone(step) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {step.description}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Activity Log — always shown */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm space-y-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Activity Log</p>
        <hr className="border-gray-100" />

        {/* Input form */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={logName}
            onChange={e => setLogName(e.target.value)}
            className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-green-300"
          />
          <textarea
            placeholder="Add an update..."
            value={logText}
            onChange={e => setLogText(e.target.value)}
            rows={2}
            className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-green-300 resize-none"
          />
          <button
            onClick={handleAddLog}
            disabled={!logName.trim() || !logText.trim()}
            className="text-[12px] px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add entry
          </button>
        </div>

        {allLogs.length > 0 && (
          <div className="space-y-3 pt-1">
            {allLogs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className="shrink-0 pt-0.5">
                  <LevelBadge level={log.authorLevel} />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-medium text-gray-700">{log.author}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">{log.createdAt}</span>
                  </div>
                  <p className="text-[13px] text-gray-600 leading-[1.7]">{log.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {allLogs.length === 0 && (
          <p className="text-[12px] text-gray-300 italic">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
