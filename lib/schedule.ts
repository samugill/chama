import { Program, DayTask } from "./storage";

export const weekday = ["월","화","수","목","금","토","일"];

export function makeProgramFromMethods(
  keyword: string,
  minutes: number,
  strength: 1|2|3,
  methods: string[],
  start = new Date()
): Program {
  const days = methods.length;
  const startDate = toYMD(start);
  const dayTasks: DayTask[] = methods.map((m, i) => ({
    dayIndex: i,
    label: weekday[(start.getDay() + i + 6) % 7] ?? `Day ${i+1}`,
    method: m
  }));
  return {
    id: crypto.randomUUID(),
    keyword,
    title: `${keyword} ${days}일 프로그램`,
    minutes,
    strength,
    startDate,
    days: dayTasks,
    createdAt: Date.now()
  };
}

export function toYMD(d: Date) {
  const m = (d.getMonth()+1).toString().padStart(2,"0");
  const day = d.getDate().toString().padStart(2,"0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayIndex(p: Program, now = new Date()): number {
  const s = new Date(p.startDate+"T00:00:00");
  const diff = Math.floor((+now - +s) / (1000*60*60*24));
  return Math.max(0, Math.min(diff, p.days.length - 1));
}
