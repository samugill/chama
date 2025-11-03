"use client";
import { createShareUrl, SharePayload } from "@/lib/share";

export default function ShareButton({ payload }: { payload: SharePayload }) {
  const url = createShareUrl(payload);

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "CHAMA?! 루틴",
          text: `${payload.title} – 함께 해볼래?`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("공유 링크를 클립보드에 복사했어요!");
      } else {
        prompt("아래 링크를 복사하세요", url);
      }
    } catch (e) {
      console.error(e);
      alert("공유 중 오류가 발생했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <button className="btn btn-ghost w-full" onClick={onShare}>
      친구와 공유하기
    </button>
  );
}
