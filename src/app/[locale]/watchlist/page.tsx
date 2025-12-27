import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getWatchlist, ensureUser } from "@/lib/actions";
import { WatchlistClient } from "./watchlist-client";
import { List } from "lucide-react";

interface WatchlistPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WatchlistPage({ params }: WatchlistPageProps) {
  const { locale } = await params;
  const t = await getTranslations("watchlist");

  let watchlist;
  try {
    await ensureUser();
    watchlist = await getWatchlist();
  } catch {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <List className="w-8 h-8 text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>

        {watchlist.length > 0 ? (
          <WatchlistClient initialItems={watchlist} locale={locale} />
        ) : (
          <div className="text-center py-20 glass rounded-xl">
            <List className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-subtle)]" />
            <h2 className="text-xl font-semibold mb-2">{t("empty")}</h2>
            <p className="text-[var(--foreground-muted)]">
              {t("emptyDescription")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
