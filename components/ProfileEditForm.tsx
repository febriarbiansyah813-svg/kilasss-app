"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import Avatar from "./Avatar";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;

type Props = { profile: Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "bio"> };

export default function ProfileEditForm({ profile }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPickAvatar(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!EXT_BY_TYPE[f.type]) return setError("Avatar harus berformat JPG, PNG, atau WebP.");
    if (f.size > 2 * 1024 * 1024) return setError("Ukuran avatar maksimal 2 MB.");
    setAvatarFile(f);
    setAvatarUrl(URL.createObjectURL(f));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const uname = username.trim().toLowerCase();
    if (!USERNAME_RE.test(uname)) {
      return setError("Username 3–24 karakter: huruf kecil, angka, titik, atau underscore.");
    }

    setSaving(true);
    try {
      let finalAvatar = profile.avatar_url;
      if (avatarFile) {
        const path = `${profile.id}/${crypto.randomUUID()}.${EXT_BY_TYPE[avatarFile.type]}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { contentType: avatarFile.type, cacheControl: "31536000" });
        if (upErr) throw upErr;
        finalAvatar = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          username: uname,
          full_name: fullName.trim() || null,
          bio: bio.trim(),
          avatar_url: finalAvatar,
        })
        .eq("id", profile.id);

      if (updErr) {
        throw new Error(updErr.code === "23505" ? "Username sudah dipakai." : updErr.message);
      }

      router.push(`/u/${uname}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-neutral-500";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={username} size={72} />
        <label className="cursor-pointer rounded-md border border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-900">
          Ganti foto
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickAvatar} className="hidden" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Username</span>
        <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} required />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Nama lengkap</span>
        <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={60} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Bio</span>
        <textarea
          className={`${input} resize-none`}
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
        />
        <span className="block text-right text-xs text-neutral-500">{bio.length}/200</span>
      </label>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {saving ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
