"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-md px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
    >
      Keluar
    </button>
  );
}
