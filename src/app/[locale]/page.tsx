import { getTranslations } from "next-intl/server";
import {
  getTrendingMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from "@/lib/tmdb";
import { MovieCard } from "@/components/movie-card";
import { SearchBar } from "@/components/search-bar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const [trending, popular, nowPlaying, upcoming] = await Promise.all([
    getTrendingMovies(locale, "week"),
    getPopularMovies(locale),
    getNowPlayingMovies(locale),
    getUpcomingMovies(locale),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-purple-500/10" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient">{t("hero.title")}</span>
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex justify-center pt-4">
              <SearchBar locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Movies */}
      <MovieSection
        title={t("trending")}
        movies={trending.results.slice(0, 6)}
        locale={locale}
        viewAllHref={`/${locale}/search?category=trending`}
      />

      {/* Popular Movies */}
      <MovieSection
        title={t("popular")}
        movies={popular.results.slice(0, 6)}
        locale={locale}
        viewAllHref={`/${locale}/search?category=popular`}
      />

      {/* Now Playing */}
      <MovieSection
        title={t("nowPlaying")}
        movies={nowPlaying.results.slice(0, 6)}
        locale={locale}
        viewAllHref={`/${locale}/search?category=now_playing`}
      />

      {/* Upcoming */}
      <MovieSection
        title={t("upcoming")}
        movies={upcoming.results.slice(0, 6)}
        locale={locale}
        viewAllHref={`/${locale}/search?category=upcoming`}
      />
    </div>
  );
}

interface MovieSectionProps {
  title: string;
  movies: Array<{
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date: string;
  }>;
  locale: string;
  viewAllHref: string;
}

function MovieSection({
  title,
  movies,
  locale,
  viewAllHref,
}: MovieSectionProps) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
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
      </div>
    </section>
  );
}
