"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProgram, addDailyLog } from "@/lib/storage";
import { todayIndex } from "@/lib/schedule";

export const dynamic = "force-dynamic";

function TodayInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const pid = sp.get("program");
  const [now] = useState(new Date());

  const view = useMemo(() => {
    if (!pid) return { error: "program 파라미터가 없습니다." as const };
    const p = getProgram(pid);
    if (!p) return { error: "프로그램을 찾을 수 없습니다." as const };
    const idx = todayIndex(p, now);
    const task = p.days[idx];
    return { p, idx, task } as const;
  }, [pid, now]);

  if ("error" in view) return <div className="card p-6">{view.error}</div>;
  const { p, idx, task } = view;

  const onLog = (status: "success"|"fail") => {
    addDailyLog({ programId: p.id, dayIndex: idx, ts: Date.now(), status });
    alert(status === "success" ? "기록: 성공 🎉" : "기록: 실패 😅");
  };

  return (
    <div className="space-y-4">
      <h1 className="h1">오늘의 방법</h1>
      <div className="card p-6 space-y-2">
        <div className="text-sm text-gray-500">{p.title} · {p.minutes}분</div>
        <div className="text-lg font-semibold">{task.label} · {task.method}</div>
        <div className="flex gap-2 mt-2">
          <button className="btn btn-primary" onClick={()=>onLog("success")}>완료</button>
          <button className="btn btn-ghost" onClick={()=>onLog("fail")}>포기</button>
          <button className="btn btn-ghost" onClick={()=>router.push(`/summary/${p.id}`)}>요약 보기</button>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={<div className="card p-6">불러오는 중…</div>}>
      <TodayInner />
    </Suspense>
  );
}
