import VideoThumb from "@/components/VideoThumb";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Disimpan — OmniSocial" };

type Row = { videos: { id: string; video_url: string; likes_count: number } | null };

export default async function SavedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from("bookmarks")
        .select("videos(id, video_url, likes_count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60)
    : { data: [] };

  const videos = ((data ?? []) as unknown as Row[]).map((r) => r.videos).filter(Boolean) as NonNullable<Row["videos"]>[];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-16 md:pt-8">
      <h1 className="text-2xl font-extrabold">Video disimpan</h1>
      {videos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-500">Belum ada video yang disimpan.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {videos.map((v) => (
            <VideoThumb key={v.id} id={v.id} url={v.video_url} likes={v.likes_count} />
          ))}
        </div>
      )}
    </div>
  );
}
