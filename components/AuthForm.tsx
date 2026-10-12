"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/utils";

type Props = { mode: "login" | "signup"; next: string; initialError?: string | null };

const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;

export default function AuthForm({ mode, next, initialError = null }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (!isSignup) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
        return;
      }

      const uname = username.trim().toLowerCase();
      if (!USERNAME_RE.test(uname)) {
        throw new Error("Username 3–24 karakter: huruf kecil, angka, titik, atau underscore.");
      }
      if (password.length < 8) throw new Error("Password minimal 8 karakter.");

      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", uname)
        .maybeSingle();
      if (taken) throw new Error("Username sudah dipakai. Coba yang lain.");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: uname, full_name: fullName.trim() },
          emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;

      if (data.session) {
        // Konfirmasi email dimatikan -> langsung login
        router.replace(next);
        router.refresh();
      } else {
        setInfo("Kami sudah mengirim email konfirmasi. Klik tautan di email untuk mengaktifkan akun.");
      }
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setError(translateAuthError(error.message));
  }

  const input =
    "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-neutral-500";

  return (
    <div className="mx-auto w-full max-w-sm px-4 pb-10 pt-16 md:pt-10">
      <h1 className="mb-6 text-2xl font-bold">{isSignup ? "Buat akun" : "Masuk ke OmniSocial"}</h1>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-900"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
        </svg>
        Lanjutkan dengan Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-neutral-500">
        <div className="h-px flex-1 bg-neutral-800" /> atau <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {isSignup && (
          <>
            <input
              className={input}
              placeholder="Nama lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              maxLength={60}
            />
            <input
              className={input}
              placeholder="Username (huruf kecil, angka, . _)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              maxLength={24}
            />
          </>
        )}
        <input
          className={input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className={input}
          type="password"
          placeholder="Password (min. 8 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={8}
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}
        {info && <p className="text-sm text-emerald-400">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Memproses…" : isSignup ? "Daftar" : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        {isSignup ? (
          <>
            Sudah punya akun?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-white underline">
              Masuk
            </Link>
          </>
        ) : (
          <>
            Belum punya akun?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-white underline">
              Daftar
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
