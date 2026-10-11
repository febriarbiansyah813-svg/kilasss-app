import Link from "next/link";
import VideoThumb from "@/components/VideoThumb";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Jelajahi — OmniSocial" };

const CATEGORIES = ["Musik", "Komedi", "Kuliner", "Olahraga", "Gaming", "Travel", "Edukasi", "Hewan", "Fashion"];

export default async function ExplorePage() {
  const supabase = createClient();
  const [{ data: top }, { data: recent }] = await Promise.all([
    supabase.from("videos").select("id, video_url, likes_count").order("likes_count", { ascending: false }).limit(20),
    supabase.from("videos").select("caption").order("created_at", { ascending: false }).limit(200),
  ]);

  // Tagar tren: hitung #tag dari caption video terbaru.
  const counts = new Map<string, number>();
  (recent ?? []).forEach((r) =>
    (r.caption?.match(/#[\p{L}\p{N}_]+/gu) ?? []).forEach((t: string) => {
      const k = t.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    })
  );
  const trending = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-16 md:pt-8">
      <Link href="/search?q=%23omnisocial" className="block rounded-2xl bg-gradient-to-r from-brand via-fuchsia-600 to-indigo-600 p-6 md:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">Event pilihan</p>
        <h1 className="mt-1 text-2xl font-extrabold md:text-4xl">#TantanganOmni</h1>
        <p className="mt-1 max-w-md text-sm text-white/90">Ikuti tantangan minggu ini dan tampil di halaman Jelajahi.</p>
      </Link>

      <h2 className="mb-3 mt-8 font-bold">Kategori</h2>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/search?q=${encodeURIComponent("#" + c.toLowerCase())}`} className="shrink-0 rounded-full bg-neutral-800 px-4 py-2 text-sm font-semibold hover:bg-neutral-700">
            {c}
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-bold">Tagar sedang tren</h2>
      {trending.length === 0 ? (
        <p className="text-sm text-neutral-500">Belum ada tagar. Tambahkan #tagar di caption videomu.</p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2">
          {trending.map(([tag, n], i) => (
            <li key={tag}>
              <Link href={`/search?q=${encodeURIComponent(tag)}`} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3 hover:bg-neutral-800">
                <span className="w-6 text-center font-extrabold text-brand">{i + 1}</span>
                <span className="font-semibold">{tag}</span>
                <span className="ml-auto text-xs text-neutral-400">{n} video</span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <h2 className="mb-3 mt-8 font-bold">Video populer</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {(top ?? []).map((v) => (
          <VideoThumb key={v.id} id={v.id} url={v.video_url} likes={v.likes_count} />
        ))}
      </div>
    </div>
  );
}
