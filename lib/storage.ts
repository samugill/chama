// lib/storage.ts  (전체 교체본)

export type Routine = {
  id: string;
  title: string;
  keyword: string;
  minutes: number;
  strength: 1 | 2 | 3;
  steps: string[];
  createdAt: number;
};

export type LogItem = {
  id: string;
  ts: number;
  status: "success" | "fail";
};

// --- 요금제(추가) ---
export type UserPlanTier = "standard" | "premium";
export type UserPlan = { tier: UserPlanTier };

const K = {
  plan: "chama.plan",
  draft: "chama.draft",
  routines: "chama.routines",
  logs: "chama.logs",
  // 프로그램(주간 플랜)용 키들 (이미 쓰고 있다면 유지)
  programs: "chama.programs",
  dailyLogs: "chama.dailyLogs",
  lastProgramId: "chama.lastProgramId",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
}

// === 요금제 API ===
export function getUserPlan(): UserPlan {
  return read<UserPlan>(K.plan, { tier: "standard" });
}
export function setUserPlan(tier: UserPlanTier) {
  write<UserPlan>(K.plan, { tier });
}

// === 드래프트/루틴/로그(기존) ===
export function saveDraft(r: Routine) { write(K.draft, r); }
export function getDraft(): Routine | null { return read<Routine | null>(K.draft, null); }

export function getRoutines(): Routine[] { return read<Routine[]>(K.routines, []); }

// ★ 요금제 제한 적용: Standard는 루틴 1개만 저장
export function saveRoutine(r: Routine) {
  const tier = getUserPlan().tier;
  const arr = getRoutines();
  if (tier === "standard") {
    // 이미 1개가 있으면 막기
    const has = arr.length >= 1 && !arr.find(x => x.id === r.id);
    if (has) {
      alert("Standard 요금제에서는 루틴을 1개만 저장할 수 있습니다. Premium으로 업그레이드해주세요!");
      return;
    }
  }
  const idx = arr.findIndex(x => x.id === r.id);
  if (idx >= 0) arr[idx] = r; else arr.unshift(r);
  write(K.routines, arr);
}
export function setLastProgramId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(K.lastProgramId, id);
}
export function getLastProgramId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(K.lastProgramId);
}
export function addLog(item: LogItem) {
  const arr = read<LogItem[]>(K.logs, []);
  arr.unshift(item);
  write(K.logs, arr);
}
export function getLogs(): LogItem[] { return read<LogItem[]>(K.logs, []); }

// === 프로그램/일일로그(사용 중이면 그대로) ===
export type DayTask = { dayIndex: number; label: string; method: string; };
export type Program = {
  id: string; keyword: string; title: string; minutes: number; strength: 1|2|3;
  startDate: string; days: DayTask[]; createdAt: number; finishedAt?: number;
};
export type DailyLog = { programId: string; dayIndex: number; ts: number; status: "success"|"fail" };

export function getPrograms(): Program[] { return read<Program[]>(K.programs, []); }
export function saveProgram(p: Program) {
  const tier = getUserPlan().tier;
  const arr = getPrograms();
  if (tier === "standard") {
    const creatingNew = !arr.find(x => x.id === p.id);
    if (creatingNew && arr.length >= 1) {
      alert("Standard 요금제에서는 프로그램을 1개만 생성할 수 있습니다. Premium으로 업그레이드해주세요!");
      return;
    }
  }
  const idx = arr.findIndex(x => x.id === p.id);
  if (idx >= 0) arr[idx] = p; else arr.unshift(p);
  write(K.programs, arr);
  setLastProgramId(p.id);
}
export function getProgram(id: string): Program | null {
  return getPrograms().find(p => p.id === id) || null;
}

export function addDailyLog(log: DailyLog) {
  const arr = read<DailyLog[]>(K.dailyLogs, []);
  const filtered = arr.filter(l => !(l.programId === log.programId && l.dayIndex === log.dayIndex));
  filtered.unshift(log);
  write(K.dailyLogs, filtered);
}
export function getDailyLogs(programId?: string): DailyLog[] {
  const arr = read<DailyLog[]>(K.dailyLogs, []);
  return programId ? arr.filter(l => l.programId === programId) : arr;
}






// lib/storage.ts (하단 아무 데나 추가)

export function seedDailyLogsForDemo(opts: {
  programId: string;
  startISO?: string;       // 프로그램 시작일(없으면 프로그램의 startDate 사용)
  days?: number;           // 기본 7
  pattern?: ("success"|"fail")[]; // 없으면 successRate로 랜덤
  successRate?: number;    // 0~1 (기본 0.7)
}) {
  const { programId, days = 7 } = opts;
  const p = getProgram(programId);
  if (!p) throw new Error("프로그램을 찾을 수 없습니다.");

  const start = new Date(opts.startISO || p.startDate);
  const successRate = typeof opts.successRate === "number" ? opts.successRate : 0.7;

  // 기존 로그 제거(같은 programId)
  const prev = getDailyLogs().filter(l => l.programId !== programId);

  const logs: DailyLog[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const ts = new Date(
      d.getFullYear(), d.getMonth(), d.getDate(),
      21, 0, 0, 0 // 밤 9시쯤 기록으로 고정(영상에서 보기 좋게)
    ).getTime();

    const status = opts.pattern?.[i] ||
      (Math.random() < successRate ? "success" : "fail");

    logs.push({ programId, dayIndex: i, ts, status });
  }

  // 저장
  if (typeof window !== "undefined") {
    localStorage.setItem("chama.dailyLogs", JSON.stringify([...logs, ...prev]));
  }
}

export function clearDailyLogs(programId?: string) {
  const all = getDailyLogs();
  const filtered = programId ? all.filter(l => l.programId !== programId) : [];
  if (typeof window !== "undefined") {
    localStorage.setItem("chama.dailyLogs", JSON.stringify(filtered));
  }
}