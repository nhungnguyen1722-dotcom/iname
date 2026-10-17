import Link from "next/link";
import { getSettings } from "@/lib/content";

export default async function NotFound() {
  let title = "Không tìm thấy trang";
  let description = "Trang bạn tìm không tồn tại hoặc đã được chuyển.";
  try {
    const settings = await getSettings();
    title = settings.not_found_title || title;
    description = settings.not_found_description || description;
  } catch {
    // Keep the fallback copy when the database is unavailable.
  }
  return (
    <main className="section-shell py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{description}</p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Về trang chủ</Link>
    </main>
  );
}
