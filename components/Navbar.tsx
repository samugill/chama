"use client";
import Link from "next/link";
import { getPlan, setPlan } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [plan, update] = useState<string>(getPlan());

  useEffect(() => {
    const i = setInterval(() => update(getPlan()), 500);
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
        <button
          className="text-xs text-gray-500"
          onClick={() => {
            const next = plan === "premium" ? "standard" : "premium";
            setPlan(next as any);
            update(next);
          }}
          title="요금제 토글(데모)"
        >
          {plan.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
