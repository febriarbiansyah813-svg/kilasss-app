"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FeedVideo } from "@/lib/types";
import { formatCount } from "@/lib/utils";
import { setGlobalMuted, useGlobalMuted } from "@/lib/useGlobalMuted";
import Avatar from "./Avatar";
import CommentsPanel from "./CommentsPanel";
import FollowButton from "./FollowButton";
import { BookmarkIcon, CommentIcon, HeartIcon, PlayIcon, VolumeIcon } from "./icons";
import { useAuth } from "./AuthProvider";

type Props = {
  video: FeedVideo;
  initialLiked: boolean;
  initialFollowing: boolean;
  initialSaved?: boolean;
  currentUserId: string | null;
};

export default function VideoCard({ video, initialLiked, initialFollowing, initialSaved = false, currentUserId }: Props) {
  const { openAuthModal } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const muted = useGlobalMuted();
  const [active, setActive] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(video.likes_count);
  const [commentsCount, setCommentsCount] = useState(video.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [saveBusy, setSaveBusy] = useState(false);

  const isOwn = currentUserId === video.user_id;

  // Tandai kartu "aktif" bila >= 60% terlihat di layar.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio >= 0.6),
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !userPaused) v.play().catch(() => {});
    else v.pause();
  }, [active, userPaused]);

  useEffect(() => {
    if (!active) {
      setUserPaused(false);
      if (videoRef.current) videoRef.current.currentTime = 0;
      setShowComments(false);
    }
  }, [active]);

  async function toggleLike() {
    if (!currentUserId) {
      openAuthModal("Masuk untuk menyukai video");
      return;
    }
    if (likeBusy) return;

    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    setLikeBusy(true);

    const { error } = next
      ? await supabase.from("likes").insert({ user_id: currentUserId, video_id: video.id })
      : await supabase.from("likes").delete().match({ user_id: currentUserId, video_id: video.id });

    if (error && error.code !== "23505") {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    }
    setLikeBusy(false);
  }

  async function toggleSave() {
    if (!currentUserId) {
      openAuthModal("Masuk untuk menyimpan video");
      return;
    }
    if (saveBusy) return;
    const next = !saved;
    setSaved(next);
    setSaveBusy(true);
    const { error } = next
      ? await supabase.from("bookmarks").insert({ user_id: currentUserId, video_id: video.id })
      : await supabase.from("bookmarks").delete().match({ user_id: currentUserId, video_id: video.id });
    if (error && error.code !== "23505") setSaved(!next);
    setSaveBusy(false);
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex h-full w-full snap-start snap-always items-center justify-center bg-black"
    >
      <div className="relative h-full w-full overflow-hidden bg-neutral-950 md:max-w-[460px]">
        <video
          ref={videoRef}
          src={`${video.video_url}#t=0.001`}
          loop
          muted
          playsInline
          preload={active ? "auto" : "metadata"}
          onClick={() => setUserPaused((p) => !p)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (progressRef.current && v.duration) {
              progressRef.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
            }
          }}
          className="h-full w-full cursor-pointer object-cover md:object-contain"
        />

        {userPaused && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/80">
            <PlayIcon />
          </div>
        )}

        <button
          onClick={() => setGlobalMuted(!muted)}
          aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
          className="absolute right-3 top-14 z-20 md:top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 backdrop-blur"
        >
          <VolumeIcon muted={muted} />
        </button>

        {/* Info kreator + caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pb-20 pr-20 pt-20 md:pb-4">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link href={`/u/${video.profiles.username}`} className="flex min-w-0 items-center gap-2">
              <Avatar src={video.profiles.avatar_url} name={video.profiles.username} size={36} />
              <span className="truncate font-semibold">@{video.profiles.username}</span>
            </Link>
            {!isOwn && (
              <FollowButton
                targetUserId={video.user_id}
                currentUserId={currentUserId}
                initialFollowing={initialFollowing}
              />
            )}
          </div>
          {video.caption && (
            <p className="pointer-events-auto mt-2 line-clamp-3 break-words text-sm">{video.caption}</p>
          )}
        </div>

        {/* Tombol aksi */}
        <div className="absolute bottom-28 right-3 z-20 md:bottom-24 flex flex-col items-center gap-5">
          <button
            onClick={toggleLike}
            aria-label={liked ? "Batal suka" : "Suka"}
            aria-pressed={liked}
            className="flex flex-col items-center gap-1"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur">
              <HeartIcon filled={liked} className={liked ? "text-rose-500" : "text-white"} />
            </span>
            <span className="text-xs font-semibold drop-shadow">{formatCount(likes)}</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            aria-label="Buka komentar"
            className="flex flex-col items-center gap-1"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur">
              <CommentIcon />
            </span>
            <span className="text-xs font-semibold drop-shadow">{formatCount(commentsCount)}</span>
          </button>

          <button
            onClick={toggleSave}
            aria-label={saved ? "Hapus dari simpanan" : "Simpan"}
            aria-pressed={saved}
            className="flex flex-col items-center gap-1"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur">
              <BookmarkIcon filled={saved} className={saved ? "text-amber-400" : "text-white"} />
            </span>
            <span className="text-xs font-semibold drop-shadow">{saved ? "Disimpan" : "Simpan"}</span>
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/20">
          <div ref={progressRef} className="h-full w-0 bg-white" />
        </div>

        {showComments && (
          <CommentsPanel
            videoId={video.id}
            currentUserId={currentUserId}
            onClose={() => setShowComments(false)}
            onCountChange={(d) => setCommentsCount((n) => Math.max(0, n + d))}
          />
        )}
      </div>
    </section>
  );
}
