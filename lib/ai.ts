import { getUserPlan } from "@/lib/storage"; // ★ 티어 확인

export const METHOD_POOLS: Record<string, string[]> = {
  // ... 기존 풀들(야식/숏폼/게임/과소비/기본) ...
};

export function intensify(method: string, strength: 1|2|3): string {
  if (strength === 1) return method;
  if (strength === 2) return method.replace("30분","45분").replace("15분","20분");
  return method.replace("30분","60분").replace("15분","30분").replace("24시간","48시간");
}

export function pickPool(keyword: string): string[] {
  const k = (keyword || "").toLowerCase();
  if (k.includes("야식") || k.includes("밤") || k.includes("배달")) return METHOD_POOLS["야식"];
  if (k.includes("숏폼") || k.includes("틱톡") || k.includes("릴스") || k.includes("short")) return METHOD_POOLS["숏폼"];
  if (k.includes("게임")) return METHOD_POOLS["게임"];
  if (k.includes("과소비") || k.includes("쇼핑")) return METHOD_POOLS["과소비"];
  return METHOD_POOLS["기본"];
}

function takeNLoop(arr: string[], n: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (out.length < n) { out.push(arr[i % arr.length]); i++; }
  return out;
}

/** 티어에 따라 고유 방법 수 제한: standard=3, premium=7 */
export function buildWeeklyPlan(keyword: string, days: number, strength: 1|2|3): string[] {
  const tier = getUserPlan().tier; // "standard" | "premium"
  const maxUnique = tier === "premium" ? 7 : 3;      // ★ 여기서 분기
  const pool = pickPool(keyword).slice(0, 7);        // 원천 최대 7개
  const unique = pool.slice(0, maxUnique).map(m => intensify(m, strength));
  return takeNLoop(unique, days);                     // 부족하면 순환 채움
}
