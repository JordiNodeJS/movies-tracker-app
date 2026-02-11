import "server-only";
import { unstable_cache } from "next/cache";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN?.trim();

if (!ACCESS_TOKEN) {
  console.error(
    "❌ CRITICAL: TMDB_ACCESS_TOKEN environment variable is not set. " +
      "The application cannot fetch movie data. " +
      "Please configure this variable in your .env file or Vercel dashboard.",
  );

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: TMDB_ACCESS_TOKEN");
  }
}

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
  params: Record<string, string> = {},
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

// API Functions with caching
export const getTrendingMovies = unstable_cache(
  async (
    locale: string = "en",
    timeWindow: "day" | "week" = "week",
  ): Promise<PaginatedResponse<Movie>> => {
    return tmdbFetch<PaginatedResponse<Movie>>(
      `/trending/movie/${timeWindow}`,
      {
        language: locale,
      },
    );
  },
  ["trending"],
  { revalidate: 3600, tags: ["trending"] },
);

export const getPopularMovies = unstable_cache(
  async (
    locale: string = "en",
    page: number = 1,
  ): Promise<PaginatedResponse<Movie>> => {
    return tmdbFetch<PaginatedResponse<Movie>>("/movie/popular", {
      language: locale,
      page: String(page),
    });
  },
  ["popular"],
  { revalidate: 3600, tags: ["popular"] },
);

export const getTopRatedMovies = unstable_cache(
  async (
    locale: string = "en",
    page: number = 1,
  ): Promise<PaginatedResponse<Movie>> => {
    return tmdbFetch<PaginatedResponse<Movie>>("/movie/top_rated", {
      language: locale,
      page: String(page),
    });
  },
  ["top-rated"],
  { revalidate: 3600, tags: ["top-rated"] },
);

export const getNowPlayingMovies = unstable_cache(
  async (
    locale: string = "en",
    page: number = 1,
  ): Promise<PaginatedResponse<Movie>> => {
    return tmdbFetch<PaginatedResponse<Movie>>("/movie/now_playing", {
      language: locale,
      page: String(page),
    });
  },
  ["now-playing"],
  { revalidate: 3600, tags: ["now-playing"] },
);

export const getUpcomingMovies = unstable_cache(
  async (
    locale: string = "en",
    page: number = 1,
  ): Promise<PaginatedResponse<Movie>> => {
    return tmdbFetch<PaginatedResponse<Movie>>("/movie/upcoming", {
      language: locale,
      page: String(page),
    });
  },
  ["upcoming"],
  { revalidate: 3600, tags: ["upcoming"] },
);

export async function getMovieDetails(
  movieId: number,
  locale: string = "en",
): Promise<MovieDetails> {
  const cachedFn = unstable_cache(
    async () =>
      tmdbFetch<MovieDetails>(`/movie/${movieId}`, { language: locale }),
    [`movie-${movieId}-${locale}`],
    { revalidate: 86400, tags: [`movie-${movieId}`] },
  );
  return cachedFn();
}

export async function getMovieCredits(
  movieId: number,
  locale: string = "en",
): Promise<Credits> {
  const cachedFn = unstable_cache(
    async () =>
      tmdbFetch<Credits>(`/movie/${movieId}/credits`, { language: locale }),
    [`movie-${movieId}-credits-${locale}`],
    { revalidate: 86400, tags: [`movie-${movieId}-credits`] },
  );
  return cachedFn();
}

export async function getMovieRecommendations(
  movieId: number,
  locale: string = "en",
  page: number = 1,
): Promise<PaginatedResponse<Movie>> {
  const cachedFn = unstable_cache(
    async () =>
      tmdbFetch<PaginatedResponse<Movie>>(`/movie/${movieId}/recommendations`, {
        language: locale,
        page: String(page),
      }),
    [`movie-${movieId}-recommendations-${locale}-${page}`],
    { revalidate: 86400, tags: [`movie-${movieId}-recommendations`] },
  );
  return cachedFn();
}

export async function getSimilarMovies(
  movieId: number,
  locale: string = "en",
  page: number = 1,
): Promise<PaginatedResponse<Movie>> {
  const cachedFn = unstable_cache(
    async () =>
      tmdbFetch<PaginatedResponse<Movie>>(`/movie/${movieId}/similar`, {
        language: locale,
        page: String(page),
      }),
    [`movie-${movieId}-similar-${locale}-${page}`],
    { revalidate: 86400, tags: [`movie-${movieId}-similar`] },
  );
  return cachedFn();
}

export async function searchMovies(
  query: string,
  locale: string = "en",
  page: number = 1,
): Promise<PaginatedResponse<Movie>> {
  const cachedFn = unstable_cache(
    async () =>
      tmdbFetch<PaginatedResponse<Movie>>("/search/movie", {
        query,
        language: locale,
        page: String(page),
        include_adult: "false",
      }),
    [`search-${query}-${locale}-${page}`],
    { revalidate: 300, tags: ["search"] },
  );
  return cachedFn();
}

export const getGenres = unstable_cache(
  async (locale: string = "en"): Promise<Genre[]> => {
    const response = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {
      language: locale,
    });
    return response.genres;
  },
  ["genres"],
  { revalidate: 86400, tags: ["genres"] },
);

export async function discoverMovies(
  locale: string = "en",
  options: {
    page?: number;
    sort_by?: string;
    with_genres?: string;
    year?: number;
    vote_average_gte?: number;
  } = {},
): Promise<PaginatedResponse<Movie>> {
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

  const cacheKey = `discover-${locale}-${JSON.stringify(options)}`;
  const cachedFn = unstable_cache(
    async () => tmdbFetch<PaginatedResponse<Movie>>("/discover/movie", params),
    [cacheKey],
    { revalidate: 300, tags: ["discover"] },
  );
  return cachedFn();
}
