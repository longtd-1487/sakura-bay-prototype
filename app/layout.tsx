import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Chợ thủy sản Vịnh Sakura – Hệ thống hỗ trợ vận hành", description: "Prototype LAB-2" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
