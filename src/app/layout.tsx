import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "iName",
    template: "%s | iName",
  },
  description: "Văn phòng ảo, kế toán - thuế và giải pháp công nghệ cho doanh nghiệp.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={bodyFont.variable} style={{ ["--font-body" as string]: "var(--font-be-vietnam)", ["--font-heading" as string]: "var(--font-be-vietnam)" }}>
        {children}
      </body>
    </html>
  );
}
