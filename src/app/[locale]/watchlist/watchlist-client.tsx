"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Loader2, Star } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { removeFromWatchlist } from "@/lib/actions";

interface WatchlistItem {
  id: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  addedAt: Date;
}

interface WatchlistClientProps {
  initialItems: WatchlistItem[];
  locale: string;
}

export function WatchlistClient({
  initialItems,
  locale,
}: WatchlistClientProps) {
  const [items, setItems] = useState(initialItems);
  const t = useTranslations("watchlist");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <WatchlistItemCard
          key={item.id}
          item={item}
          locale={locale}
          onRemove={() =>
            setItems((prev) => prev.filter((i) => i.id !== item.id))
          }
        />
      ))}
    </div>
  );
}

interface WatchlistItemCardProps {
  item: WatchlistItem;
  locale: string;
  onRemove: () => void;
}

function WatchlistItemCard({ item, locale, onRemove }: WatchlistItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("watchlist");

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeFromWatchlist(item.movieId);
      if (result.success) {
        onRemove();
      }
    });
  };

  const rating = item.voteAverage
    ? Math.round(item.voteAverage * 10) / 10
    : null;
  const addedDate = new Date(item.addedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="glass glass-hover rounded-xl overflow-hidden group">
      <Link href={`/${locale}/movie/${item.movieId}`}>
        <div className="relative aspect-[2/3]">
          <Image
            src={getImageUrl(item.posterPath, "w500")}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{rating}</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/${locale}/movie/${item.movieId}`}>
          <h3 className="font-semibold line-clamp-2 mb-2 hover:text-[var(--color-accent)] transition-colors">
            {item.title}
          </h3>
        </Link>

        <p className="text-xs text-[var(--foreground-muted)] mb-4">
          {t("addedOn")} {addedDate}
        </p>

        <button
          onClick={handleRemove}
          disabled={isPending}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {t("remove")}
        </button>
      </div>
    </div>
  );
}
