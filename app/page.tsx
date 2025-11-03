import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="card p-6 text-center">
        <h1 className="h1">유혹은 짧게, 성취는 길게. CHAMA?!</h1>
        <p className="text-gray-600 mt-2">
          지금 떠오른 욕구를 입력하면, 당장 할 수 있는 방법을 만들어 드려요.
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          <Link className="btn btn-primary" href="/plan">방법 만들기</Link>
          <Link className="btn btn-ghost" href="/pricing">요금제 보기</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {["숏폼 중독 끊기","야식 유혹 참기","과소비 줄이기","게임 시간 제한"].map((t) => (
          <div key={t} className="card p-4 text-sm">
            <div className="h2 mb-1">{t}</div>
            <p className="text-gray-600">추천 루틴과 카운트다운으로 바로 시작하세요.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
