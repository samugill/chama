"use client";
import type { LogItem } from "@/lib/storage";

export default function TrendChart({ logs }: { logs: LogItem[] }) {
  const total = logs.length;
  const success = logs.filter(l=>l.status==="success").length;
  const rate = total ? Math.round((success/total)*100) : 0;

  // 연속 성공일수 계산(간단 버전: 최근부터 success 연속 카운트)
  let streak = 0;
  for (const l of logs) {
    if (l.status === "success") streak++;
    else break;
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-semibold">{total}</div>
          <div className="text-xs text-gray-600">전체 시도</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{rate}%</div>
          <div className="text-xs text-gray-600">성공률</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{streak}</div>
          <div className="text-xs text-gray-600">연속 성공</div>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        자세한 차트는 Premium에서 제공될 예정입니다.
      </div>
    </div>
  );
}
