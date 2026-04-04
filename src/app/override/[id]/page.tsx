"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type DDStatus = "pending" | "in_progress" | "submitted" | "closed";

interface DeepDiveDetail {
  id: string;
  issuedBy: string;
  issuedByLevel: number;
  interviewee: string;
  intervieweeLevel: number;
  title: string;
  description: string;
  status: DDStatus;
  domain: string;
  createdAt: string;
  aiSummary: string;
  metaInterview: string;
  filePath: string;
}

const mdComponents = {
  h1: ({children}: {children: React.ReactNode}) => <h1 className="text-sm font-bold text-gray-800 mt-5 mb-2 first:mt-0">{children}</h1>,
  h2: ({children}: {children: React.ReactNode}) => <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-2 first:mt-0 pb-1 border-b border-gray-100">{children}</h2>,
  h3: ({children}: {children: React.ReactNode}) => <h3 className="text-[12px] font-semibold text-gray-700 mt-3 mb-1">{children}</h3>,
  p: ({children}: {children: React.ReactNode}) => <p className="text-[13px] text-gray-700 leading-relaxed mb-2 last:mb-0">{children}</p>,
  ul: ({children}: {children: React.ReactNode}) => <ul className="list-disc list-outside ml-4 space-y-0.5 mb-2 last:mb-0">{children}</ul>,
  ol: ({children}: {children: React.ReactNode}) => <ol className="list-decimal list-outside ml-4 space-y-0.5 mb-2 last:mb-0">{children}</ol>,
  li: ({children}: {children: React.ReactNode}) => <li className="text-[13px] text-gray-700 leading-relaxed">{children}</li>,
  strong: ({children}: {children: React.ReactNode}) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({children}: {children: React.ReactNode}) => <em className="italic text-gray-500">{children}</em>,
  hr: () => <hr className="border-gray-100 my-4" />,
  code: ({children}: {children: React.ReactNode}) => <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-600">{children}</code>,
  blockquote: ({children}: {children: React.ReactNode}) => <blockquote className="border-l-2 border-gray-200 pl-3 text-[13px] text-gray-500 italic my-2">{children}</blockquote>,
  table: ({children}: {children: React.ReactNode}) => <div className="overflow-x-auto my-3"><table className="text-[12px] w-full border-collapse">{children}</table></div>,
  thead: ({children}: {children: React.ReactNode}) => <thead className="bg-gray-50">{children}</thead>,
  th: ({children}: {children: React.ReactNode}) => <th className="text-left text-[11px] font-semibold text-gray-500 px-3 py-1.5 border border-gray-200">{children}</th>,
  td: ({children}: {children: React.ReactNode}) => <td className="text-[12px] text-gray-700 px-3 py-1.5 border border-gray-200">{children}</td>,
  tr: ({children}: {children: React.ReactNode}) => <tr className="even:bg-gray-50">{children}</tr>,
};

const statusMap: Record<DDStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-700" },
  submitted: { label: "Submitted", color: "bg-green-50 text-green-700" },
  closed: { label: "Completed", color: "bg-green-50 text-green-700" },
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

export default function DeepDiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dd, setDd] = useState<DeepDiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/deep-dives/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(setDd)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !dd) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500">Deep dive not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-xs text-green-600 hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  const status = statusMap[dd.status];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Meta card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono text-gray-500">{dd.id}</code>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                {status.label}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200">
                {dd.domain}
              </span>
            </div>
            <p className="text-base font-semibold text-gray-900 leading-snug">{dd.title}</p>
          </div>
          <span className="text-[11px] text-gray-400 shrink-0">{dd.createdAt}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <LevelBadge level={dd.issuedByLevel} />
            {dd.issuedBy}
          </span>
          <span className="text-gray-300">→</span>
          <span className="flex items-center gap-1">
            <LevelBadge level={dd.intervieweeLevel} />
            {dd.interviewee}
          </span>
        </div>
      </div>

      {/* Meta Interview (background + key questions) — shown if present */}
      {dd.metaInterview && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-1">
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
            Interview Background
          </p>
          <div className="space-y-0">
            <ReactMarkdown components={mdComponents}>{dd.metaInterview}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          AI Summary
        </p>
        {dd.aiSummary ? (
          <div className="space-y-0">
            <ReactMarkdown components={mdComponents}>{dd.aiSummary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">추후 추가 예정</p>
        )}
      </div>
    </div>
  );
}
