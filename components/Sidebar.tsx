"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import Avatar from "./Avatar";
import { useSearch } from "./SearchOverlay";
import {
  CompassIcon, FilmIcon, FollowingIcon, HomeIcon, LiveIcon, MoreIcon,
  PlusSquareIcon, SearchIcon, SidebarToggleIcon, UserIcon,
} from "./icons";

// 1. Definisikan interface props agar menerima username dari Navbar
interface SidebarProps {
  username?: string | null;
}

export default function Sidebar({ username }: SidebarProps) {
  const { user, openAuthModal } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { openSearch } = useSearch();
  const [light, setLight] = useState(false);
  // Popover memakai posisi fixed agar tidak terpotong oleh sidebar (overflow).
  const [pop, setPop] = useState<{ kind: "more" | "profile"; left: number; bottom: number } | null>(null);

  function togglePop(kind: "more" | "profile", el: HTMLElement) {
    if (pop?.kind === kind) return setPop(null);
    const r = el.getBoundingClientRect();
    setPop({ kind, left: r.left, bottom: window.innerHeight - r.top + 8 });
  }

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "light";
    setLight(saved);
    document.documentElement.dataset.theme = saved ? "light" : "dark";
  }, []);

  useEffect(() => setPop(null), [pathname]);
  useEffect(() => {
    if (!pop) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPop(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pop]);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    localStorage.setItem("theme", next ? "light" : "dark");
    document.documentElement.dataset.theme = next ? "light" : "dark";
  }

  async function logout() {
    await createClient().auth.signOut();
    setPop(null);
    router.replace("/");
    router.refresh();
  }

  const is = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const profileHref = user ? `/u/${user.username}` : "/login";

  const items = [
    { label: "Saran", href: "/", icon: (a: boolean) => <HomeIcon filled={a} />, active: is("/") },
    { label: "Jelajahi", href: "/explore", icon: () => <CompassIcon />, active: is("/explore") },
    { label: "Mengikuti", href: "/following", icon: () => <FollowingIcon />, active: is("/following") },
    { label: "Mini drama", href: "/drama", icon: () => <FilmIcon />, active: is("/drama"), dot: true },
    { label: "LIVE", href: "/live", icon: () => <LiveIcon />, active: is("/live") },
    { label: "Unggah", href: "/upload", icon: () => <PlusSquareIcon />, active: is("/upload"), auth: true },
    { label: "Profil", href: profileHref, icon: () => <UserIcon />, active: !!user && is(`/u/${user.username}`) },
  ];

  const itemCls = (active?: boolean) =>
    `flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left text-[17px] font-bold transition-colors hover:bg-white/10 ${
      active ? "text-brand" : "text-white"
    } ${collapsed ? "justify-center" : "lg:justify-start max-lg:justify-center"}`;
  const label = collapsed ? "hidden" : "hidden lg:inline";

  const popItem = "block w-full px-4 py-2.5 text-left hover:bg-white/10";

  return (
    <>
      {/* ===== Desktop / tablet: sidebar kiri ===== */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-neutral-900 bg-black px-3 py-5 md:flex ${
          collapsed ? "w-[76px]" : "w-[76px] lg:w-[240px]"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-center lg:justify-between lg:px-2"}`}>
          <Link href="/" className={`text-2xl font-extrabold tracking-tight ${collapsed ? "hidden" : "hidden lg:block"}`}>
            OmniSocial<span className="text-brand">.</span>
          </Link>
          <Link href="/" aria-label="OmniSocial" className={`text-2xl font-extrabold ${collapsed ? "" : "lg:hidden"}`}>
            O<span className="text-brand">.</span>
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Ciutkan / perluas sidebar"
            className={`rounded-md p-1 text-neutral-300 hover:bg-white/10 hover:text-white ${collapsed ? "hidden" : "hidden lg:block"}`}
          >
            <SidebarToggleIcon />
          </button>
        </div>

        <div className={`mt-5 ${collapsed ? "hidden" : "hidden lg:block"}`}>
          <button
            onClick={openSearch}
            className="flex h-11 w-full items-center gap-2 rounded-full bg-neutral-800/80 px-4 text-left text-[15px] text-neutral-500 hover:bg-neutral-800"
          >
            <SearchIcon className="text-neutral-400" />
            Cari
          </button>
        </div>
        <button
          onClick={openSearch}
          aria-label="Cari"
          className={`mt-5 justify-center rounded-lg py-2.5 hover:bg-white/10 ${collapsed ? "flex" : "flex lg:hidden"}`}
        >
          <SearchIcon size={28} />
        </button>

        <nav className="mt-3 flex flex-1 flex-col gap-0.5">
          {items.map((it) => {
            const guarded = it.auth && !user;
            const content = (
              <>
                <span className="relative">
                  {it.icon(!!it.active)}
                  {it.dot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand" />}
                </span>
                <span className={label}>{it.label}</span>
              </>
            );
            return guarded ? (
              <button key={it.label} onClick={() => openAuthModal("Masuk untuk mengunggah video")} className={itemCls(false)}>
                {content}
              </button>
            ) : (
              <Link key={it.label} href={it.href} title={it.label} className={itemCls(it.active)}>
                {content}
              </Link>
            );
          })}

          {/* Lainnya */}
          <button
            onClick={(e) => togglePop("more", e.currentTarget)}
            className={itemCls(false)}
            aria-haspopup="menu"
            aria-expanded={pop?.kind === "more"}
          >
            <MoreIcon />
            <span className={label}>Lainnya</span>
          </button>
        </nav>

        {/* Area Masuk/Daftar atau profil */}
        <div className="mt-4 border-t border-neutral-900 pt-4">
          {user ? (
            <button
              onClick={(e) => togglePop("profile", e.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={pop?.kind === "profile"}
              className={`flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-white/10 ${collapsed ? "justify-center" : "max-lg:justify-center"}`}
            >
              <Avatar src={user.avatar_url} name={user.username} size={36} />
              <span className={`min-w-0 flex-1 ${label}`}>
                <span className="block truncate text-sm font-bold">@{user.username}</span>
                <span className="block text-xs text-neutral-400">Akun saya ▾</span>
              </span>
            </button>
          ) : (
            <div className={collapsed ? "hidden" : "hidden lg:block"}>
              <p className="mb-3 text-xs text-neutral-400">Masuk untuk mengikuti kreator, menyukai video, dan berkomentar.</p>
              <Link href="/login" className="block rounded-md bg-brand py-2 text-center text-sm font-semibold hover:opacity-90">Masuk</Link>
              <Link href="/signup" className="mt-2 block rounded-md border border-neutral-700 py-2 text-center text-sm font-semibold hover:bg-white/10">Daftar</Link>
            </div>
          )}
          {!user && (
            <Link href="/login" aria-label="Masuk" className={`justify-center rounded-lg py-2.5 hover:bg-white/10 ${collapsed ? "flex" : "flex lg:hidden"}`}>
              <UserIcon />
            </Link>
          )}
        </div>
      </aside>

      {pop && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPop(null)} />
          <div
            role="menu"
            style={{ left: pop.left, bottom: pop.bottom }}
            className="fixed z-50 w-56 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 py-1 text-sm shadow-xl"
          >
            {pop.kind === "more" ? (
              <>
                <Link href="/settings/profile" className={popItem}>Pengaturan</Link>
                <button onClick={toggleTheme} className={popItem}>Mode {light ? "Gelap" : "Terang"}</button>
                <Link href="/help" className={popItem}>Bantuan</Link>
                <Link href="/help#lapor" className={popItem}>Laporkan masalah</Link>
              </>
            ) : (
              <>
                <Link href={profileHref} className={popItem}>Profil Saya</Link>
                <Link href="/saved" className={popItem}>Video Disimpan</Link>
                <Link href="/settings/profile" className={popItem}>Pengaturan Akun</Link>
                <button onClick={logout} className={`${popItem} border-t border-neutral-800 text-rose-400`}>Keluar</button>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== Mobile: header atas ===== */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 md:hidden">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          OmniSocial<span className="text-brand">.</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/upload" aria-label="Unggah"><PlusSquareIcon size={24} /></Link>
          ) : (
            <button onClick={() => openAuthModal("Masuk untuk mengunggah video")} aria-label="Unggah"><PlusSquareIcon size={24} /></button>
          )}
          <button onClick={openSearch} aria-label="Cari"><SearchIcon size={24} /></button>
        </div>
      </header>

      {/* ===== Mobile: bottom navigation ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-neutral-900 bg-black/95 backdrop-blur md:hidden">
        {[
          { l: "Saran", h: "/", i: <HomeIcon filled={is("/")} size={24} />, a: is("/") },
          { l: "Jelajahi", h: "/explore", i: <CompassIcon size={24} />, a: is("/explore") },
          { l: "Drama", h: "/drama", i: <FilmIcon size={24} />, a: is("/drama") },
          { l: "LIVE", h: "/live", i: <LiveIcon size={24} />, a: is("/live") },
          { l: "Profil", h: profileHref, i: <UserIcon size={24} />, a: !!user && is(`/u/${user.username}`) },
        ].map((t) => (
          <Link key={t.l} href={t.h} className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${t.a ? "text-brand" : "text-white"}`}>
            {t.i}
            {t.l}
          </Link>
        ))}
      </nav>
    </>
  );
}
