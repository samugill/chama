"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import { decodeShare } from "@/lib/share";
import { importRoutine } from "@/lib/storage";

export default function ResultPage() {
  const sp = useSearchParams();
  const token = sp.get("share");
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const incoming = useMemo(() => {
    if (!token) return null;
    return decodeShare(token);
  }, [token]);

  useEffect(() => {
    if (!incoming) return;
    setImportMsg(`“${incoming.title}” 루틴을 가져올 수 있어요.`);
  }, [incoming]);

  const handleImport = () => {
    if (!incoming) return;
    const r = {
      id: crypto.randomUUID(),
      title: incoming.title,
      keyword: incoming.keyword,
      minutes: incoming.minutes,
      strength: incoming.strength,
      steps: incoming.steps,
      createdAt: Date.now(),
    };
    importRoutine(r);
    setImportMsg("가져오기 완료! 내 결과 카드에 반영됐어요.");
  };

  return (
    <div className="space-y-6">
      <h1 className="h1">결과</h1>

      {importMsg && incoming && (
        <div className="card p-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">{importMsg}</div>
          <button className="btn btn-primary" onClick={handleImport}>가져오기</button>
        </div>
      )}

      <ResultCard />
    </div>
  );
}
