"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { VIDEO_SELECT, type FeedVideo } from "@/lib/types";
import VideoCard from "./VideoCard";

const PAGE_SIZE = 5;

type FeedItem = { video: FeedVideo; liked: boolean; following: boolean };

export default function VideoFeed({ userId }: { userId: string | null }) {
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const doneRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const from = pageRef.current * PAGE_SIZE;
    const { data, error: qErr } = await supabase
      .from("videos")
      .select(VIDEO_SELECT)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (qErr) {
      setError("Gagal memuat video. Periksa koneksi Anda.");
      loadingRef.current = false;
      setLoading(false);
      return;
    }

    const videos = (data ?? []) as unknown as FeedVideo[];
    const liked = new Set<string>();
    const following = new Set<string>();

    if (userId && videos.length > 0) {
      const [likesRes, followsRes] = await Promise.all([
        supabase
          .from("likes")
          .select("video_id")
          .eq("user_id", userId)
          .in("video_id", videos.map((v) => v.id)),
        supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId)
          .in("following_id", Array.from(new Set(videos.map((v) => v.user_id)))),
      ]);
      likesRes.data?.forEach((r) => liked.add(r.video_id as string));
      followsRes.data?.forEach((r) => following.add(r.following_id as string));
    }

    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.video.id));
      const fresh = videos
        .filter((v) => !seen.has(v.id))
        .map((v) => ({ video: v, liked: liked.has(v.id), following: following.has(v.user_id) }));
      return [...prev, ...fresh];
    });

    pageRef.current += 1;
    if (videos.length < PAGE_SIZE) {
      doneRef.current = true;
      setDone(true);
    }
    loadingRef.current = false;
    setLoading(false);
  }, [supabase, userId]);

  // Infinite scroll: muat halaman berikutnya saat ujung daftar mendekat.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll">
      {items.map((i) => (
        <VideoCard
          key={i.video.id}
          video={i.video}
          initialLiked={i.liked}
          initialFollowing={i.following}
          currentUserId={userId}
        />
      ))}

      {done && items.length === 0 && (
        <div className="grid h-full place-items-center px-6 text-center">
          <div>
            <p className="text-lg font-semibold">Belum ada video</p>
            <p className="mt-1 text-sm text-neutral-400">Jadilah yang pertama mengunggah!</p>
            <Link
              href="/upload"
              className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold"
            >
              Unggah video
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="grid h-40 place-items-center text-center text-sm">
          <div>
            <p className="text-rose-400">{error}</p>
            <button onClick={loadMore} className="mt-2 underline">
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="grid h-full place-items-center text-sm text-neutral-500">Memuat video…</div>
      )}

      <div ref={sentinelRef} className="h-px" />
    </div>
  );
}
