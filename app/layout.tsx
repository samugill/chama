import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CHAMA?! – 유혹 관리 루틴",
  description: "유혹은 짧게, 성취는 길게. CHAMA?!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
