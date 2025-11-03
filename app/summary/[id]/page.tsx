"use client";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getProgram, getDailyLogs } from "@/lib/storage";

export default function SummaryPage() {
  const { id } = useParams<{id:string}>();
  const p = getProgram(id);

  const stats = useMemo(() => {
    if (!p) return null;
    const logs = getDailyLogs(p.id);
    const byMethod: Record<string,{success:number,total:number, dayIndex:number}> = {};
    p.days.forEach(d => byMethod[d.method] = { success:0, total:0, dayIndex:d.dayIndex });
    logs.forEach(l => {
      const m = p.days.find(d => d.dayIndex===l.dayIndex)?.method;
      if (!m) return;
      byMethod[m].total += 1;
      if (l.status === "success") byMethod[m].success += 1;
    });
    const rows = Object.entries(byMethod).map(([method, v]) => ({
      method, success: v.success, total: v.total, rate: v.total? Math.round(v.success/v.total*100):0
    })).sort((a,b)=>b.rate-a.rate || b.success-a.success);
    const best = rows[0];
    return { rows, best };
  }, [p]);

  if (!p) return <div className="card p-6">프로그램을 찾을 수 없습니다.</div>;
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <h1 className="h1">{p.title} 요약</h1>
      {stats.best && (
        <div className="card p-4">
          <div className="text-sm text-gray-500">가장 효과적인 방법</div>
          <div className="text-lg font-semibold">{stats.best.method} · {stats.best.rate}% 성공률</div>
        </div>
      )}
      <div className="card p-4">
        <div className="h2 mb-2">방법별 성과</div>
        <ul className="text-sm text-gray-700 space-y-1">
          {stats.rows.map(r=>(
            <li key={r.method} className="flex justify-between">
              <span>{r.method}</span>
              <span>{r.success}/{r.total} · {r.rate}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
