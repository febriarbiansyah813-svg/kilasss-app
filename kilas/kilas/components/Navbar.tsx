import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-900 bg-black/90 px-4 backdrop-blur">
      <Link href="/" className="text-xl font-extrabold tracking-tight">
        Kilas<span className="text-brand">.</span>
      </Link>

      <nav className="flex items-center gap-2">
        {user && profile ? (
          <>
            <Link
              href="/upload"
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold hover:opacity-90"
            >
              + Unggah
            </Link>
            <Link href={`/u/${profile.username}`} aria-label="Profil saya">
              <Avatar src={profile.avatar_url} name={profile.username} size={32} />
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-md px-3 py-1.5 text-sm hover:bg-neutral-800">
              Masuk
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold hover:opacity-90"
            >
              Daftar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
