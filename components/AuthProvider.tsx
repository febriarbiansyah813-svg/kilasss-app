"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon } from "./icons";

export type SessionUser = { id: string; username: string; avatar_url: string | null } | null;

type Ctx = { user: SessionUser; openAuthModal: (reason?: string) => void };
const AuthCtx = createContext<Ctx>({ user: null, openAuthModal: () => {} });

export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const pathname = usePathname();

  const openAuthModal = useCallback((r = "Masuk untuk melanjutkan") => {
    setReason(r);
    setOpen(true);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const next = encodeURIComponent(pathname || "/");

  return (
    <AuthCtx.Provider value={{ user, openAuthModal }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setOpen(false)} aria-label="Tutup" className="absolute right-3 top-3 text-neutral-400 hover:text-white">
              <CloseIcon />
            </button>
            <h2 className="text-xl font-extrabold">
              Omni<span className="text-brand">Social</span>
            </h2>
            <p className="mt-2 text-sm text-neutral-300">{reason}</p>
            <Link href={`/login?next=${next}`} className="mt-5 block rounded-md bg-brand py-2.5 font-semibold hover:opacity-90">
              Masuk
            </Link>
            <Link href={`/signup?next=${next}`} className="mt-2 block rounded-md border border-neutral-700 py-2.5 font-semibold hover:bg-white/10">
              Daftar
            </Link>
          </div>
        </div>
      )}
    </AuthCtx.Provider>
  );
}
