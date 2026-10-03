import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "הספרייה של משפחת אברהם",
  description: "הספרייה המשפחתית שלנו — ספרים, קריאה והשאלות במקום אחד.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
