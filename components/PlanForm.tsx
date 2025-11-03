"use client";
import { useMemo, useState } from "react";
import { saveProgram } from "@/lib/storage";
import { makeProgramFromMethods } from "@/lib/schedule";
import { buildWeeklyPlan, METHOD_POOLS } from "@/lib/ai";
import { useRouter } from "next/navigation";

const PRESETS = ["야식", "숏폼", "게임", "과소비", "기본"];

export default function PlanForm() {
  const [keyword, setKeyword] = useState("야식");
  const [time, setTime] = useState(30);
  const [strength, setStrength] = useState<1|2|3>(2);
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [customMethods, setCustomMethods] = useState<string>(""); // 줄바꿈으로 사용자 커스텀 풀 입력
  const [preview, setPreview] = useState<string[]>([]);
  const router = useRouter();

  // 유혹 선택 시 기본 풀 힌트
  const hintPool = useMemo(() => {
    const key = PRESETS.includes(keyword) ? keyword : "기본";
    return METHOD_POOLS[key] || METHOD_POOLS["기본"];
  }, [keyword]);

  const genPreview = () => {
    // 커스텀 풀 입력이 있으면 우선 사용
    const custom = customMethods
      .split("\n")
      .map(s=>s.trim())
      .filter(Boolean);

    const plan = custom.length >= 2
      ? takeNLoop(custom, days).map((m,i)=>decorate(m, strength))
      : buildWeeklyPlan(keyword, days, strength);

    setPreview(plan);
  };

  const onStart = () => {
    const methods = preview.length ? preview : buildWeeklyPlan(keyword, days, strength);
    const program = makeProgramFromMethods(keyword, time, strength, methods, new Date(startDate));
    saveProgram(program);
    router.push(`/today?program=${program.id}`);
  };

  return (
    <div className="card p-6 space-y-4">
      {/* 1) 유혹 입력/선택 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">유혹(키워드)</label>
          <input className="input" value={keyword} onChange={e=>setKeyword(e.target.value)} list="tempts" />
          <datalist id="tempts">
            {PRESETS.map(p=><option key={p} value={p} />)}
          </datalist>
        </div>
        <div>
          <label className="label">강도(1~3)</label>
          <input type="number" min={1} max={3} className="input" value={strength}
                 onChange={e=>setStrength(Math.min(3, Math.max(1, Number(e.target.value)||2)) as 1|2|3)} />
        </div>
      </div>

      {/* 2) 기간/시작일/시간 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">기간(일)</label>
          <input type="number" min={3} max={30} className="input" value={days}
                 onChange={e=>setDays(Math.max(3, Math.min(30, Number(e.target.value)||7)))} />
        </div>
        <div>
          <label className="label">시작일</label>
          <input type="date" className="input" value={startDate}
                 onChange={e=>setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">권장 시간(분)</label>
          <input type="number" min={5} max={180} className="input" value={time}
                 onChange={e=>setTime(parseInt(e.target.value||"0")||30)} />
        </div>
      </div>

      {/* 3) (선택) 커스텀 방법 풀 */}
      <div>
        <label className="label">커스텀 방법 풀(선택, 줄바꿈으로 여러 개)</label>
        <textarea className="input h-28" placeholder="예)\n물 500ml 마시기\n배달앱 알림 끄기\n요거트로 대체"
                  value={customMethods} onChange={e=>setCustomMethods(e.target.value)} />
        <p className="text-xs text-gray-500 mt-1">입력 시 해당 목록에서 {days}개를 고유/순환으로 편성합니다.</p>
      </div>

      {/* 4) 미리보기 & 시작 */}
      <div className="flex gap-2">
        <button className="btn btn-ghost" onClick={genPreview}>미리보기 생성</button>
        <button className="btn btn-primary" onClick={onStart}>프로그램 시작</button>
      </div>

      {/* 5) 힌트 풀 & 미리보기 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="h2 mb-2">추천 힌트({PRESETS.includes(keyword)?keyword:"기본"})</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {hintPool.map((m,i)=><li key={i}>{m}</li>)}
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="h2 mb-2">주간 미리보기</div>
          {preview.length === 0
            ? <p className="text-sm text-gray-600">미리보기 생성 버튼을 눌러 주세요.</p>
            : <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-1">
                {preview.map((m,i)=><li key={i}>{m}</li>)}
              </ol>}
        </div>
      </div>
    </div>
  );
}

// 보조
function takeNLoop(arr: string[], n: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (out.length < n) { out.push(arr[i % arr.length]); i++; }
  return out;
}
function decorate(m: string, strength: 1|2|3) {
  // 강도에 따라 간단 가중(같은 규칙을 intensify와 동일하게)
  if (strength === 1) return m;
  if (strength === 2) return m.replace("30분","45분").replace("15분","20분");
  return m.replace("30분","60분").replace("15분","30분").replace("24시간","48시간");
}
