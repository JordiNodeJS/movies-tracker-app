"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onRate,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayRating = hoverRating ?? rating ?? 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating / 2;
        const halfFilled = !filled && star - 0.5 <= displayRating / 2;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(star * 2)}
            onMouseEnter={() => !readonly && setHoverRating(star * 2)}
            onMouseLeave={() => !readonly && setHoverRating(null)}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer"
            } transition-transform hover:scale-110`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled || halfFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-[var(--foreground-subtle)]"
              }`}
            />
          </button>
        );
      })}
      {rating !== null && (
        <span className="ml-2 text-sm text-[var(--foreground-muted)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
