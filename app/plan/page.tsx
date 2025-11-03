// app/plan/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import PlanForm from "@/components/PlanForm";

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="card p-6">불러오는 중…</div>}>
      <PlanForm />
    </Suspense>
  );
}
