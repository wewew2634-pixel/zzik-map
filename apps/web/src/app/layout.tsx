import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WebVitalsReporter } from "./web-vitals-reporter";

// Variable font for optimal performance (70% smaller file size)
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ZZIK Map - 단골지수 기반 로컬 이득 맵",
  description: "리뷰 대신 단골지수로 가게를 고르는 QR·GPS 기반 로컬 이득 맵. 단골이 많은 집과 이득 좋은 가게만 골라 보여드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" dir="ltr">
      <head>
        <link rel="preload" as="font" />
      </head>
      <body
        className={`${geist.variable} antialiased font-sans`}
      >
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
