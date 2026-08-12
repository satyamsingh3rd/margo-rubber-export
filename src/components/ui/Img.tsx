import NextImage from "next/image";
import { getImage } from "@/content/images";

/**
 * The ONLY way an image reaches the page.
 *
 * Takes a registry key, never a path. Width/height/alt come from the registry,
 * so CLS is structurally impossible and alt text can't be forgotten. Swapping
 * the underlying file is a one-line change in images.ts.
 */
export function Img({
  k,
  className,
  priority = false,
  sizes,
  fill = false,
}: {
  k: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
}) {
  const img = getImage(k);

  if (fill) {
    return (
      <NextImage
        src={img.src}
        alt={img.alt}
        fill
        priority={priority}
        sizes={sizes ?? "100vw"}
        className={className}
      />
    );
  }

  return (
    <NextImage
      src={img.src}
      alt={img.alt}
      width={img.w}
      height={img.h}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
