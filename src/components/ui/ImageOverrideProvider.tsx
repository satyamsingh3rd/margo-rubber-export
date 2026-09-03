"use client";

import { createContext, useContext } from "react";
import type { ImageOverrideMap } from "@/lib/image-overrides";

/**
 * Carries the uploaded-photograph map down to every `Img`.
 *
 * A client component because `Img` is used inside client components and
 * therefore has to read this synchronously. The value is plain serialisable
 * data fetched on the server, so nothing here runs a query in the browser.
 *
 * The default is an EMPTY map, not a thrown error: an `Img` rendered outside
 * the site chrome — in the Studio, in an error page — should draw its stock
 * image rather than crash.
 */
const Ctx = createContext<ImageOverrideMap>({});

export function ImageOverrideProvider({
  value,
  children,
}: {
  value: ImageOverrideMap;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useImageOverride(key: string) {
  return useContext(Ctx)[key];
}
