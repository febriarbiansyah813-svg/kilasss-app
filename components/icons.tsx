type IconProps = { className?: string; size?: number };

export function HeartIcon({ filled, className, size = 26 }: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export function CommentIcon({ className, size = 26 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-4.9A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

export function VolumeIcon({ muted, className, size = 20 }: IconProps & { muted?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a10 10 0 0 1 0 14" />
        </>
      )}
    </svg>
  );
}

export function PlayIcon({ className, size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function CloseIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function HomeIcon({ filled, className, size = 28 }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} {...base} fill={filled ? "currentColor" : "none"} className={className}>
      <path d="M3 10.8 12 3l9 7.8V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function CompassIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

export function FollowingIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <circle cx="9" cy="7.5" r="4" />
      <path d="M3 21v-1a5 5 0 0 1 5-5h2" />
      <path d="M21 17h-7m3-3-3 3 3 3" />
    </svg>
  );
}

export function FilmIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
      <path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" />
    </svg>
  );
}

export function LiveIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="m8 2 4 4 4-4" />
      <path d="M8 17v-3M12 17v-6M16 17v-4" />
    </svg>
  );
}

export function PlusSquareIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function UserIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

export function MoreIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export function SearchIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20.5 20.5-4-4" />
    </svg>
  );
}

export function SidebarToggleIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <rect x="6.5" y="6.5" width="4" height="11" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BookmarkIcon({ filled, className, size = 26 }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} {...base} fill={filled ? "currentColor" : "none"} className={className}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}
