"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_MB = 50; // sesuaikan dengan batas bucket di schema.sql (52428800 byte)
const MAX_SECONDS = 180;
const EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export default function UploadForm({ userId, username }: { userId: string; username: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;

    if (!EXT_BY_TYPE[f.type]) {
      setError("Format tidak didukung. Gunakan MP4, WebM, atau MOV.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const path = `${userId}/${crypto.randomUUID()}.${EXT_BY_TYPE[file.type]}`;

    try {
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);

      const { error: insErr } = await supabase.from("videos").insert({
        user_id: userId,
        video_url: pub.publicUrl,
        storage_path: path,
        caption: caption.trim(),
      });
      if (insErr) {
        await supabase.storage.from("videos").remove([path]); // jangan tinggalkan file yatim
        throw insErr;
      }

      router.push(`/u/${username}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah video.");
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!previewUrl ? (
        <label className="flex h-72 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 text-center hover:border-neutral-500">
          <span className="text-4xl">⬆️</span>
          <span className="font-medium">Pilih video dari perangkat</span>
          <span className="text-xs text-neutral-500">
            MP4 / WebM / MOV · maks. {MAX_MB} MB · maks. {MAX_SECONDS / 60} menit
          </span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={onPick}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-2">
          <video
            src={previewUrl}
            controls
            playsInline
            onLoadedMetadata={(e) => {
              if (e.currentTarget.duration > MAX_SECONDS) {
                setError(`Durasi video maksimal ${MAX_SECONDS / 60} menit.`);
                setFile(null);
                setPreviewUrl(null);
              }
            }}
            className="mx-auto max-h-[55vh] rounded-xl bg-black"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
            }}
            disabled={uploading}
            className="text-sm text-neutral-400 underline"
          >
            Ganti video
          </button>
        </div>
      )}

      <div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={150}
          rows={3}
          placeholder="Tulis keterangan video…"
          className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm outline-none focus:border-neutral-500"
        />
        <p className="text-right text-xs text-neutral-500">{caption.length}/150</p>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full rounded-lg bg-brand py-3 text-sm font-semibold disabled:opacity-50"
      >
        {uploading ? "Mengunggah… jangan tutup halaman ini" : "Unggah"}
      </button>
    </form>
  );
}
