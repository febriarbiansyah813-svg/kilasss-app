"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

export default function SearchBox({ initial = "", autoFocus = false }: { initial?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const t = q.trim();
        if (t) router.push(`/search?q=${encodeURIComponent(t)}`);
      }}
      className="flex h-11 items-center gap-2 rounded-full bg-neutral-800/80 px-4 text-neutral-400 focus-within:ring-1 focus-within:ring-neutral-600"
    >
      <SearchIcon />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Cari pengguna, #tagar, atau video"
        className="w-full bg-transparent text-[15px] text-white placeholder:text-neutral-500 focus:outline-none"
      />
    </form>
  );
}
