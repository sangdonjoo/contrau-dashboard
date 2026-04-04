"use client";

import { useState, useEffect } from "react";
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
          <div className="prose prose-sm prose-amber max-w-none text-gray-700">
            <ReactMarkdown>{dd.metaInterview}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          AI Summary
        </p>
        {dd.aiSummary ? (
          <div className="prose prose-sm max-w-none text-gray-800
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-h2:text-sm prose-h3:text-sm
            prose-p:leading-relaxed prose-p:text-gray-700
            prose-li:text-gray-700 prose-li:leading-relaxed
            prose-strong:text-gray-900
            prose-code:text-xs prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
            prose-blockquote:border-l-2 prose-blockquote:border-gray-200 prose-blockquote:text-gray-500">
            <ReactMarkdown>{dd.aiSummary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">추후 추가 예정</p>
        )}
      </div>
    </div>
  );
}
