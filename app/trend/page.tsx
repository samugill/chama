"use client";
import { useEffect, useMemo, useState } from "react";
import { getPrograms, getDailyLogs } from "@/lib/storage";

export const dynamic = "force-dynamic";

type DayRow = { label: string; success: number; total: number };

function lastNDates(n: number) {
  const out: { key: string; label: string }[] = [];
  const w = ["일","월","화","수","목","금","토"];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(+now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    out.push({ key, label: `${w[d.getDay()]} (${d.getMonth()+1}/${d.getDate()})` });
  }
  return out;
}

export default function TrendPage() {
  const [programId, setProgramId] = useState<string | null>(null);

  // 프로그램 목록
  const programs = useMemo(() => getPrograms(), []);
  useEffect(() => {
    if (!programId && programs[0]) setProgramId(programs[0].id);
  }, [programId, programs]);

  // 선택한 프로그램의 7일 성과
  const rows: DayRow[] = useMemo(() => {
    if (!programId) return [];
    const logs = getDailyLogs(programId);
    const days = lastNDates(7);
    // dayIndex → 실제 날짜로 찍은 로그가 아니라서, “기록한 날짜(ts)” 기준으로 집계
    const byDate: Record<string, { success: number; total: number }> = {};
    days.forEach(d => (byDate[d.key] = { success: 0, total: 0 }));
    logs.forEach(l => {
      const key = new Date(l.ts).toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { success: 0, total: 0 };
      byDate[key].total += 1;
      if (l.status === "success") byDate[key].success += 1;
    });
    return days.map(d => ({
      label: d.label,
      success: byDate[d.key]?.success ?? 0,
      total: byDate[d.key]?.total ?? 0
    }));
  }, [programId]);

  // 총합/성공률
  const summary = useMemo(() => {
    const s = rows.reduce((a, r) => ({ s: a.s + r.success, t: a.t + r.total }), { s: 0, t: 0 });
    const rate = s.t ? Math.round((s.s / s.t) * 100) : 0;
    return { success: s.s, total: s.t, rate };
  }, [rows]);

  return (
    <div className="space-y-6">
      <h1 className="h1">추세</h1>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="text-sm">프로그램 선택</div>
        <select
          className="input"
          value={programId ?? ""}
          onChange={(e) => setProgramId(e.target.value || null)}
        >
          {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <div className="ml-auto text-sm text-gray-600">
          최근 7일: <b>{summary.rate}%</b> ({summary.success}/{summary.total})
        </div>
      </div>

      {/* 막대형 미니 차트 (CSS만) */}
      <div className="card p-4">
        <div className="grid grid-cols-7 gap-2 items-end">
          {rows.map((r, i) => {
            const h = r.total ? Math.max(6, Math.round((r.success / r.total) * 100)) : 2;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 rounded bg-gray-100 p-0.5">
                  <div className="w-full rounded" style={{ height: `${h}%`, background: "currentColor", color: "rgb(59 130 246)" }} />
                </div>
                <div className="text-[10px] text-gray-500 text-center leading-3">{r.label}</div>
                <div className="text-[10px] text-gray-700">{r.success}/{r.total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오늘 카드 */}
      <div className="card p-4">
        <div className="text-sm text-gray-500 mb-2">오늘</div>
        {(() => {
          const today = rows[rows.length - 1];
          if (!today) return <div className="text-sm text-gray-600">기록 없음</div>;
          return (
            <div className="text-sm">
              성공 {today.success} / 시도 {today.total} ({today.total ? Math.round((today.success / today.total) * 100) : 0}%)
            </div>
          );
        })()}
      </div>
    </div>
  );
}
