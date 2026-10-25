const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** Public images and video need the repository prefix on GitHub Pages. */
export function assetPath(path: string): string {
  return `${basePath}${path}`;
}
