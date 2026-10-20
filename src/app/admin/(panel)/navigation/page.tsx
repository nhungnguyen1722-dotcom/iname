import { Notice } from "@/components/admin/AdminShell";
import { NavigationEditor } from "@/components/admin/NavigationEditor";
import { getNavigation } from "@/lib/content";

export default async function NavigationAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const items = await getNavigation(false);
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Main Menu</h1>
      <Notice saved={query.saved} error={query.error} />
      <NavigationEditor initialItems={items} />
    </div>
  );
}
