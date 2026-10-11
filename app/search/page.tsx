import Link from "next/link";
import Avatar from "@/components/Avatar";
import SearchBox from "@/components/SearchBox";
import VideoThumb from "@/components/VideoThumb";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Cari — OmniSocial" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const safe = q.replace(/[%_,()]/g, " ");
  const supabase = createClient();

  let users: { username: string; full_name: string | null; avatar_url: string | null; followers_count: number }[] = [];
  let videos: { id: string; video_url: string; likes_count: number; caption: string }[] = [];

  if (safe.trim()) {
    const [u, v] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, full_name, avatar_url, followers_count")
        .or(`username.ilike.%${safe.replace(/^@/, "")}%,full_name.ilike.%${safe.replace(/^@/, "")}%`)
        .limit(12),
      supabase
        .from("videos")
        .select("id, video_url, likes_count, caption")
        .ilike("caption", `%${safe}%`)
        .order("likes_count", { ascending: false })
        .limit(30),
    ]);
    users = u.data ?? [];
    videos = v.data ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-16 md:pt-8">
      <SearchBox initial={q} autoFocus={!q} />
      {!q ? (
        <p className="mt-8 text-center text-sm text-neutral-500">Cari pengguna, #tagar, atau judul video.</p>
      ) : (
        <>
          <h2 className="mb-3 mt-8 font-bold">Pengguna</h2>
          {users.length === 0 ? (
            <p className="text-sm text-neutral-500">Tidak ada pengguna untuk “{q}”.</p>
          ) : (
            <ul className="space-y-1">
              {users.map((u) => (
                <li key={u.username}>
                  <Link href={`/u/${u.username}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10">
                    <Avatar src={u.avatar_url} name={u.username} size={44} />
                    <div>
                      <p className="font-semibold">@{u.username}</p>
                      <p className="text-xs text-neutral-400">{u.full_name ?? ""}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mb-3 mt-8 font-bold">Video</h2>
          {videos.length === 0 ? (
            <p className="text-sm text-neutral-500">Tidak ada video untuk “{q}”.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {videos.map((v) => (
                <VideoThumb key={v.id} id={v.id} url={v.video_url} likes={v.likes_count} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
