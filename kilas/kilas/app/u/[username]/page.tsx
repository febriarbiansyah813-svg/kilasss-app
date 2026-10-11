import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { formatCount } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { username: string } }) {
  return { title: `@${params.username} — Kilas` };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username.toLowerCase())
    .maybeSingle();
  if (!data) notFound();
  const profile = data as Profile;

  const { data: videos } = await supabase
    .from("videos")
    .select("id, video_url, likes_count")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const isOwn = user?.id === profile.id;
  let isFollowing = false;
  if (user && !isOwn) {
    const { data: f } = await supabase
      .from("follows")
      .select("follower_id")
      .match({ follower_id: user.id, following_id: profile.id })
      .maybeSingle();
    isFollowing = !!f;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
        <Avatar src={profile.avatar_url} name={profile.username} size={96} />
        <div className="flex-1">
          <h1 className="text-xl font-bold">@{profile.username}</h1>
          {profile.full_name && <p className="text-neutral-300">{profile.full_name}</p>}

          <div className="mt-3 flex justify-center gap-6 text-sm sm:justify-start">
            <span>
              <b>{formatCount(profile.following_count)}</b> <span className="text-neutral-400">Mengikuti</span>
            </span>
            <span>
              <b>{formatCount(profile.followers_count)}</b> <span className="text-neutral-400">Pengikut</span>
            </span>
            <span>
              <b>{formatCount(profile.videos_count)}</b> <span className="text-neutral-400">Video</span>
            </span>
          </div>

          <div className="mt-3">
            {isOwn ? (
              <Link
                href="/settings/profile"
                className="inline-block rounded-md border border-neutral-600 px-5 py-2 text-sm font-semibold hover:bg-neutral-900"
              >
                Edit profil
              </Link>
            ) : (
              <FollowButton
                targetUserId={profile.id}
                currentUserId={user?.id ?? null}
                initialFollowing={isFollowing}
                variant="large"
                refreshOnChange
              />
            )}
          </div>

          {profile.bio && <p className="mt-3 whitespace-pre-line text-sm text-neutral-300">{profile.bio}</p>}
        </div>
      </header>

      <div className="mt-8 border-t border-neutral-800 pt-4">
        {!videos || videos.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">Belum ada video.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-1">
            {videos.map((v) => (
              <li key={v.id}>
                <Link href={`/v/${v.id}`} className="group relative block aspect-[9/16] overflow-hidden bg-neutral-900">
                  <video
                    src={`${v.video_url}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs">
                    ♥ {formatCount(v.likes_count)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
