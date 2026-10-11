import Link from "next/link";
import { formatCount } from "@/lib/utils";

export default function VideoThumb({ id, url, likes }: { id: string; url: string; likes: number }) {
  return (
    <Link href={`/v/${id}`} className="relative block aspect-[9/16] overflow-hidden rounded-lg bg-neutral-900">
      <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      <span className="absolute bottom-1.5 left-2 text-xs font-semibold drop-shadow">♥ {formatCount(likes)}</span>
    </Link>
  );
}
