"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Check, Loader2 } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions";

interface WatchlistButtonProps {
  movieId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  isLoggedIn: boolean;
  inWatchlist: boolean;
}

export function WatchlistButton({
  movieId,
  title,
  posterPath,
  voteAverage,
  isLoggedIn,
  inWatchlist: initialInWatchlist,
}: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("movie");

  const handleClick = () => {
    if (!isLoggedIn) {
      // Could redirect to login or show a message
      return;
    }

    startTransition(async () => {
      if (inWatchlist) {
        const result = await removeFromWatchlist(movieId);
        if (result.success) {
          setInWatchlist(false);
        }
      } else {
        const result = await addToWatchlist(
          movieId,
          title,
          posterPath,
          voteAverage
        );
        if (result.success) {
          setInWatchlist(true);
        }
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <button
        className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
        disabled
      >
        <Plus className="w-5 h-5" />
        {t("addToWatchlist")}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 ${
        inWatchlist ? "btn-primary" : "btn-secondary"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : inWatchlist ? (
        <Check className="w-5 h-5" />
      ) : (
        <Plus className="w-5 h-5" />
      )}
      {inWatchlist ? t("inWatchlist") : t("addToWatchlist")}
    </button>
  );
}
