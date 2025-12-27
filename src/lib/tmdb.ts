import "server-only";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

// Types
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  adult: boolean;
}

export interface MovieDetails extends Omit<Movie, "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  imdb_id: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

// Helper functions
async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export function getImageUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) {
    return "/placeholder-movie.png";
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "w1280"
): string {
  if (!path) {
    return "/placeholder-backdrop.png";
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// API Functions with caching
export async function getTrendingMovies(
  locale: string = "en",
  timeWindow: "day" | "week" = "week"
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("trending");
  cacheTag("trending");

  return tmdbFetch<PaginatedResponse<Movie>>(`/trending/movie/${timeWindow}`, {
    language: locale,
  });
}

export async function getPopularMovies(
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("trending");
  cacheTag("popular");

  return tmdbFetch<PaginatedResponse<Movie>>("/movie/popular", {
    language: locale,
    page: String(page),
  });
}

export async function getTopRatedMovies(
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("trending");
  cacheTag("top-rated");

  return tmdbFetch<PaginatedResponse<Movie>>("/movie/top_rated", {
    language: locale,
    page: String(page),
  });
}

export async function getNowPlayingMovies(
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("trending");
  cacheTag("now-playing");

  return tmdbFetch<PaginatedResponse<Movie>>("/movie/now_playing", {
    language: locale,
    page: String(page),
  });
}

export async function getUpcomingMovies(
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("trending");
  cacheTag("upcoming");

  return tmdbFetch<PaginatedResponse<Movie>>("/movie/upcoming", {
    language: locale,
    page: String(page),
  });
}

export async function getMovieDetails(
  movieId: number,
  locale: string = "en"
): Promise<MovieDetails> {
  "use cache";
  cacheLife("movie");
  cacheTag(`movie-${movieId}`);

  return tmdbFetch<MovieDetails>(`/movie/${movieId}`, {
    language: locale,
  });
}

export async function getMovieCredits(
  movieId: number,
  locale: string = "en"
): Promise<Credits> {
  "use cache";
  cacheLife("movie");
  cacheTag(`movie-${movieId}-credits`);

  return tmdbFetch<Credits>(`/movie/${movieId}/credits`, {
    language: locale,
  });
}

export async function getMovieRecommendations(
  movieId: number,
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("movie");
  cacheTag(`movie-${movieId}-recommendations`);

  return tmdbFetch<PaginatedResponse<Movie>>(
    `/movie/${movieId}/recommendations`,
    {
      language: locale,
      page: String(page),
    }
  );
}

export async function getSimilarMovies(
  movieId: number,
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("movie");
  cacheTag(`movie-${movieId}-similar`);

  return tmdbFetch<PaginatedResponse<Movie>>(`/movie/${movieId}/similar`, {
    language: locale,
    page: String(page),
  });
}

export async function searchMovies(
  query: string,
  locale: string = "en",
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("search");
  cacheTag("search");

  return tmdbFetch<PaginatedResponse<Movie>>("/search/movie", {
    query,
    language: locale,
    page: String(page),
    include_adult: "false",
  });
}

export async function getGenres(locale: string = "en"): Promise<Genre[]> {
  "use cache";
  cacheLife("genres");
  cacheTag("genres");

  const response = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {
    language: locale,
  });

  return response.genres;
}

export async function discoverMovies(
  locale: string = "en",
  options: {
    page?: number;
    sort_by?: string;
    with_genres?: string;
    year?: number;
    vote_average_gte?: number;
  } = {}
): Promise<PaginatedResponse<Movie>> {
  "use cache";
  cacheLife("search");
  cacheTag("discover");

  const params: Record<string, string> = {
    language: locale,
    page: String(options.page || 1),
    sort_by: options.sort_by || "popularity.desc",
    include_adult: "false",
  };

  if (options.with_genres) {
    params.with_genres = options.with_genres;
  }

  if (options.year) {
    params.primary_release_year = String(options.year);
  }

  if (options.vote_average_gte) {
    params["vote_average.gte"] = String(options.vote_average_gte);
  }

  return tmdbFetch<PaginatedResponse<Movie>>("/discover/movie", params);
}
