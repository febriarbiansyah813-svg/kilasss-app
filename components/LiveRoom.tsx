"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { LIVE_ROOMS } from "@/lib/mock";
import { formatCount } from "@/lib/utils";

const SAMPLE_STREAM = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

type Msg = { id: number; user: string; text: string };
const BOTS = ["rina", "doni", "salsa", "bayu", "mira"];
const LINES = ["Halo kak! 👋", "Keren banget", "Salam dari Surabaya", "Lagu apa tadi?", "🔥🔥🔥", "Wah mantap"];

export default function LiveRoom() {
  const { user, openAuthModal } = useAuth();
  const [roomId, setRoomId] = useState(LIVE_ROOMS[0].id);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const idRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const room = LIVE_ROOMS.find((r) => r.id === roomId)!;

  // Simulasi chat masuk. Ganti dengan Supabase Realtime (channel `live:${roomId}`) untuk chat sungguhan.
  useEffect(() => {
    setMsgs([]);
    const t = setInterval(() => {
      const m = { id: idRef.current++, user: BOTS[Math.floor(Math.random() * BOTS.length)], text: LINES[Math.floor(Math.random() * LINES.length)] };
      setMsgs((p) => [...p.slice(-80), m]);
    }, 1800);
    return () => clearInterval(t);
  }, [roomId]);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [msgs]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return openAuthModal("Masuk untuk ikut mengobrol di LIVE");
    const t = text.trim();
    if (!t) return;
    setMsgs((p) => [...p, { id: idRef.current++, user: user.username, text: t }]);
    setText("");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 pt-16 md:pt-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className={`relative grid aspect-video place-items-center rounded-xl bg-gradient-to-br ${room.color}`}>
          <span className="absolute left-3 top-3 rounded bg-brand px-2 py-0.5 text-xs font-extrabold">LIVE</span>
          <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-0.5 text-xs">👁 {formatCount(room.viewers)}</span>
          <video key={room.id} src={SAMPLE_STREAM} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-60" />
          <p className="relative px-6 text-center text-xl font-extrabold drop-shadow">{room.title}</p>
          <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80">Demo — bukan siaran sungguhan</span>
        </div>
        <p className="mt-3 font-bold">@{room.host}</p>

        <h2 className="mb-2 mt-6 font-bold">Kreator yang sedang LIVE</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {LIVE_ROOMS.map((r) => (
            <button key={r.id} onClick={() => setRoomId(r.id)} className={`relative h-28 w-40 shrink-0 rounded-lg bg-gradient-to-br ${r.color} p-2 text-left ring-2 ${r.id === roomId ? "ring-brand" : "ring-transparent"}`}>
              <span className="rounded bg-brand px-1.5 text-[10px] font-extrabold">LIVE</span>
              <span className="absolute bottom-2 left-2 right-2 text-xs font-semibold">@{r.host}<br /><span className="font-normal opacity-80">👁 {formatCount(r.viewers)}</span></span>
            </button>
          ))}
        </div>
      </div>

      <aside className="flex h-[420px] flex-col rounded-xl border border-neutral-800 bg-neutral-950 lg:h-[560px]">
        <p className="border-b border-neutral-800 px-4 py-3 text-sm font-bold">Chat langsung</p>
        <div className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto px-4 py-3 text-sm">
          {msgs.map((m) => (
            <p key={m.id}><span className="font-semibold text-neutral-400">{m.user}</span> {m.text}</p>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-neutral-800 p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "Ketik pesan…" : "Masuk untuk mengobrol"}
            className="min-w-0 flex-1 rounded-full bg-neutral-800 px-4 py-2 text-sm focus:outline-none"
          />
          <button className="rounded-full bg-brand px-4 text-sm font-semibold">Kirim</button>
        </form>
      </aside>
    </div>
  );
}
