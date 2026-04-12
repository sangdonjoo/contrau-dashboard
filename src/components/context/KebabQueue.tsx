"use client";

import { useState, useEffect, useMemo } from "react";
import type { KebabQueueItem, KebabDomainCount, KebabQueueResponse } from "@/app/api/kebab/route";

const DOMAIN_LABELS: Record<string, string> = {
  company: "Company",
  legal: "Legal",
  accounting: "Accounting",
  people: "People",
  production: "Production",
};

const MODE_LABELS: Record<string, string> = {
  extract: "Extract",
  confirm: "Confirm",
  refine: "Refine",
};

const MODE_COLORS: Record<string, string> = {
  extract: "bg-blue-50 text-blue-700",
  confirm: "bg-amber-50 text-amber-700",
  refine: "bg-purple-50 text-purple-700",
};

type SortKey = "score" | "time";

function ToastMessage({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
      {message}
    </div>
  );
}

export default function KebabQueue() {
  const [items, setItems] = useState<KebabQueueItem[]>([]);
  const [counts, setCounts] = useState<KebabDomainCount>({
    company: 0, legal: 0, accounting: 0, people: 0, production: 0, total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [firing, setFiring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kebab")
      .then((r) => r.json())
      .then((data: KebabQueueResponse) => {
        if (data.available) {
          setItems(data.items);
          setCounts(data.counts);
        } else {
          setError(data.error ?? "데이터 로드 실패");
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const assignees = useMemo(() => {
    const set = new Set(items.map((i) => i.assignee));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (filterAssignee !== "all") result = result.filter((i) => i.assignee === filterAssignee);
    if (filterMode !== "all") result = result.filter((i) => i.mode === filterMode);
    if (sortKey === "score") result.sort((a, b) => b.score - a.score);
    else result.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
    return result;
  }, [items, filterAssignee, filterMode, sortKey]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  async function handleFire() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setFiring(true);
    try {
      const res = await fetch("/api/kebab/fire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      setToast(data.message ?? `${ids.length}건 발사`);
      setSelected(new Set());
    } catch (e) {
      setToast(`발사 실패: ${String(e)}`);
    } finally {
      setFiring(false);
    }
  }

  if (loading) return <p className="text-xs text-gray-400 py-8 text-center">로딩 중...</p>;
  if (error) return <p className="text-xs text-red-400 py-8 text-center">오류: {error}</p>;

  return (
    <div className="space-y-4">
      {/* 도메인별 큐 카운터 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(Object.entries(DOMAIN_LABELS) as [string, string][]).map(([key, label]) => (
          <div key={key} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{counts[key as keyof KebabDomainCount] ?? 0}</p>
          </div>
        ))}
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-green-600 font-medium uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-green-700 mt-0.5">{counts.total}</p>
        </div>
      </div>

      {/* 필터 + 정렬 + 발사 */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400"
        >
          <option value="all">담당자 전체</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400"
        >
          <option value="all">타입 전체</option>
          <option value="extract">Extract</option>
          <option value="confirm">Confirm</option>
          <option value="refine">Refine</option>
        </select>

        <div className="flex rounded-md border border-gray-200 overflow-hidden">
          {(["score", "time"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`text-xs px-3 py-1.5 transition-colors ${
                sortKey === key
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {key === "score" ? "스코어순" : "시간순"}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {selected.size > 0 && (
          <button
            onClick={handleFire}
            disabled={firing}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {firing ? "발사 중..." : `${selected.size}건 발사`}
          </button>
        )}
      </div>

      {/* 큐 리스트 테이블 */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">케밥 큐 비어있음.</p>
          <p className="text-xs text-gray-300 mt-1">도메인봇이 raw-digest 이격을 발견하면 자동 적재됩니다.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">스코어</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">도메인</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">담당자</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">타입</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 max-w-xs">요약</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">발생일</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">해소일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selected.has(item.id) ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-bold text-gray-700">{item.score}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-gray-600 capitalize">{item.domain}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-gray-600">{item.assignee}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${MODE_COLORS[item.mode] ?? "bg-gray-50 text-gray-600"}`}>
                      {MODE_LABELS[item.mode] ?? item.mode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 max-w-xs">
                    <p className="text-gray-700 truncate" title={item.question_text}>
                      {item.question_text}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{item.occurred_at || "—"}</td>
                  <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{item.resolved_at ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <ToastMessage message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
