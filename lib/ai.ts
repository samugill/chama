// 유혹별 방법 풀(pool)
export const METHOD_POOLS: Record<string, string[]> = {
  "야식": [
    "물 500ml 마시기", "다음 날 아침으로 미루기", "요거트/프로틴으로 대체",
    "배달앱 알림 24시간 끄기", "양치 후 취침 준비", "가벼운 산책 10분",
    "저녁 탄수 비율↓ 단백질/샐러드↑"
  ],
  "숏폼": [
    "폰을 다른 방에 30분", "집중 모드+SNS 알림 차단", "팟캐스트/음악만 듣기",
    "앱 제한 15분", "시청 전 목표 1개 완료", "보상 지연(오늘 스킵, 내일 10분)",
    "수면 1시간 전 스크린 차단"
  ],
  "게임": [
    "접속 보상만 받고 종료", "플레이 전 푸쉬업 10회", "타이머 30분 후 종료",
    "초대/길드 알림 24시간 끄기", "대체: 퍼즐/독서 10분", "자정 이후 접속 금지",
    "내일 계획 세우고 오늘 종료"
  ],
  "과소비": [
    "장바구니만 담고 24시간 보류", "지출 한도 미리 적기", "위시리스트만 관리",
    "쇼핑앱 로그아웃", "최저가 비교만 하고 닫기", "현금만 사용",
    "구매 전 이유 3가지 적기"
  ],
  "기본": [
    "물 마시고 2분 걷기", "포모도로 25분", "방해 알림 모두 끄기",
    "대체 행동 1개 준비", "시작 선언 메모", "짧은 휴식 후 재개", "주간 회고"
  ]
};

// 강도에 따라 약간 조정(예: 시간/제한 강화)
export function intensify(method: string, strength: 1|2|3): string {
  if (strength === 1) return method;
  if (strength === 2) return method.replace("30분", "45분").replace("15분", "20분");
  return method
    .replace("30분", "60분")
    .replace("15분", "30분")
    .replace("24시간", "48시간");
}

// 유혹 키워드 → 풀 선택
export function pickPool(keyword: string): string[] {
  const k = (keyword || "").toLowerCase();
  if (k.includes("야식") || k.includes("밤") || k.includes("배달")) return METHOD_POOLS["야식"];
  if (k.includes("숏폼") || k.includes("틱톡") || k.includes("릴스") || k.includes("short")) return METHOD_POOLS["숏폼"];
  if (k.includes("게임")) return METHOD_POOLS["게임"];
  if (k.includes("과소비") || k.includes("쇼핑")) return METHOD_POOLS["과소비"];
  return METHOD_POOLS["기본"];
}

// N개 고유 샘플링(풀 길이 < N이면 중복 허용해서 채움)
export function buildWeeklyPlan(keyword: string, days: number, strength: 1|2|3): string[] {
  const pool = pickPool(keyword).slice();
  const out: string[] = [];
  while (out.length < days) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(intensify(pool[i], strength));
    if (pool.length > 1) pool.splice(i, 1); // 중복 방지
    if (pool.length === 0) pool.push(...pickPool(keyword)); // 바닥나면 다시 채움
  }
  return out;
}
