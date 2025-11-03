// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLastProgramId, getUserPlan, setUserPlan, type UserPlanTier } from "@/lib/storage";

export default function Navbar() {
  const [lastId, setLastId] = useState<string | null>(null);
  const [tier, setTier] = useState<UserPlanTier>("standard");

  useEffect(() => {
    setLastId(getLastProgramId());
    setTier(getUserPlan().tier);
  }, []);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="font-semibold">CHAMA?!</Link>

        <nav className="flex gap-4 text-sm">
          <Link href="/pricing">요금제</Link>
          <Link href="/plan">방법 생성</Link>
          <Link href={lastId ? `/today?program=${lastId}` : "/today"}>오늘</Link>
          <Link href="/trend">추세</Link>
          <Link href="/login">로그인</Link>
        </nav>

        {/* 제출용: 배지만 표시 (토글 유지하고 싶으면 onClick 그대로 두세요) */}
        <button
          className={`text-xs px-2 py-1 rounded-lg ${tier === "premium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}
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