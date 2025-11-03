// lib/ai.ts (안전판 적용본)

import { getUserPlan } from "@/lib/storage";

export const METHOD_POOLS: Record<string, string[]> = {
  "야식": [/* ... */],
  "숏폼": [/* ... */],
  "게임": [/* ... */],
  "과소비": [/* ... */],
  // ★ 반드시 존재해야 함
  "기본": [
    "물 마시고 2분 걷기",
    "포모도로 25분",
    "방해 알림 모두 끄기",
    "대체 행동 1개 준비",
    "시작 선언 메모",
    "짧은 휴식 후 재개",
    "주간 회고",
  ],
};

export function intensify(m: string, s: 1|2|3): string {
  if (s === 1) return m;
  if (s === 2) return m.replace("30분","45분").replace("15분","20분");
  return m.replace("30분","60분").replace("15분","30분").replace("24시간","48시간");
}

export function pickPool(keyword: string): string[] {
  const k = (keyword || "").toLowerCase();
  if (k.includes("야식") || k.includes("밤") || k.includes("배달")) return METHOD_POOLS["야식"];
  if (k.includes("숏폼") || k.includes("틱톡") || k.includes("릴스") || k.includes("short")) return METHOD_POOLS["숏폼"];
  if (k.includes("게임")) return METHOD_POOLS["게임"];
  if (k.includes("과소비") || k.includes("쇼핑")) return METHOD_POOLS["과소비"];
  return METHOD_POOLS["기본"];
}

// 안전 보조
function takeNLoop(arr: string[], n: number): string[] {
  const src = Array.isArray(arr) && arr.length ? arr : ["시작 선언 메모"];
  const out: string[] = [];
  let i = 0;
  while (out.length < n) { out.push(src[i % src.length]); i++; }
  return out;
}

/** 티어에 따라 고유 방법 수 제한: standard=3, premium=7 (안전 가드 포함) */
export function buildWeeklyPlan(keyword: string, days: number, strength: 1|2|3): string[] {
  const tier = getUserPlan().tier;
  const maxUnique = tier === "premium" ? 7 : 3;

  const pool0 = pickPool(keyword);
  const pool = Array.isArray(pool0) ? pool0.slice(0, 7) : METHOD_POOLS["기본"].slice(0, 7);

  const unique = (pool.length ? pool : METHOD_POOLS["기본"])
    .slice(0, maxUnique)
    .map(m => intensify(m, strength));

  return takeNLoop(unique, Math.max(1, Number.isFinite(days as any) ? days : 7));
}