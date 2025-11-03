"use client";                          // ← 반드시 최상단
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getPrograms, setLastProgramId,
  seedDailyLogsForDemo, clearDailyLogs
} from "@/lib/storage";

export default function DemoSeedPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const programs = useMemo(() => getPrograms(), []);
  const [programId, setProgramId] = useState<string>("");

  useEffect(() => {
    const pid = sp.get("program");
    if (pid) setProgramId(pid);
    else if (programs[0]) setProgramId(programs[0].id);
  }, [sp, programs]);

  if (!programId) {
    return (
      <div className="card p-6">
        <div className="text-sm">프로그램이 없습니다. 먼저 하나 생성하세요.</div>
        <a href="/plan" className="btn btn-primary mt-3 inline-block">방법 생성</a>
      </div>
    );
  }

  const seed70 = () => {
    seedDailyLogsForDemo({ programId, successRate: 0.7, days: 7 });
    setLastProgramId(programId);
    alert("데모 로그(7일·성공률 70%) 생성 완료!");
  };
  const seedPattern = () => {
    seedDailyLogsForDemo({
      programId,
      days: 7,
      pattern: ["success","success","fail","success","fail","success","success"],
    });
    setLastProgramId(programId);
    alert("데모 로그(패턴) 생성 완료!");
  };
  const wipe = () => {
    clearDailyLogs(programId);
    alert("이 프로그램의 로그를 모두 지웠습니다.");
  };

  return (
    <div className="space-y-6">
      <h1 className="h1">데모 데이터 시드</h1>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm">프로그램 선택</div>
        <select className="input" value={programId} onChange={e=>setProgramId(e.target.value)}>
          {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <div className="ml-auto text-xs text-gray-500">
          영상 촬영용: 지난 7일 실행 로그를 한 번에 생성
        </div>
      </div>

      <div className="card p-4 flex gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={seed70}>7일 · 성공률 70% 랜덤</button>
        <button className="btn btn-ghost" onClick={seedPattern}>7일 · 고정 패턴</button>
        <button className="btn btn-outline" onClick={wipe}>이 프로그램 로그 삭제</button>
      </div>

      <div className="card p-4 text-sm text-gray-600">
        시드 후{" "}
        <a className="link" onClick={()=>router.push(`/today?program=${programId}`)}>오늘</a> /
        <a className="link ml-2" onClick={()=>router.push(`/trend`)}>추세</a>{" "}
        페이지에서 결과 확인.
      </div>
    </div>
  );
}