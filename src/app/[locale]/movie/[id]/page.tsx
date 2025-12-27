import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieRecommendations,
  getImageUrl,
  getBackdropUrl,
} from "@/lib/tmdb";
import {
  getCurrentUser,
  isInWatchlist,
  getMovieRating,
  addToViewHistory,
} from "@/lib/actions";
import { MovieCard } from "@/components/movie-card";
import { WatchlistButton } from "./watchlist-button";
import { RatingSection } from "./rating-section";
import { Star, Clock, Calendar, DollarSign, TrendingUp } from "lucide-react";

interface MoviePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { locale, id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    notFound();
  }

  const t = await getTranslations("movie");
  const user = await getCurrentUser();

  const [movie, credits, recommendations] = await Promise.all([
    getMovieDetails(movieId, locale),
    getMovieCredits(movieId, locale),
    getMovieRecommendations(movieId, locale),
  ]);

  // Check watchlist and rating status if user is logged in
  const [inWatchlist, userRating] = user
    ? await Promise.all([isInWatchlist(movieId), getMovieRating(movieId)])
    : [false, null];

  // Add to view history if user is logged in
  if (user) {
    await addToViewHistory(movieId, movie.title, movie.poster_path);
  }

  const director = credits.crew.find((c) => c.job === "Director");
  const mainCast = credits.cast.slice(0, 8);
  const rating = Math.round(movie.vote_average * 10) / 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 via-transparent to-transparent" />
      </div>

      {/* Movie Info */}
      <div className="relative max-w-7xl mx-auto px-4 -mt-80 md:-mt-96 z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="glass rounded-xl overflow-hidden w-64 md:w-80">
              <Image
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                width={320}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xl text-[var(--color-accent)] italic">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-[var(--foreground-muted)]">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-semibold text-[var(--foreground)]">
                  {rating}
                </span>
                <span className="text-sm">({movie.vote_count} votes)</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {movie.runtime} {t("minutes")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(movie.release_date)}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full text-sm glass"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <WatchlistButton
                movieId={movieId}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
                isLoggedIn={!!user}
                inWatchlist={inWatchlist}
              />
            </div>

            {/* User Rating */}
            {user && (
              <RatingSection
                movieId={movieId}
                title={movie.title}
                posterPath={movie.poster_path}
                currentRating={userRating}
              />
            )}

            {/* Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-3">{t("overview")}</h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Director */}
            {director && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{t("director")}</h3>
                <p className="text-[var(--foreground-muted)]">
                  {director.name}
                </p>
              </div>
            )}

            {/* Budget & Revenue */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {movie.budget > 0 && (
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">{t("budget")}</span>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(movie.budget)}
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{t("revenue")}</span>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cast */}
      {mainCast.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">{t("cast")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {mainCast.map((actor) => (
              <div key={actor.id} className="glass rounded-lg overflow-hidden">
                <div className="aspect-[2/3] relative">
                  <Image
                    src={getImageUrl(actor.profile_path, "w185")}
                    alt={actor.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 12.5vw"
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-1">
                    {actor.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                    {actor.character}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.results.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">{t("recommendations")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.results.slice(0, 6).map((rec) => (
              <MovieCard
                key={rec.id}
                id={rec.id}
                title={rec.title}
                posterPath={rec.poster_path}
                voteAverage={rec.vote_average}
                releaseDate={rec.release_date}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
