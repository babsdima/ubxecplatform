import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GradeUp — Развитие. Доход. Возможности.",
  description:
    "Платформа развития и карьерных возможностей для топ-менеджеров. Быстрый доступ к управленческому таланту для компаний.",
  metadataBase: new URL("https://gradeup.ru"),
  openGraph: {
    type: "website",
    url: "https://gradeup.ru",
    title: "GradeUp — Развитие. Доход. Возможности.",
    description:
      "Экосистема для топ-менеджеров: оценка, развитие, монетизация экспертизы и карьерные возможности в одном месте.",
    siteName: "GradeUp",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "GradeUp — Развитие. Доход. Возможности.",
    description:
      "Платформа развития и карьерных возможностей для топ-менеджеров. Быстрый доступ к управленческому таланту для компаний.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-theme="steel" className={`h-full ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
