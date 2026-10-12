"use client";

import { useState } from "react";

// Ganti dengan alamat email dukungan Anda yang sebenarnya.
const SUPPORT_EMAIL = "support@omnisocial.example";

export default function ReportForm() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `${text.trim()}\n\n---\nHalaman: ${location.href}\nPerangkat: ${navigator.userAgent}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Laporan masalah OmniSocial")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        required
        maxLength={1500}
        className="w-full rounded-lg bg-neutral-900 p-3 text-sm focus:outline-none"
        placeholder="Jelaskan masalah yang kamu alami…"
      />
      <button className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold">Kirim laporan</button>
      {sent && <p className="mt-2 text-xs text-neutral-400">Aplikasi email Anda dibuka. Tekan kirim di sana untuk menyelesaikan.</p>}
    </form>
  );
}
