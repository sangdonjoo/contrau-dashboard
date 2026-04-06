"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Lang = "en" | "ko" | "vi";

interface NoteDetail {
  id: string;
  title: string;
  author: string;
  authorLevel: number;
  readers: string;
  lang: string;
  tags: string[];
  created: string;
  contentEn: string;
  contentKo: string;
  contentVi: string;
}

const LANG_LABELS: Record<Lang, string> = { en: "EN", ko: "한국어", vi: "Tiếng Việt" };

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
  code: ({children}: {children?: React.ReactNode}) => <code className="text-[12px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">{children}</code>,
  pre: ({children}: {children?: React.ReactNode}) => (
    <pre className="bg-gray-900 text-green-300 text-[12px] font-mono rounded-lg p-4 my-4 overflow-x-auto leading-[1.7] whitespace-pre-wrap">
      {children}
    </pre>
  ),
  blockquote: ({children}: {children?: React.ReactNode}) => <blockquote className="border-l-4 border-green-200 pl-4 text-[14px] text-gray-500 italic my-4 bg-gray-50 py-2 rounded-r">{children}</blockquote>,
  table: ({children}: {children?: React.ReactNode}) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse text-[13px]">{children}</table></div>,
  thead: ({children}: {children?: React.ReactNode}) => <thead className="bg-gray-50">{children}</thead>,
  th: ({children}: {children?: React.ReactNode}) => <th className="text-left text-[11px] font-semibold text-gray-500 px-4 py-2 border-b-2 border-gray-200">{children}</th>,
  td: ({children}: {children?: React.ReactNode}) => <td className="text-[13px] text-gray-700 px-4 py-2.5 border-b border-gray-100">{children}</td>,
  tr: ({children}: {children?: React.ReactNode}) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
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

function LangToggle({ lang, onChange, available }: { lang: Lang; onChange: (l: Lang) => void; available: Set<Lang> }) {
  const langs: Lang[] = ["en", "ko", "vi"];
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      {langs.map((l) => {
        const disabled = !available.has(l);
        return (
          <button
            key={l}
            onClick={() => !disabled && onChange(l)}
            disabled={disabled}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
              disabled
                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                : lang === l
                ? "bg-green-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(setNote)
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

  if (error || !note) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500">Note not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-xs text-green-600 hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  const contentMap: Record<Lang, string> = {
    en: note.contentEn,
    ko: note.contentKo,
    vi: note.contentVi,
  };
  const availableLangs = new Set<Lang>(
    (["en", "ko", "vi"] as Lang[]).filter((l) => contentMap[l]?.trim())
  );
  const content = contentMap[lang] || note.contentEn;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono text-gray-500">{note.id}</code>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                note.readers === 'all'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {note.readers === 'all' ? 'Public' : note.readers}
              </span>
              {note.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-lg font-semibold text-gray-900 leading-snug">{note.title}</p>
          </div>
          <span className="text-[11px] text-gray-400 shrink-0">{note.created}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <LevelBadge level={note.authorLevel} />
          <span>{note.author}</span>
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex justify-end">
        <LangToggle lang={lang} onChange={setLang} available={availableLangs} />
      </div>

      {/* Content card */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm space-y-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          Note Content
        </p>
        <hr className="border-gray-100 mb-6" />
        {content ? (
          <div className="space-y-0">
            <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No content available in this language.</p>
        )}
      </div>
    </div>
  );
}
