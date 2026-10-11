"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CompassIcon,
  FilmIcon,
  FollowingIcon,
  HomeIcon,
  LiveIcon,
  MoreIcon,
  PlusSquareIcon,
  SearchIcon,
  SidebarToggleIcon,
  UserIcon,
} from "./icons";

type Props = { username: string | null };

export default function Sidebar({ username }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup menu "Lainnya" saat klik di luar.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  async function logout() {
    await createClient().auth.signOut();
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  const profileHref = username ? `/u/${username}` : "/login";

  const items = [
    { label: "Saran", href: "/", icon: (a: boolean) => <HomeIcon filled={a} />, active: pathname === "/" },
    { label: "Jelajahi", href: null, icon: () => <CompassIcon /> },
    { label: "Mengikuti", href: null, icon: () => <FollowingIcon /> },
    { label: "Mini drama", href: null, icon: () => <FilmIcon />, dot: true },
    { label: "LIVE", href: null, icon: () => <LiveIcon /> },
    {
      label: "Unggah",
      href: username ? "/upload" : "/login",
      icon: () => <PlusSquareIcon />,
      active: pathname.startsWith("/upload"),
    },
    {
      label: "Profil",
      href: profileHref,
      icon: () => <UserIcon />,
      active: !!username && pathname.startsWith(`/u/${username}`),
    },
  ];

  const itemCls = (active?: boolean) =>
    `flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left text-[17px] font-bold transition-colors hover:bg-white/10 ${
      active ? "text-brand" : "text-white"
    } ${collapsed ? "justify-center" : ""}`;

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className={`hidden h-dvh shrink-0 flex-col border-r border-neutral-900 bg-black px-3 py-5 md:flex ${
          collapsed ? "w-[76px]" : "w-[240px]"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
          {!collapsed && (
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              OmniSocial<span className="text-brand">.</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className="rounded-md p-1 text-neutral-300 hover:bg-white/10 hover:text-white"
          >
            <SidebarToggleIcon />
          </button>
        </div>

        {!collapsed && (
          <div className="mt-5 flex h-11 items-center gap-2 rounded-full bg-neutral-800/80 px-4 text-neutral-400">
            <SearchIcon />
            <input
              type="search"
              placeholder="Cari"
              className="w-full bg-transparent text-[15px] text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        )}

        <nav className={`${collapsed ? "mt-6" : "mt-4"} flex flex-col gap-0.5`}>
          {items.map((it) => {
            const active = !!it.active;
            const content = (
              <>
                <span className="relative">
                  {it.icon(active)}
                  {it.dot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand" />}
                </span>
                {!collapsed && <span>{it.label}</span>}
              </>
            );
            return it.href ? (
              <Link key={it.label} href={it.href} title={it.label} className={itemCls(active)}>
                {content}
              </Link>
            ) : (
              <button key={it.label} type="button" title={`${it.label} (segera hadir)`} className={itemCls(false)}>
                {content}
              </button>
            );
          })}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              title="Lainnya"
              onClick={() => setMenuOpen((o) => !o)}
              className={itemCls(false)}
            >
              <MoreIcon />
              {!collapsed && <span>Lainnya</span>}
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 py-1 text-sm shadow-xl">
                {username ? (
                  <button onClick={logout} className="block w-full px-4 py-2.5 text-left hover:bg-white/10">
                    Keluar
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2.5 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                      Masuk
                    </Link>
                    <Link href="/signup" className="block px-4 py-2.5 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Bar bawah untuk layar kecil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-neutral-900 bg-black/95 backdrop-blur md:hidden">
        <Link href="/" aria-label="Saran" className={pathname === "/" ? "text-brand" : "text-white"}>
          <HomeIcon filled={pathname === "/"} />
        </Link>
        <Link href={username ? "/upload" : "/login"} aria-label="Unggah" className="text-white">
          <PlusSquareIcon />
        </Link>
        <Link href={profileHref} aria-label="Profil" className="text-white">
          <UserIcon />
        </Link>
        {username ? (
          <button onClick={logout} aria-label="Keluar" className="text-white">
            <MoreIcon />
          </button>
        ) : (
          <Link href="/login" aria-label="Masuk" className="text-white">
            <MoreIcon />
          </Link>
        )}
      </nav>
    </>
  );
}
