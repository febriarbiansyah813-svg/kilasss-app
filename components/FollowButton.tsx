"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";

type Props = {
  targetUserId: string;
  currentUserId: string | null;
  initialFollowing: boolean;
  variant?: "small" | "large";
  /** true di halaman profil agar angka followers ikut diperbarui */
  refreshOnChange?: boolean;
};

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
  variant = "small",
  refreshOnChange = false,
}: Props) {
  const { openAuthModal } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (currentUserId === targetUserId) return null;

  async function toggle() {
    if (!currentUserId) {
      openAuthModal("Masuk untuk mengikuti kreator");
      return;
    }
    if (busy) return;

    const next = !following;
    setFollowing(next);
    setBusy(true);

    const { error } = next
      ? await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId })
      : await supabase
          .from("follows")
          .delete()
          .match({ follower_id: currentUserId, following_id: targetUserId });

    // 23505 = sudah ada (double click) -> anggap sukses
    if (error && error.code !== "23505") setFollowing(!next);
    else if (refreshOnChange) router.refresh();
    setBusy(false);
  }

  const size = variant === "large" ? "px-6 py-2 text-sm" : "px-3 py-1 text-xs";
  const tone = following
    ? "border border-neutral-500 bg-transparent text-white"
    : "bg-brand text-white";

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-md font-semibold transition disabled:opacity-60 ${size} ${tone}`}
    >
      {following ? "Mengikuti" : "Ikuti"}
    </button>
  );
}
