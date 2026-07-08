import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  Cormorant_Garamond,
  EB_Garamond,
  Jost,
  Pinyon_Script,
} from "next/font/google";
import { wedding } from "@/config/wedding";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: wedding.meta.title,
  description: wedding.meta.description,
  openGraph: {
    title: wedding.meta.title,
    description: wedding.meta.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${sans.variable} ${script.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
