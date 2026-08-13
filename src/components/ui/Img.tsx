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

  /**
   * Blur-up, but never on a priority image.
   *
   * A priority image is preloaded and is usually the LCP element, so its blur
   * would flash for a moment at best while adding ~450 bytes of base64 to the
   * critical markup, competing with the image it is standing in for. Below the
   * fold, where the image arrives long after the layout, the placeholder is
   * the entire point.
   *
   * Spread rather than passed directly: `placeholder="blur"` throws at runtime
   * if `blurDataURL` is undefined, which is the case for SVG entries.
   */
  const blurProps =
    !priority && img.blur
      ? ({ placeholder: "blur", blurDataURL: img.blur } as const)
      : {};

  if (fill) {
    return (
      <NextImage
        src={img.src}
        alt={img.alt}
        fill
        priority={priority}
        sizes={sizes ?? "100vw"}
        className={className}
        {...blurProps}
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
      {...blurProps}
    />
  );
}
