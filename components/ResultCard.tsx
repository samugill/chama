"use client";
import { useEffect, useMemo, useState } from "react";
import ShareButton from "./ShareButton";
import { getDraft, saveRoutine, addLog } from "@/lib/storage";
import type { Routine } from "@/lib/storage";
import type { SharePayload } from "@/lib/share";

export default function ResultCard() {
  const [r, setR] = useState<Routine | null>(null);
  const [leftSec, setLeftSec] = useState(0);

  useEffect(() => {
    const d = getDraft();
    setR(d);
    if (d) setLeftSec(d.minutes * 60);
  }, []);

  useEffect(() => {
    if (!leftSec) return;
    const t = setInterval(() => setLeftSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [leftSec]);

  const mmss = useMemo(() => {
    const m = Math.floor(leftSec / 60).toString().padStart(2, "0");
    const s = (leftSec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [leftSec]);

  if (!r) {
    return <div className="card p-6">생성된 결과가 없어요. 먼저 “방법 생성”에서 루틴을 만들어 주세요.</div>;
  }

  const payload: SharePayload = {
    title: r.title,
    keyword: r.keyword,
    minutes: r.minutes,
    strength: r.strength,
    steps: r.steps,
    createdAt: r.createdAt,
  };

  const onSuccess = () => {
    addLog({ id: r.id, ts: Date.now(), status: "success" });
    alert("굿! 성공으로 기록했어요 🎉");
  };
  const onFail = () => {
    addLog({ id: r.id, ts: Date.now(), status: "fail" });
    alert("다음에는 더 잘할 수 있어요. 기록했어요.");
  };

  return (
    <div className="card p-6 space-y-4">
      <div>
        <div className="h2">{r.title}</div>
        <p className="text-gray-600 text-sm mt-1">키워드: {r.keyword} · 강도 {r.strength} · {r.minutes}분</p>
      </div>

      <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-1">
        {r.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
        <span className="font-mono">{mmss}</span>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setLeftSec(r.minutes * 60)}>리셋</button>
          <button className="btn btn-primary" onClick={onSuccess}>완료</button>
          <button className="btn btn-ghost" onClick={onFail}>포기</button>
        </div>
      </div>

      <ShareButton payload={payload} />

      <button
        className="btn btn-ghost w-full"
        onClick={() => { saveRoutine(r as any); alert("내 루틴에 저장했어요!"); }}
      >
        내 루틴에 저장
      </button>
    </div>
  );
}
