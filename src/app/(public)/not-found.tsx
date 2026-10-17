import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="section-shell py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Không tìm thấy trang</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Trang bạn tìm không tồn tại hoặc đã được chuyển.</p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Về trang chủ</Link>
    </main>
  );
}
