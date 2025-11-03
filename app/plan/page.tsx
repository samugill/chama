"use client";
import PlanForm from "@/components/PlanForm";
export const dynamic = "force-dynamic";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <h1 className="h1">방법 생성</h1>
      <PlanForm />
    </div>
  );
}
