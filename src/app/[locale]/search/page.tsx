import { getTranslations } from "next-intl/server";
import {
  searchMovies,
  getTrendingMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from "@/lib/tmdb";
import { MovieCard } from "@/components/movie-card";
import { SearchBar } from "@/components/search-bar";
import { SearchX } from "lucide-react";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const { q: query, category, page: pageStr } = await searchParams;
  const t = await getTranslations("search");
  const page = parseInt(pageStr || "1");

  let movies;
  let title = t("title");

  if (query) {
    movies = await searchMovies(query, locale, page);
    title = `${t("results")} "${query}"`;
  } else if (category) {
    switch (category) {
      case "trending":
        movies = await getTrendingMovies(locale, "week");
        break;
      case "popular":
        movies = await getPopularMovies(locale, page);
        break;
      case "now_playing":
        movies = await getNowPlayingMovies(locale, page);
        break;
      case "upcoming":
        movies = await getUpcomingMovies(locale, page);
        break;
      default:
        movies = await getPopularMovies(locale, page);
    }
  } else {
    movies = null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
          <div className="flex justify-center">
            <SearchBar locale={locale} initialQuery={query || ""} />
          </div>
        </div>

        {/* Results */}
        {movies ? (
          movies.results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    voteAverage={movie.vote_average}
                    releaseDate={movie.release_date}
                    locale={locale}
                  />
                ))}
              </div>

              {/* Pagination */}
              {movies.total_pages > 1 && (
                <div className="flex justify-center gap-4 mt-12">
                  {page > 1 && (
                    <a
                      href={`/${locale}/search?${query ? `q=${query}&` : ""}${
                        category ? `category=${category}&` : ""
                      }page=${page - 1}`}
                      className="btn-secondary"
                    >
                      Previous
                    </a>
                  )}
                  <span className="flex items-center px-4 text-[var(--foreground-muted)]">
                    Page {page} of {movies.total_pages}
                  </span>
                  {page < movies.total_pages && (
                    <a
                      href={`/${locale}/search?${query ? `q=${query}&` : ""}${
                        category ? `category=${category}&` : ""
                      }page=${page + 1}`}
                      className="btn-primary"
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <SearchX className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-subtle)]" />
              <h2 className="text-xl font-semibold mb-2">
                {t("noResults")} "{query}"
              </h2>
              <p className="text-[var(--foreground-muted)]">
                {t("tryDifferent")}
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-20 text-[var(--foreground-muted)]">
            <p>Enter a search term to find movies</p>
          </div>
        )}
      </div>
    </div>
  );
}
