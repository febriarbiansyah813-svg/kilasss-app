"use client";

import { useState } from "react";
import { SERIES } from "@/lib/mock";

export default function DramaPlayer() {
  const [sid, setSid] = useState(SERIES[0].id);
  const [ep, setEp] = useState(1);
  const series = SERIES.find((s) => s.id === sid)!;
  const current = series.episodes.find((e) => e.n === ep) ?? series.episodes[0];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-16 md:pt-8">
      <h1 className="text-2xl font-extrabold">Mini drama</h1>

      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
        {SERIES.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSid(s.id); setEp(1); }}
            className={`h-28 w-44 shrink-0 rounded-xl bg-gradient-to-br ${s.color} p-3 text-left ring-2 ${sid === s.id ? "ring-brand" : "ring-transparent"}`}
          >
            <span className="text-[11px] font-bold uppercase text-white/80">{s.genre}</span>
            <span className="mt-1 block font-extrabold leading-tight">{s.title}</span>
            <span className="mt-1 block text-xs text-white/80">{s.episodes.length} episode</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className={`relative grid aspect-[9/16] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${series.color}`}>
          {current.video_url ? (
            <video key={current.video_url} src={current.video_url} controls autoPlay playsInline onEnded={() => ep < series.episodes.length && setEp(ep + 1)} className="h-full w-full object-cover" />
          ) : (
            <div className="px-6 text-center">
              <p className="text-sm text-white/80">Sedang diputar</p>
              <p className="mt-1 text-xl font-extrabold">{current.title}</p>
              <p className="mt-3 text-xs text-white/70">Episode ini belum punya video.</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-bold">{series.title}</h2>
          <p className="text-sm text-neutral-400">{series.genre} · Episode {current.n} dari {series.episodes.length}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setEp(Math.max(1, ep - 1))}
              disabled={ep <= 1}
              className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => setEp(Math.min(series.episodes.length, ep + 1))}
              disabled={ep >= series.episodes.length}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Berikutnya →
            </button>
          </div>
          <h2 className="mt-6 font-bold">Daftar episode</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {series.episodes.map((e) => (
              <li key={e.n}>
                <button
                  onClick={() => setEp(e.n)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${e.n === current.n ? "bg-brand font-bold" : "bg-neutral-900 hover:bg-neutral-800"}`}
                >
                  Ep. {e.n}
                  <span className="block text-xs opacity-70">{e.duration}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
