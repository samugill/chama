export const dynamic = "force-dynamic"; // 정적 프리렌더 회피 (URL 의존)

import { Suspense } from "react";
import DemoSeedInner from "./seed.client";

export default function DemoSeedPage() {
  return (
    <Suspense fallback={<div className="card p-6">불러오는 중…</div>}>
      <DemoSeedInner />
    </Suspense>
  );
}