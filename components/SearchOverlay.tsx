"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "./Avatar";
import { CloseIcon, SearchIcon } from "./icons";

type Ctx = { openSearch: () => void };
const SearchCtx = createContext<Ctx>({ openSearch: () => {} });
export const useSearch = () => useContext(SearchCtx);

type UserHit = { username: string; full_name: string | null; avatar_url: string | null };
type VideoHit = { id: string; video_url: string; caption: string };

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserHit[]>([]);
  const [videos, setVideos] = useState<VideoHit[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => close(), [pathname, close]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Pencarian langsung (debounce 300 ms).
  useEffect(() => {
    const term = q.trim().replace(/[%_,()]/g, " ").trim();
    if (!term) {
      setUsers([]);
      setVideos([]);
      setTags([]);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const name = term.replace(/^[@#]/, "");
        const [u, v] = await Promise.all([
          supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .or(`username.ilike.%${name}%,full_name.ilike.%${name}%`)
            .limit(5),
          supabase
            .from("videos")
            .select("id, video_url, caption")
            .ilike("caption", `%${term}%`)
            .order("likes_count", { ascending: false })
            .limit(40),
        ]);
        if (cancelled) return;
        if (u.error || v.error) throw new Error("search");

        const vids = (v.data ?? []) as VideoHit[];
        const found = new Map<string, number>();
        vids.forEach((x) =>
          (x.caption?.match(/#[\p{L}\p{N}_]+/gu) ?? []).forEach((tg: string) => {
            const k = tg.toLowerCase();
            if (k.includes(name.toLowerCase())) found.set(k, (found.get(k) ?? 0) + 1);
          })
        );
        setUsers((term.startsWith("#") ? [] : u.data ?? []) as UserHit[]);
        setVideos(vids.slice(0, 6));
        setTags(Array.from(found.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k));
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, supabase]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    close();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  const empty = q.trim() && !loading && !error && !users.length && !videos.length && !tags.length;

  return (
    <SearchCtx.Provider value={{ openSearch }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian"
            className="mx-auto mt-0 flex max-h-dvh w-full max-w-xl flex-col overflow-hidden bg-neutral-950 md:mt-16 md:max-h-[75dvh] md:rounded-2xl md:border md:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submit} className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
              <SearchIcon className="text-neutral-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari pengguna, #tagar, atau video"
                className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <button type="button" onClick={close} aria-label="Tutup pencarian" className="text-neutral-400 hover:text-white">
                <CloseIcon />
              </button>
            </form>

            <div className="no-scrollbar flex-1 overflow-y-auto p-2">
              {!q.trim() && (
                <p className="px-3 py-8 text-center text-sm text-neutral-500">
                  Ketik nama pengguna, <b>@username</b>, <b>#tagar</b>, atau kata dari caption video.
                </p>
              )}
              {loading && <p className="px-3 py-4 text-sm text-neutral-500">Mencari…</p>}
              {error && <p className="px-3 py-4 text-sm text-rose-400">Pencarian gagal. Periksa koneksi Anda.</p>}
              {empty && <p className="px-3 py-8 text-center text-sm text-neutral-500">Tidak ada hasil untuk “{q.trim()}”.</p>}

              {tags.length > 0 && (
                <section className="mb-2">
                  <h3 className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Tagar</h3>
                  {tags.map((t) => (
                    <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-800 font-bold">#</span>
                      <span className="font-semibold">{t}</span>
                    </Link>
                  ))}
                </section>
              )}

              {users.length > 0 && (
                <section className="mb-2">
                  <h3 className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Pengguna</h3>
                  {users.map((u) => (
                    <Link key={u.username} href={`/u/${u.username}`} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10">
                      <Avatar src={u.avatar_url} name={u.username} size={36} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">@{u.username}</p>
                        {u.full_name && <p className="truncate text-xs text-neutral-400">{u.full_name}</p>}
                      </div>
                    </Link>
                  ))}
                </section>
              )}

              {videos.length > 0 && (
                <section className="mb-2">
                  <h3 className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Video</h3>
                  <div className="grid grid-cols-3 gap-1.5 px-2">
                    {videos.map((v) => (
                      <Link key={v.id} href={`/v/${v.id}`} className="relative block aspect-[9/16] overflow-hidden rounded-md bg-neutral-900">
                        <video src={`${v.video_url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {q.trim() && (
                <button onClick={submit} className="mt-1 w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-brand hover:bg-white/10">
                  Lihat semua hasil untuk “{q.trim()}”
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </SearchCtx.Provider>
  );
}
