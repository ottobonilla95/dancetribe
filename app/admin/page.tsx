import { redirect } from "next/navigation";

// Redirect to cache settings by default
export default function AdminPage() {
  redirect("/admin/cache");
}

