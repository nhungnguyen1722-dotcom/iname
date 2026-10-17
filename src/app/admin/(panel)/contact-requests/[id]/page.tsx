import { ContactDetail } from "@/components/admin/ContactDetail";
import { Notice } from "@/components/admin/AdminShell";

export default async function ContactRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <div><Notice saved={query.saved} error={query.error} /><ContactDetail id={id} /></div>;
}
