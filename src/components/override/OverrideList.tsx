"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ddStatusMap,
  type DeepDive,
} from "@/data/override-mock";
import type { SpecialTask, STStatus } from "@/app/api/special-tasks/route";
import KebabTab from "@/components/override/KebabTab";

type Tab = "kebab" | "deep-dive" | "monthly-plan" | "special-task" | "note";

interface NoteItem {
  id: string;
  title: string;
  author: string;
  authorLevel: number;
  readers: string;
  lang: string;
  tags: string[];
  created: string;
}

const stStatusMap: Record<STStatus, { label: string; color: string }> = {
  prepared:    { label: "Prepared",    color: "bg-blue-50 text-blue-600" },
  in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-700" },
  completed:   { label: "Completed",   color: "bg-green-50 text-green-700" },
};

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-1.5 py-0.5 text-[10px] rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
      title="Copy prompt for terminal"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ddPrompt(id: string): string {
  return `Find and read ${id}.md under contrau-ssot/01_raw/kebab/ and proceed with the interview.`;
}

function stPrompt(id: string): string {
  return `Read contrau-dashboard/data/special-tasks/${id}.md and proceed according to the current step and assignee.`;
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

const DD_PAGE_SIZE = 10;

export default function OverrideList() {
  const [tab, setTab] = useState<Tab>("kebab");
  const [deepDives, setDeepDives] = useState<DeepDive[]>([]);
  const [ddLoading, setDdLoading] = useState(true);
  const [ddLoadingMore, setDdLoadingMore] = useState(false);
  const [ddHasMore, setDdHasMore] = useState(false);
  const [ddOffset, setDdOffset] = useState(0);
  const [specialTasks, setSpecialTasks] = useState<SpecialTask[]>([]);
  const [stLoading, setStLoading] = useState(true);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteLoading, setNoteLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deep-dives?limit=${DD_PAGE_SIZE}&offset=0`)
      .then(res => res.json())
      .then(data => {
        if (data.available) {
          setDeepDives(data.items);
          setDdHasMore(data.hasMore);
          setDdOffset(data.items.length);
        }
      })
      .finally(() => setDdLoading(false));

    fetch('/api/special-tasks')
      .then(res => res.json())
      .then(data => { if (data.available) setSpecialTasks(data.data); })
      .finally(() => setStLoading(false));

    fetch('/api/notes')
      .then(res => res.json())
      .then(data => { if (data.available) setNotes(data.items); })
      .finally(() => setNoteLoading(false));
  }, []);

  function loadMoreDeepDives() {
    setDdLoadingMore(true);
    fetch(`/api/deep-dives?limit=${DD_PAGE_SIZE}&offset=${ddOffset}`)
      .then(res => res.json())
      .then(data => {
        if (data.available) {
          setDeepDives(prev => [...prev, ...data.items]);
          setDdHasMore(data.hasMore);
          setDdOffset(prev => prev + data.items.length);
        }
      })
      .finally(() => setDdLoadingMore(false));
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "kebab",        label: "케밥 인터뷰" },
    { key: "deep-dive",   label: "Deep Dive",   count: deepDives.length },
    { key: "monthly-plan", label: "Monthly Plan" },
    { key: "special-task", label: "Special Task", count: specialTasks.length },
    { key: "note",         label: "Note",          count: notes.length },
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
            {t.count !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 케밥 인터뷰 */}
      {tab === "kebab" && <KebabTab />}

      {/* Deep Dive list */}
      {tab === "deep-dive" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            Structured deep-dive interviews requested by People L1-3. Requires authentication via Telegram bot.
          </p>
          {ddLoading ? (
            <p className="text-[11px] text-gray-400">Loading...</p>
          ) : deepDives.length === 0 ? (
            <p className="text-[11px] text-gray-400">No deep dives found.</p>
          ) : deepDives.map((dd) => {
            const status = ddStatusMap[dd.status];
            return (
              <Link key={dd.id} href={`/override/${dd.id}`} className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{dd.id}</code>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
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
                  <CopyPromptButton prompt={ddPrompt(dd.id)} />
                </div>
              </Link>
            );
          })}
          {ddHasMore && (
            <button
              onClick={loadMoreDeepDives}
              disabled={ddLoadingMore}
              className="w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ddLoadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      )}

      {/* Monthly Plan list */}
      {tab === "monthly-plan" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            PL finalizes v1→v2 with AI → CEO feedback → confirmed. Immutable after confirmation.
          </p>
          <p className="text-[11px] text-gray-400">No data available</p>
        </div>
      )}

      {/* Special Task list */}
      {tab === "special-task" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            Important tasks assigned by People L1-2. Progress tracked in real-time.
          </p>
          {stLoading ? (
            <p className="text-[11px] text-gray-400">Loading...</p>
          ) : specialTasks.length === 0 ? (
            <p className="text-[11px] text-gray-400">No special tasks found.</p>
          ) : specialTasks.map((st) => {
            const status = stStatusMap[st.status];
            return (
              <Link key={st.id} href={`/override/special-tasks/${st.id}`} className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-[11px] font-mono text-gray-500">{st.id}</code>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-snug mb-1.5 truncate">
                      {st.title}
                    </p>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all"
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{st.progress}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <LevelBadge level={st.assignedByLevel} />
                        {st.assignedBy}
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className="flex items-center gap-1">
                        <LevelBadge level={st.assigneeLevel} />
                        {st.assignee}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{st.createdAt}</span>
                    </div>
                  </div>
                  <CopyPromptButton prompt={stPrompt(st.id)} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {/* Note list */}
      {tab === "note" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            Management notes authored by leadership. English content shown by default.
          </p>
          {noteLoading ? (
            <p className="text-[11px] text-gray-400">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="text-[11px] text-gray-400">No notes found.</p>
          ) : notes.map((note) => (
            <Link key={note.id} href={`/override/notes/${note.id}`} className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <code className="text-[11px] font-mono text-gray-500">{note.id}</code>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      note.readers === 'all'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {note.readers === 'all' ? 'Public' : note.readers}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-snug mb-1 truncate">
                    {note.title}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <LevelBadge level={note.authorLevel} />
                      {note.author}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{note.tags.length > 0 ? note.tags.join(', ') : '-'}</span>
                    <span className="text-gray-300">|</span>
                    <span>{note.created}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
