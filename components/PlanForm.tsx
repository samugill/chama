"use client";
import { useEffect, useMemo, useState } from "react";
import { saveProgram, getUserPlan } from "@/lib/storage";
import { makeProgramFromMethods } from "@/lib/schedule";
import { buildWeeklyPlan, METHOD_POOLS } from "@/lib/ai";
import { useRouter } from "next/navigation";

const PRESETS = ["야식", "숏폼", "게임", "과소비", "기본"] as const;
type Tier = "standard" | "premium";
type Strength = 1 | 2 | 3;

export default function PlanForm() {
  const [keyword, setKeyword] = useState(() => localStorage.getItem("chama.lastKeyword") || "");
  const [time, setTime] = useState(30);
  const [strength, setStrength] = useState<Strength>(2);
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [customMethods, setCustomMethods] = useState<string>("");
  const [preview, setPreview] = useState<string[]>([]);
  const [tier, setTier] = useState<Tier>("standard");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // 클라이언트 마운트 후 localStorage 접근 (수화 안정)
  useEffect(() => {
    try {
      setTier(getUserPlan().tier);
    } finally {
      setMounted(true);
    }
  }, []);

  const maxUnique = tier === "premium" ? 7 : 3;

  // 유혹 선택 시 기본 풀 힌트 (안전가드 포함)
  const hintPool = useMemo(() => {
    const key = (PRESETS as unknown as string[]).includes(keyword) ? keyword : "기본";
    return (METHOD_POOLS?.[key] || METHOD_POOLS?.["기본"] || []) as string[];
  }, [keyword]);

  const genPreview = () => {
    try {
      // 입력 검증
      if (!keyword.trim()) throw new Error("유혹(키워드)을 입력해 주세요.");
      if (!Number.isFinite(days as unknown as number) || days < 1)
        throw new Error("기간(일) 값이 올바르지 않습니다.");

      const custom = customMethods
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (custom.length >= 2) {
        // 커스텀 풀도 티어 제한 적용
        const limited = custom.slice(0, maxUnique).map((m) => decorate(m, strength));
        setPreview(takeNLoop(limited, days));
      } else {
        // 기본 추천은 내부에서 티어 제한(Std=3/Prem=7)
        setPreview(buildWeeklyPlan(keyword, days, strength));
      }
    } catch (e: any) {
      console.error(e);
      alert(`미리보기 오류: ${e?.message || e}`);
    }
  };

  const onStart = () => {
    try {
      if (!startDate) throw new Error("시작일을 선택해 주세요.");

      // 미리보기 있으면 사용, 없으면 동일 규칙으로 생성
      let methods =
        preview.length > 0 ? preview : buildWeeklyPlan(keyword, days, strength);

      // 안전장치: 혹시라도 미리보기가 제한을 안 탔다면 여기서도 한 번 더
      methods = takeNLoop(methods.slice(0, maxUnique), days);

      const program = makeProgramFromMethods(
        keyword,
        clampInt(time, 5, 180) || 30,
        strength,
        methods,
        new Date(startDate)
      );
      saveProgram(program);
      router.push(`/today?program=${program.id}`);
    } catch (e: any) {
      console.error(e);
      alert(`프로그램 시작 오류: ${e?.message || e}`);
    }
  };

  if (!mounted) {
    return <div className="card p-6">불러오는 중…</div>;
  }

  return (
    <div className="card p-6 space-y-4">
      {/* 현재 요금제 표시 */}
      <div className="text-xs text-right">
        현재 요금제: {tier === "premium" ? "💎 Premium" : "Standard"} (고유 방법 {maxUnique}개)
      </div>

      {/* 1) 유혹 입력/선택 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">유혹(키워드)</label>
          <input
            className="input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            list="tempts"
          />
          <datalist id="tempts">
            {Array.from(PRESETS).map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">강도(1~3)</label>
          <input
            type="number"
            min={1}
            max={3}
            className="input"
            value={strength}
            onChange={(e) =>
              setStrength(
                clampInt(Number(e.target.value) || 2, 1, 3) as Strength
              )
            }
          />
        </div>
      </div>

      {/* 2) 기간/시작일/시간 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">기간(일)</label>
          <input
            type="number"
            min={3}
            max={30}
            className="input"
            value={days}
            onChange={(e) => setDays(clampInt(Number(e.target.value) || 7, 3, 30))}
          />
        </div>
        <div>
          <label className="label">시작일</label>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">권장 시간(분)</label>
          <input
            type="number"
            min={5}
            max={180}
            className="input"
            value={time}
            onChange={(e) => setTime(clampInt(Number(e.target.value) || 30, 5, 180))}
          />
        </div>
      </div>

      {/* 3) (선택) 커스텀 방법 풀 */}
      <div>
        <label className="label">커스텀 방법 풀(선택, 줄바꿈으로 여러 개)</label>
        <textarea
          className="input h-28"
          placeholder={`예)\n물 500ml 마시기\n배달앱 알림 끄기\n요거트로 대체\n\n※ 현재 요금제: 고유 방법 최대 ${maxUnique}개`}
          value={customMethods}
          onChange={(e) => setCustomMethods(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          입력 시 해당 목록에서 최대 {maxUnique}개를 사용해 {days}일 분량으로 순환 편성합니다.
        </p>
      </div>

      {/* 4) 미리보기 & 시작 */}
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost" onClick={genPreview}>
          미리보기 생성
        </button>
        <button type="button" className="btn btn-primary" onClick={onStart}>
          프로그램 시작
        </button>
      </div>

      {/* 5) 힌트 풀 & 미리보기 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="h2 mb-2">
            추천 힌트({(PRESETS as unknown as string[]).includes(keyword) ? keyword : "기본"})
          </div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {(hintPool || []).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="h2 mb-2">주간 미리보기</div>
          {preview.length === 0 ? (
            <p className="text-sm text-gray-600">미리보기 생성 버튼을 눌러 주세요.</p>
          ) : (
            <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-1">
              {preview.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

/* 보조 함수 */
function takeNLoop(arr: string[], n: number): string[] {
  const src = Array.isArray(arr) && arr.length ? arr : ["시작 선언 메모"];
  const out: string[] = [];
  let i = 0;
  while (out.length < n) {
    out.push(src[i % src.length]);
    i++;
  }
  return out;
}
function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)));
}
function decorate(m: string, strength: Strength) {
  if (strength === 1) return m;
  if (strength === 2) return m.replace("30분", "45분").replace("15분", "20분");
  return m
    .replace("30분", "60분")
    .replace("15분", "30분")
    .replace("24시간", "48시간");
}