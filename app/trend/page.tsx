"use client";
import { useEffect, useMemo, useState } from "react";
import { getPrograms, getDailyLogs } from "@/lib/storage";

export const dynamic = "force-dynamic";

type DayRow = { label: string; key: string; success: number; total: number };

function dateKeysFrom(startISO: string, len: number) {
  const out: { key: string; label: string }[] = [];
  const w = ["일","월","화","수","목","금","토"];
  const start = new Date(startISO);
  for (let i = 0; i < len; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const key = d.toISOString().slice(0,10);
    out.push({ key, label: `${w[d.getDay()]} (${d.getMonth()+1}/${d.getDate()})` });
  }
  return out;
}

export default function TrendPage() {
  const programs = useMemo(() => getPrograms(), []);
  const [programId, setProgramId] = useState<string>("");
  const [range, setRange] = useState<7|14|30>(7); // 보기 토글 (선택)

  useEffect(() => {
    if (!programId && programs[0]) setProgramId(programs[0].id);
  }, [programId, programs]);

  const rows = useMemo<DayRow[]>(() => {
    const p = programs.find(x => x.id === programId);
    if (!p) return [];
    const fullKeys = dateKeysFrom(p.startDate, p.days.length);   // 프로그램 길이 기준
    const viewKeys = fullKeys.slice(-range); // 토글된 범위만 보기
    const logs = getDailyLogs(p.id);

    const byKey: Record<string, {s:number; t:number}> = {};
    viewKeys.forEach(k => (byKey[k.key] = {s:0, t:0}));

    logs.forEach(l => {
      const k = new Date(l.ts).toISOString().slice(0,10);
      if (!byKey[k]) return;
      byKey[k].t += 1;
      if (l.status === "success") byKey[k].s += 1;
    });

    return viewKeys.map(k => ({
      key: k.key,
      label: k.label,
      success: byKey[k.key]?.s ?? 0,
      total: byKey[k.key]?.t ?? 0
    }));
  }, [programId, programs, range]);

  const summary = useMemo(() => {
    const s = rows.reduce((a,r)=>({s:a.s+r.success, t:a.t+r.total}), {s:0,t:0});
    const rate = s.t ? Math.round((s.s/s.t)*100) : 0;
    return { ...s, rate };
  }, [rows]);

  return (
    <div className="space-y-6">
      <h1 className="h1">추세</h1>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm">프로그램</div>
        <select className="input" value={programId} onChange={e=>setProgramId(e.target.value)}>
          {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>

        <div className="text-sm ml-auto flex items-center gap-2">
          보기:
          {[7,14,30].map(n=>(
            <button key={n}
              className={`text-xs px-2 py-1 rounded ${range===n?'bg-gray-900 text-white':'bg-gray-100'}`}
              onClick={()=>setRange(n as 7|14|30)}
              type="button">
              {n}일
            </button>
          ))}
          <span className="text-gray-600 ml-2">
            성공률 <b>{summary.rate}%</b> ({summary.s}/{summary.t})
          </span>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-7 md:grid-cols-14 lg:grid-cols-30 gap-2 items-end">
          {rows.map((r,i)=>{
            const h = r.total ? Math.max(6, Math.round((r.success/r.total)*100)) : 2;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 rounded bg-gray-100 p-0.5">
                  <div className="w-full rounded" style={{height:`${h}%`, background:"currentColor", color:"rgb(59 130 246)"}}/>
                </div>
                <div className="text-[10px] text-gray-500 leading-3 text-center">{r.label}</div>
                <div className="text-[10px] text-gray-700">{r.success}/{r.total}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm text-gray-500 mb-2">오늘</div>
        {(() => {
          const todayKey = new Date().toISOString().slice(0,10);
          const t = rows.find(x=>x.key===todayKey);
          if (!t) return <div className="text-sm text-gray-600">기록 없음</div>;
          const rate = t.total ? Math.round((t.success/t.total)*100) : 0;
          return <div className="text-sm">성공 {t.success} / 시도 {t.total} ({rate}%)</div>;
        })()}
      </div>
    </div>
  );
}
