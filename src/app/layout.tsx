import type { Metadata } from "next";
import { headers } from "next/headers";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // A nonce must be generated for each request, so this route cannot be prerendered.
  // Next.js reads the CSP supplied by middleware and attaches the nonce to its scripts.
  await headers();

  return (
    <html lang="vi">
      <body className={bodyFont.variable} style={{ ["--font-body" as string]: "var(--font-be-vietnam)", ["--font-heading" as string]: "var(--font-be-vietnam)" }}>
        {children}
      </body>
    </html>
  );
}
