// app/today/page.tsx
"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getProgram,
  getPrograms,
  addDailyLog,
  getLastProgramId,
  setLastProgramId,
} from "@/lib/storage";
import { todayIndex } from "@/lib/schedule";

export const dynamic = "force-dynamic";

function TodayInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const pidFromUrl = sp.get("program") || "";

  // URL에 program이 없으면 최근 프로그램으로 자동 대체
  const [programId, setProgramId] = useState<string>("");

  useEffect(() => {
    if (pidFromUrl) {
      setProgramId(pidFromUrl);
      setLastProgramId(pidFromUrl);
      return;
    }
    const last = getLastProgramId();
    if (last) {
      setProgramId(last);
      router.replace(`/today?program=${last}`);
      return;
    }
    const all = getPrograms();
    if (all[0]) {
      setProgramId(all[0].id);
      router.replace(`/today?program=${all[0].id}`);
    }
  }, [pidFromUrl, router]);

  if (!programId) {
    return (
      <div className="card p-6">
        <div className="text-sm text-gray-700">진행 중인 프로그램이 없습니다.</div>
        <a className="btn btn-primary mt-3 inline-block" href="/plan">
          프로그램 만들기
        </a>
      </div>
    );
  }

  const p = getProgram(programId);
  if (!p) {
    return (
      <div className="card p-6">
        <div className="text-sm text-gray-700">프로그램을 찾을 수 없습니다.</div>
        <a className="btn btn-primary mt-3 inline-block" href="/plan">
          새 프로그램 만들기
        </a>
      </div>
    );
  }

  const idx = todayIndex(p, new Date());
  const task = p.days[idx];

  const onLog = (status: "success" | "fail") => {
    addDailyLog({ programId: p.id, dayIndex: idx, ts: Date.now(), status });
    alert(status === "success" ? "기록: 성공 🎉" : "기록: 실패 😅");
  };

  return (
    <div className="space-y-4">
      <h1 className="h1">오늘의 방법</h1>
      <div className="card p-6 space-y-2">
        <div className="text-sm text-gray-500">
          {p.title} · {p.minutes}분 · {idx + 1}/{p.days.length}일차
        </div>
        {task ? (
          <>
            <div className="text-lg font-semibold">
              {task.label} · {task.method}
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary" onClick={() => onLog("success")}>
                완료
              </button>
              <button className="btn btn-ghost" onClick={() => onLog("fail")}>
                포기
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => router.push(`/summary/${p.id}`)}
              >
                요약 보기
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-600">
            오늘 할 항목이 없습니다. 시작일/기간을 확인하세요.
          </div>
        )}
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