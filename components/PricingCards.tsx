"use client";
import { getUserPlan, setUserPlan } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function PricingCards() {
  const [tier, setTier] = useState(getUserPlan().tier);

  useEffect(() => {
    // 다른 탭/페이지에서 바뀌어도 반영
    const i = setInterval(() => setTier(getUserPlan().tier), 500);
    return () => clearInterval(i);
  }, []);

  const select = (t: "standard" | "premium") => {
    setUserPlan(t);
    setTier(t);
    alert(`${t === "premium" ? "Premium" : "Standard"} 요금제가 적용되었습니다.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className={`card p-5 ${tier==="standard" ? "ring-2 ring-gray-900":""}`}>
        <div className="text-xs text-gray-500 mb-1">Standard</div>
        <div className="h2 mb-1">₩0</div>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li>루틴/프로그램 최대 1개</li>
          <li>기본 추천(3개)</li>
          <li>최근 7일 간단 통계</li>
        </ul>
        <button className="btn btn-ghost w-full" onClick={() => select("standard")}>
          선택
        </button>
      </div>

      <div className={`card p-5 ${tier==="premium" ? "ring-2 ring-yellow-400":""}`}>
        <div className="text-xs text-white inline-block bg-yellow-500 rounded-full px-2 py-0.5 mb-1">추천</div>
        <div className="h2 mb-1">₩4,900/월</div>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li>루틴/프로그램 무제한</li>
          <li>AI 고급 추천(7개) + 자동 조합</li>
          <li>연속 성공률/시간대 분석</li>
          <li>목표 달성 시 환불</li>
        </ul>
        <button className="btn btn-primary w-full" onClick={() => select("premium")}>
          업그레이드
        </button>
      </div>
    </div>
  );
}
