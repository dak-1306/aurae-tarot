import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { UI_TEXTS } from "@/constants/app";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: UI_TEXTS.META.TITLE,
  description: UI_TEXTS.META.DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="vi"
      className={`${cormorantGaramond.variable} ${beVietnamPro.variable}`}
    >
      <body className="app-body">{children}</body>
    </html>
  );
}
