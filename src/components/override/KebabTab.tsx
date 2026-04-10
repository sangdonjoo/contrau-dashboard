"use client";

import { useState, useEffect, useCallback } from "react";
import type { KebabTicket, KebabDomainStat } from "@/app/api/kebab/route";

const DOMAINS = ["company", "legal", "accounting", "people", "production"];
const DOMAIN_LABEL: Record<string, string> = {
  company: "Company", legal: "Legal", accounting: "Acctg",
  people: "People", production: "Prod",
};
const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  FC:    { label: "FactCheck", color: "bg-blue-50 text-blue-600" },
  TK:    { label: "Ticket",    color: "bg-purple-50 text-purple-600" },
  kebab: { label: "Kebab",     color: "bg-orange-50 text-orange-600" },
};
const DOMAIN_COLOR: Record<string, string> = {
  company:    "text-slate-700",
  legal:      "text-red-700",
  accounting: "text-emerald-700",
  people:     "text-blue-700",
  production: "text-amber-700",
};

function ScoreBadge({ total }: { total: number }) {
  const color =
    total >= 7 ? "bg-red-100 text-red-700" :
    total >= 5 ? "bg-yellow-100 text-yellow-700" :
    "bg-gray-100 text-gray-500";
  return (
    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${color}`}>
      {total}/9
    </span>
  );
}

function ScoreBreakdown({ u, i, im }: { u: number; i: number; im: number }) {
  const dot = (v: number) => (
    <span className="flex items-center gap-0.5">
      {[0,1,2,3].map(n => (
        <span key={n} className={`w-1.5 h-1.5 rounded-full ${n < v ? "bg-current opacity-80" : "bg-current opacity-15"}`} />
      ))}
    </span>
  );
  return (
    <span className="flex items-center gap-2 text-[10px] text-gray-400">
      <span className="flex items-center gap-1">긴급 {dot(u)}</span>
      <span className="flex items-center gap-1">중요 {dot(i)}</span>
      <span className="flex items-center gap-1">임팩트 {dot(im)}</span>
    </span>
  );
}

function DomainCard({ stat, active, onClick }: {
  stat: KebabDomainStat; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start px-3 py-2 rounded-lg border transition-all ${
        active
          ? "border-green-400 bg-green-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        {DOMAIN_LABEL[stat.domain]}
      </span>
      <span className="text-lg font-bold text-gray-800 leading-tight">{stat.total}</span>
      {stat.urgent > 0 && (
        <span className="text-[10px] text-red-500 font-medium">긴급 {stat.urgent}</span>
      )}
    </button>
  );
}

const PAGE_SIZE = 30;

export default function KebabTab() {
  const [tickets, setTickets]           = useState<KebabTicket[]>([]);
  const [domainStats, setDomainStats]   = useState<KebabDomainStat[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [hasMore, setHasMore]           = useState(false);
  const [offset, setOffset]             = useState(0);
  const [total, setTotal]               = useState(0);

  // 필터
  const [filterDomain,   setFilterDomain]   = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [showArchive,    setShowArchive]     = useState(false);

  const buildUrl = useCallback((off: number) => {
    const p = new URLSearchParams();
    p.set('limit',  String(PAGE_SIZE));
    p.set('offset', String(off));
    p.set('status', showArchive ? 'all' : 'open');
    if (filterDomain)   p.set('domain',   filterDomain);
    if (filterAssignee) p.set('assignee', filterAssignee);
    return `/api/kebab?${p}`;
  }, [filterDomain, filterAssignee, showArchive]);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    setOffset(0);
    fetch(buildUrl(0))
      .then(r => r.json())
      .then(d => {
        if (d.available) {
          setTickets(d.items);
          setDomainStats(d.domainStats ?? []);
          setTotal(d.total);
          setHasMore(d.hasMore);
          setOffset(d.items.length);
        }
      })
      .finally(() => setLoading(false));
  }, [buildUrl]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  function loadMore() {
    setLoadingMore(true);
    fetch(buildUrl(offset))
      .then(r => r.json())
      .then(d => {
        if (d.available) {
          setTickets(prev => [...prev, ...d.items]);
          setHasMore(d.hasMore);
          setOffset(prev => prev + d.items.length);
        }
      })
      .finally(() => setLoadingMore(false));
  }

  const assignees = Array.from(new Set(tickets.map(t => t.assignee).filter(Boolean))) as string[];

  return (
    <div className="space-y-4">
      {/* 도메인 현황판 */}
      <div className="grid grid-cols-5 gap-2">
        {domainStats.map(stat => (
          <DomainCard
            key={stat.domain}
            stat={stat}
            active={filterDomain === stat.domain}
            onClick={() => setFilterDomain(prev => prev === stat.domain ? "" : stat.domain)}
          />
        ))}
      </div>

      {/* 필터 바 */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterDomain}
          onChange={e => setFilterDomain(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600"
        >
          <option value="">모든 도메인</option>
          {DOMAINS.map(d => <option key={d} value={d}>{DOMAIN_LABEL[d]}</option>)}
        </select>

        <select
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600"
        >
          <option value="">모든 담당자</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showArchive}
            onChange={e => setShowArchive(e.target.checked)}
            className="rounded"
          />
          아카이브 포함 (1년)
        </label>

        <span className="text-[11px] text-gray-400">{total}건</span>
      </div>

      {/* 티켓 리스트 */}
      {loading ? (
        <p className="text-[11px] text-gray-400">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="text-[11px] text-gray-400">티켓 없음.</p>
      ) : (
        <div className="space-y-1.5">
          {tickets.map(t => {
            const typeInfo = TYPE_LABEL[t.ticket_type] ?? { label: t.ticket_type, color: "bg-gray-100 text-gray-500" };
            const domainColor = DOMAIN_COLOR[t.domain] ?? "text-gray-600";
            const isResolved = t.status !== 'open';
            return (
              <div
                key={t.id}
                className={`rounded-lg border bg-white px-3 py-2.5 shadow-sm transition-all ${
                  isResolved ? "opacity-50" : "hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 스코어 */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <ScoreBadge total={t.score_total} />
                  </div>

                  {/* 본문 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <code className="text-[10px] font-mono text-gray-400">{t.id}</code>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className={`text-[10px] font-medium ${domainColor}`}>
                        {DOMAIN_LABEL[t.domain] ?? t.domain}
                      </span>
                      {isResolved && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">
                          해소됨
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 leading-snug mb-1 line-clamp-2">
                      {t.question_summary || "—"}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      <ScoreBreakdown u={t.score_urgency} i={t.score_importance} im={t.score_impact} />
                      {t.assignee && <span className="text-gray-500">{t.assignee}</span>}
                      <span>{t.requested_at?.slice(0, 10) ?? "—"}</span>
                      {t.resolved_at && <span>→ {t.resolved_at.slice(0, 10)}</span>}
                      {t.proposed_kebab_path && (
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                          {t.proposed_kebab_path}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : `더 보기 (${total - offset}건 남음)`}
        </button>
      )}
    </div>
  );
}
