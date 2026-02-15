import { getAvatarStyle } from "@/lib/constants";

interface AvatarProps {
  src: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt = "Avatar", size = 24, className = "" }: AvatarProps) {
  const style = getAvatarStyle(src);

  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: style.backgroundSize,
        backgroundPosition: style.backgroundPosition,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#e2e8f0",
      }}
      role="img"
      aria-label={alt}
    />
  );
}
