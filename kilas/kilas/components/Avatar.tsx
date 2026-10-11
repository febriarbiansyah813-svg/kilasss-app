type Props = { src?: string | null; name: string; size?: number };

export default function Avatar({ src, name, size = 40 }: Props) {
  const style = { width: size, height: size };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className="shrink-0 rounded-full bg-neutral-800 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      style={{ ...style, fontSize: size * 0.4 }}
      className="grid shrink-0 place-items-center rounded-full bg-neutral-700 font-semibold"
      aria-label={name}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}
