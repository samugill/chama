"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserPlan, setUserPlan, type UserPlanTier } from "@/lib/storage";

export default function Navbar() {
  const [tier, setTier] = useState<UserPlanTier>(getUserPlan().tier);

  useEffect(() => {
    const i = setInterval(() => setTier(getUserPlan().tier), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="font-semibold">CHAMA?!</Link>

        <nav className="flex gap-4 text-sm">
          <Link href="/pricing">요금제</Link>
          <Link href="/plan">방법 생성</Link>
          <Link href="/today">오늘</Link>
          <Link href="/trend">추세</Link>
          <Link href="/login">로그인</Link>
        </nav>

        {/* 데모 토글: 제출용으로는 표시만 하고 토글 비활성화해도 됨 */}
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
