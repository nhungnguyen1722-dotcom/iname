import { ServiceEditor } from "@/components/admin/ServiceEditor";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{id === "new" ? "Tạo dịch vụ" : "Sửa dịch vụ"}</h1>
      <ServiceEditor id={id === "new" ? null : Number(id)} />
    </div>
  );
}
