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
  title: "UbXec — Executive Search",
  description:
    "Анонимный маркетплейс для найма топ-менеджеров в России. C-level кандидаты и компании — без посредников, без утечек информации.",
  metadataBase: new URL("https://ubxec.ru"),
  openGraph: {
    type: "website",
    url: "https://ubxec.ru",
    title: "UbXec — Executive Search",
    description:
      "Анонимный маркетплейс для найма топ-менеджеров. Скрытый профиль до взаимного интереса. Прямой контакт без агентства.",
    siteName: "UbXec",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "UbXec — Executive Search",
    description:
      "Анонимный маркетплейс для найма топ-менеджеров в России. C-level кандидаты и компании — без посредников.",
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
