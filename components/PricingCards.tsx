"use client";
import { getPlan, setPlan } from "@/lib/storage";

export default function PricingCards() {
  const plan = getPlan();
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className={`card p-5 ${plan==="standard" ? "ring-2 ring-black":""}`}>
        <div className="text-xs text-gray-500 mb-1">Standard</div>
        <div className="h2 mb-1">₩0</div>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li>기본 방법 생성</li>
          <li>단일 루틴 저장</li>
          <li>간단한 추세</li>
        </ul>
        <button className="btn btn-ghost w-full" onClick={() => setPlan("standard")}>
          선택
        </button>
      </div>

      <div className={`card p-5 ${plan==="premium" ? "ring-2 ring-black":""}`}>
        <div className="text-xs text-white inline-block bg-black rounded-full px-2 py-0.5 mb-1">추천</div>
        <div className="h2 mb-1">₩4,900/월</div>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li>다중 루틴</li>
          <li>고급 통계/연속 기록</li>
          <li>고급 AI 팁/알림</li>
        </ul>
        <button className="btn btn-primary w-full" onClick={() => setPlan("premium")}>
          선택
        </button>
      </div>
    </div>
  );
}
