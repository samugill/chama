"use client";
import TrendChart from "@/components/TrendChart";
import { getLogs } from "@/lib/storage";

export default function TrendPage() {
  const logs = getLogs();
  return (
    <div className="space-y-6">
      <h1 className="h1">추세</h1>
      <TrendChart logs={logs} />
      <ul className="text-sm text-gray-600 list-disc pl-5">
        <li>성공률/연속일수는 LocalStorage 로그 기준</li>
        <li>Premium에서 더 상세한 분석을 제공합니다 (데모 문구)</li>
      </ul>
    </div>
  );
}
