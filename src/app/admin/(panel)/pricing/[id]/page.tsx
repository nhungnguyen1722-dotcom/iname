import { PlanForm } from "@/components/admin/PlanForm";

export default async function EditPlan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="font-display text-3xl font-extrabold">{id === "new" ? "Tạo gói giá" : "Sửa gói giá"}</h1><PlanForm id={id} /></div>;
}
