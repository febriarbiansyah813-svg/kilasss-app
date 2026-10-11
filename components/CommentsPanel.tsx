"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CommentItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import Avatar from "./Avatar";
import { CloseIcon } from "./icons";
import { useAuth } from "./AuthProvider";

type Props = {
  videoId: string;
  currentUserId: string | null;
  onClose: () => void;
  onCountChange: (delta: number) => void;
};

const COMMENT_SELECT = "id, content, created_at, user_id, profiles(username, avatar_url)";

export default function CommentsPanel({ videoId, currentUserId, onClose, onCountChange }: Props) {
  const { openAuthModal } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(COMMENT_SELECT)
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) setError("Gagal memuat komentar.");
      else setComments((data ?? []) as unknown as CommentItem[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, videoId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    if (!currentUserId) {
      openAuthModal("Masuk untuk berkomentar");
      return;
    }

    setPosting(true);
    setError(null);
    const { data, error } = await supabase
      .from("comments")
      .insert({ video_id: videoId, user_id: currentUserId, content })
      .select(COMMENT_SELECT)
      .single();
    setPosting(false);

    if (error || !data) {
      setError("Gagal mengirim komentar.");
      return;
    }
    setComments((c) => [data as unknown as CommentItem, ...c]);
    setText("");
    onCountChange(1);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) {
      setComments((c) => c.filter((x) => x.id !== id));
      onCountChange(-1);
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex h-[70%] flex-col rounded-t-2xl bg-neutral-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <h2 className="text-sm font-semibold">Komentar</h2>
        <button onClick={onClose} aria-label="Tutup komentar" className="text-neutral-400 hover:text-white">
          <CloseIcon />
        </button>
      </div>

      <ul className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
        {loading && <li className="text-sm text-neutral-500">Memuat…</li>}
        {!loading && comments.length === 0 && (
          <li className="py-8 text-center text-sm text-neutral-500">Belum ada komentar. Mulai percakapan!</li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Link href={`/u/${c.profiles.username}`}>
              <Avatar src={c.profiles.avatar_url} name={c.profiles.username} size={32} />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 text-xs text-neutral-400">
                <Link href={`/u/${c.profiles.username}`} className="font-semibold text-neutral-200">
                  @{c.profiles.username}
                </Link>
                <span>{timeAgo(c.created_at)}</span>
              </div>
              <p className="break-words text-sm">{c.content}</p>
            </div>
            {c.user_id === currentUserId && (
              <button
                onClick={() => remove(c.id)}
                className="self-start text-xs text-neutral-500 hover:text-rose-400"
              >
                Hapus
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="border-t border-neutral-800 p-3">
        {error && <p className="mb-2 text-xs text-rose-400">{error}</p>}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder={currentUserId ? "Tambahkan komentar…" : "Masuk untuk berkomentar"}
            className="flex-1 rounded-full bg-neutral-800 px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
}
