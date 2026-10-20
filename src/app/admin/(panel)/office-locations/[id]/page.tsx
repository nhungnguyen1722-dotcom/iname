import { Notice } from "@/components/admin/AdminShell";
import { OfficeLocationForm } from "@/components/admin/OfficeLocationForm";

export default async function EditOfficeLocation({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{id === "new" ? "Thêm văn phòng ảo" : "Sửa văn phòng ảo"}</h1>
      <Notice saved={query.saved} error={query.error} />
      <OfficeLocationForm id={id} />
    </div>
  );
}
