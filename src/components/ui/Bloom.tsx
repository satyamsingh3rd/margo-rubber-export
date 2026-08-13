/**
 * Soft accent bloom. The design bleeds one of these behind most bands, and it
 * is what gives the darker pages the lift noted during the /about review.
 *
 * Extracted from HomeBlocks and AboutBlocks, which each carried a
 * byte-identical private copy. Position and size come from the caller, since
 * every placement in the comps is different; only the material is shared.
 */
export function Bloom({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`bg-accent-400/10 pointer-events-none absolute -z-10 rounded-full blur-3xl ${className}`}
    />
  );
}
