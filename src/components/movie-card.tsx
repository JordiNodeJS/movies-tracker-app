"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Check } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb-utils";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  locale: string;
  inWatchlist?: boolean;
  onWatchlistToggle?: () => void;
  showWatchlistButton?: boolean;
}

export function MovieCard({
  id,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  locale,
  inWatchlist = false,
  onWatchlistToggle,
  showWatchlistButton = false,
}: MovieCardProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = Math.round(voteAverage * 10) / 10;

  const getRatingColor = (rating: number) => {
    if (rating >= 7) return "rating-high";
    if (rating >= 5) return "rating-medium";
    return "rating-low";
  };

  return (
    <div className="group relative glass glass-hover rounded-xl overflow-hidden">
      <Link href={`/${locale}/movie/${id}`} className="block">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={getImageUrl(posterPath, "w500")}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating Badge */}
          <div className="absolute top-3 left-3">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm ${getRatingColor(
                rating
              )}`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-semibold">{rating}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-[var(--color-accent)] transition-colors">
            {title}
          </h3>
          {year && (
            <p className="text-xs text-[var(--foreground-muted)]">{year}</p>
          )}
        </div>
      </Link>

      {/* Watchlist Button */}
      {showWatchlistButton && onWatchlistToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onWatchlistToggle();
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            inWatchlist
              ? "bg-[var(--color-accent)] text-black"
              : "bg-black/70 backdrop-blur-sm text-white hover:bg-[var(--color-accent)] hover:text-black"
          }`}
          aria-label={
            inWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
        >
          {inWatchlist ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="aspect-[2/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/4" />
      </div>
    </div>
  );
}
