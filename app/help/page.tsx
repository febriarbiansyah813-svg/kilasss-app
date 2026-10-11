export const metadata = { title: "Bantuan — OmniSocial" };

const FAQ = [
  ["Bagaimana cara mengunggah video?", "Masuk ke akunmu, lalu pilih Unggah di sidebar."],
  ["Bagaimana cara mengikuti kreator?", "Buka profil atau video kreator, lalu tekan tombol Ikuti."],
  ["Lupa kata sandi?", "Gunakan opsi pemulihan di halaman Masuk."],
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-16 md:pt-8">
      <h1 className="text-2xl font-extrabold">Bantuan</h1>
      <div className="mt-4 space-y-2">
        {FAQ.map(([q, a]) => (
          <details key={q} className="rounded-lg bg-neutral-900 p-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-sm text-neutral-300">{a}</p>
          </details>
        ))}
      </div>

      <h2 id="lapor" className="mt-10 scroll-mt-20 text-xl font-bold">Laporkan masalah</h2>
      <p className="mt-1 text-sm text-neutral-400">Ceritakan masalahnya; laporan akan dikirim lewat email.</p>
      <form action="mailto:support@omnisocial.example" method="post" encType="text/plain" className="mt-3">
        <textarea name="Laporan" rows={5} required className="w-full rounded-lg bg-neutral-900 p-3 text-sm focus:outline-none" placeholder="Jelaskan masalah yang kamu alami…" />
        <button className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold">Kirim laporan</button>
      </form>
    </div>
  );
}
