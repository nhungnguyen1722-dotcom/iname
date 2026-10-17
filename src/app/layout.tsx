import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "An Việt Office",
    template: "%s | An Việt Office",
  },
  description: "Văn phòng ảo và dịch vụ kế toán, thuế cho doanh nghiệp.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${bodyFont.variable} ${headingFont.variable}`} style={{ ["--font-body" as string]: "var(--font-be-vietnam)", ["--font-heading" as string]: "var(--font-jakarta)" }}>
        {children}
      </body>
    </html>
  );
}
