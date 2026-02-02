import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTERX OKR AI Platform",
  description: "AI-powered OKR coaching and future vision platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
