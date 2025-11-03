"use client";
import PricingCards from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <h1 className="h1">요금제</h1>
      <PricingCards />
      <p className="text-gray-500 text-sm">
        목표를 모두 달성하면 Premium 결제는 전액 환불됩니다. (MVP: 데모 처리)
      </p>
    </div>
  );
}
