// TMDB utilities that can be used in both client and server components
// This file intentionally does NOT have "server-only"

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type ImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

export type BackdropSize = "w300" | "w780" | "w1280" | "original";

/**
 * Get TMDB image URL
 */
export function getImageUrl(
  path: string | null,
  size: ImageSize = "w500"
): string {
  if (!path) {
    return "/placeholder-movie.svg";
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Get TMDB backdrop URL
 */
export function getBackdropUrl(
  path: string | null,
  size: BackdropSize = "w1280"
): string {
  if (!path) {
    return "/placeholder-backdrop.svg";
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}
