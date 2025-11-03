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
