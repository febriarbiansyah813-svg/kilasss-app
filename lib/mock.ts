// Data contoh. Ganti dengan tabel Supabase (series, episodes, live_rooms) bila sudah siap.
export type Episode = { n: number; title: string; duration: string; video_url?: string };
export type Series = { id: string; title: string; genre: string; color: string; episodes: Episode[] };

const eps = (t: string, n: number): Episode[] =>
  Array.from({ length: n }, (_, i) => ({ n: i + 1, title: `${t} — Episode ${i + 1}`, duration: `${1 + (i % 3)}:${i % 2 ? "30" : "05"}` }));

export const SERIES: Series[] = [
  { id: "cinta-kos", title: "Cinta Anak Kos", genre: "Romansa", color: "from-pink-600 to-rose-900", episodes: eps("Cinta Anak Kos", 12) },
  { id: "bos-baru", title: "Bos Baru, Masalah Baru", genre: "Komedi", color: "from-amber-500 to-orange-900", episodes: eps("Bos Baru", 8) },
  { id: "malam-jumat", title: "Malam Jumat", genre: "Horor", color: "from-slate-600 to-black", episodes: eps("Malam Jumat", 10) },
];

export type LiveRoom = { id: string; host: string; title: string; viewers: number; color: string };
export const LIVE_ROOMS: LiveRoom[] = [
  { id: "1", host: "dinda.music", title: "Akustik santai malam ini 🎸", viewers: 1320, color: "from-fuchsia-600 to-indigo-900" },
  { id: "2", host: "chef.rama", title: "Masak rendang bareng", viewers: 842, color: "from-orange-500 to-red-900" },
  { id: "3", host: "gamer.kei", title: "Push rank sampai subuh", viewers: 2105, color: "from-emerald-500 to-teal-900" },
  { id: "4", host: "ayu.travel", title: "Keliling pasar Bandung", viewers: 397, color: "from-sky-500 to-blue-900" },
];
