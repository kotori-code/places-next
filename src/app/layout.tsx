import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "行きたい場所リスト",
  description: "家族の行きたい場所をまとめて、日程を決めるためのリスト",
  // 家族だけで使うので検索エンジンに載せない
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full bg-orange-50/40 text-stone-800">
        {children}
      </body>
    </html>
  );
}
