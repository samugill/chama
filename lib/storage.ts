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

const K = {
  plan: "chama.plan",
  draft: "chama.draft",
  routines: "chama.routines",
  logs: "chama.logs",
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

// 요금제
export function getPlan(): "standard" | "premium" {
  return read(K.plan, "standard");
}
export function setPlan(p: "standard" | "premium") {
  write(K.plan, p);
}

// 드래프트(방금 생성한 결과 임시 저장)
export function saveDraft(r: Routine) {
  write(K.draft, r);
}
export function getDraft(): Routine | null {
  return read< Routine | null >(K.draft, null);
}

// 루틴 목록
export function getRoutines(): Routine[] {
  return read<Routine[]>(K.routines, []);
}
export function saveRoutine(r: Routine) {
  const arr = getRoutines();
  const idx = arr.findIndex((x) => x.id === r.id);
  if (idx >= 0) arr[idx] = r; else arr.unshift(r);
  write(K.routines, arr);
}
export function importRoutine(r: Routine) {
  saveRoutine(r);
  saveDraft(r);
}

// 로그(추세)
export function addLog(item: LogItem) {
  const arr = read<LogItem[]>(K.logs, []);
  arr.unshift(item);
  write(K.logs, arr);
}
export function getLogs(): LogItem[] {
  return read<LogItem[]>(K.logs, []);
}
// --- NEW TYPES ---
export type DayTask = {
  dayIndex: number;        // 0~6 (시작일 기준 D+0..D+6)
  label: string;           // 월/화/... 또는 Day 1
  method: string;          // 오늘 실천할 방법
};

export type Program = {
  id: string;
  keyword: string;
  title: string;           // 예: 야식 유혹 7일 프로그램
  minutes: number;         // 권장 타이머(분)
  strength: 1|2|3;
  startDate: string;       // yyyy-mm-dd
  days: DayTask[];         // 7개
  createdAt: number;
  finishedAt?: number;
};

export type DailyLog = {
  programId: string;
  dayIndex: number;
  ts: number;
  status: "success"|"fail";
};

// --- NEW KEYS ---
const K2 = {
  programs: "chama.programs",
  dailyLogs: "chama.dailyLogs",
};

// --- PROGRAM CRUD ---
export function getPrograms(): Program[] {
  return read<Program[]>(K2.programs, []);
}
export function saveProgram(p: Program) {
  const arr = getPrograms();
  const idx = arr.findIndex(x => x.id === p.id);
  if (idx >= 0) arr[idx] = p; else arr.unshift(p);
  write(K2.programs, arr);
}
export function getProgram(id: string): Program | null {
  return getPrograms().find(p => p.id === id) || null;
}

// --- DAILY LOG ---
export function addDailyLog(log: DailyLog) {
  const arr = read<DailyLog[]>(K2.dailyLogs, []);
  // 중복 기록 방지: 같은 programId+dayIndex 최근 것만 유지
  const filtered = arr.filter(l => !(l.programId===log.programId && l.dayIndex===log.dayIndex));
  filtered.unshift(log);
  write(K2.dailyLogs, filtered);
}
export function getDailyLogs(programId?: string): DailyLog[] {
  const arr = read<DailyLog[]>(K2.dailyLogs, []);
  return programId ? arr.filter(l => l.programId === programId) : arr;
}
