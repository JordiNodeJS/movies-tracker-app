"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Star, Loader2 } from "lucide-react";
import { rateMovie } from "@/lib/actions";

interface RatingSectionProps {
  movieId: number;
  title: string;
  posterPath: string | null;
  currentRating: number | null;
}

export function RatingSection({
  movieId,
  title,
  posterPath,
  currentRating,
}: RatingSectionProps) {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("movie");

  const handleRate = (newRating: number) => {
    startTransition(async () => {
      const result = await rateMovie(movieId, title, posterPath, newRating);
      if (result.success) {
        setRating(newRating);
      }
    });
  };

  const displayRating = hoverRating ?? rating ?? 0;

  return (
    <div className="glass rounded-lg p-4 inline-block">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{t("userRating")}:</span>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= displayRating / 2;
            const value = star * 2;

            return (
              <button
                key={star}
                type="button"
                disabled={isPending}
                onClick={() => handleRate(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
              >
                <Star
                  className={`w-6 h-6 ${
                    filled
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-[var(--foreground-subtle)]"
                  }`}
                />
              </button>
            );
          })}

          {isPending && (
            <Loader2 className="w-5 h-5 ml-2 animate-spin text-[var(--color-accent)]" />
          )}
        </div>

        {rating !== null && (
          <span className="text-[var(--foreground-muted)]">
            {rating.toFixed(1)}/10
          </span>
        )}

        {rating === null && !hoverRating && (
          <span className="text-sm text-[var(--foreground-subtle)]">
            {t("notRated")}
          </span>
        )}
      </div>
    </div>
  );
}
