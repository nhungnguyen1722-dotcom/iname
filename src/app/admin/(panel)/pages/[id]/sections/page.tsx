import { redirect } from "next/navigation";
import { findAdminPage } from "@/lib/admin-pages";
import { notFound } from "next/navigation";

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await findAdminPage(id);
  if (!page) notFound();
  redirect(`/admin/pages/${page.slug}#phan-section`);
}
