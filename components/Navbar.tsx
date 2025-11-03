"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getLastProgramId,
  getUserPlan,
  setUserPlan,
  type UserPlanTier,
} from "@/lib/storage";

export default function Navbar() {
  const [lastId, setLastId] = useState<string | null>(null);
  const [tier, setTier] = useState<UserPlanTier>("standard");

  useEffect(() => {
    setLastId(getLastProgramId());
    setTier(getUserPlan().tier);

    // ✅ 요금제 변경 실시간 반영
    const interval = setInterval(() => {
      const newTier = getUserPlan().tier;
      if (newTier !== tier) setTier(newTier);
    }, 500);
    return () => clearInterval(interval);
  }, [tier]);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-3">
        {/* ① 여기: shrink-0 추가 */}
        <Link href="/" className="font-semibold shrink-0">
          CHAMA?!
        </Link>

        {/* ② 여기: 줄바꿈 방지 + 가로 스크롤 유틸 추가 */}
        <nav className="flex items-center gap-3 text-sm whitespace-nowrap overflow-x-auto">
          <Link href="/pricing">요금제</Link>
          <Link href="/plan">방법 생성</Link>
          <Link href={lastId ? `/today?program=${lastId}` : "/today"}>오늘</Link>
          <Link href="/trend">추세</Link>
          <Link href="/login">로그인</Link>
        </nav>

        {/* 우측 상단 요금제 배지 */}
        <button
          className={`text-xs px-2 py-1 rounded-lg ${
            tier === "premium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => {
            const next: UserPlanTier = tier === "premium" ? "standard" : "premium";
            setUserPlan(next);
            setTier(next);
          }}
          title="요금제 토글(데모)"
        >
          {tier === "premium" ? "💎 PREMIUM" : "STANDARD"}
        </button>
      </div>
    </header>
  );
}