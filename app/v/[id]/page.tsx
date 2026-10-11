import { notFound } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { createClient } from "@/lib/supabase/server";
import { VIDEO_SELECT, type FeedVideo } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Halaman satu video (dibuka dari grid profil).
export default async function VideoPage({ params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from("videos").select(VIDEO_SELECT).eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const video = data as unknown as FeedVideo;

  let liked = false;
  let following = false;
  if (user) {
    const [l, f] = await Promise.all([
      supabase.from("likes").select("video_id").match({ user_id: user.id, video_id: video.id }).maybeSingle(),
      supabase
        .from("follows")
        .select("follower_id")
        .match({ follower_id: user.id, following_id: video.user_id })
        .maybeSingle(),
    ]);
    liked = !!l.data;
    following = !!f.data;
  }

  return (
    <div className="h-full">
      <VideoCard video={video} initialLiked={liked} initialFollowing={following} currentUserId={user?.id ?? null} />
    </div>
  );
}
