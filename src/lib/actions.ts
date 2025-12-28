"use server";

import { prisma } from "./prisma";
import { verifyJWT } from "./auth-utils";
import { getAuthToken } from "./auth-actions";
import { revalidatePath } from "next/cache";

export type User = {
  id: string;
  email: string;
  name: string | null;
};

/**
 * Get the current authenticated user
 * Throws an error if not authenticated
 */
export async function ensureUser(): Promise<User> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Get the current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await ensureUser();
  } catch {
    return null;
  }
}

/**
 * Add a movie to the user's watchlist
 */
export async function addToWatchlist(
  movieId: number,
  title: string,
  posterPath: string | null,
  voteAverage: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await ensureUser();

    await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        movieId,
        title,
        posterPath,
        voteAverage,
      },
    });

    revalidatePath("/watchlist");

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: "Please login to add movies to your watchlist",
      };
    }
    console.error("Add to watchlist error:", error);
    return { success: false, error: "Failed to add to watchlist" };
  }
}

/**
 * Remove a movie from the user's watchlist
 */
export async function removeFromWatchlist(
  movieId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await ensureUser();

    await prisma.watchlistItem.delete({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    revalidatePath("/watchlist");

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please login first" };
    }
    console.error("Remove from watchlist error:", error);
    return { success: false, error: "Failed to remove from watchlist" };
  }
}

/**
 * Check if a movie is in the user's watchlist
 */
export async function isInWatchlist(movieId: number): Promise<boolean> {
  try {
    const user = await ensureUser();

    const item = await prisma.watchlistItem.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    return !!item;
  } catch {
    return false;
  }
}

/**
 * Get user's watchlist
 */
export async function getWatchlist() {
  const user = await ensureUser();

  return prisma.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { addedAt: "desc" },
  });
}

/**
 * Rate a movie
 */
export async function rateMovie(
  movieId: number,
  title: string,
  posterPath: string | null,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await ensureUser();

    await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
      update: { rating },
      create: {
        userId: user.id,
        movieId,
        title,
        posterPath,
        rating,
      },
    });

    revalidatePath(`/movie/${movieId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please login to rate movies" };
    }
    console.error("Rate movie error:", error);
    return { success: false, error: "Failed to rate movie" };
  }
}

/**
 * Get user's rating for a movie
 */
export async function getMovieRating(movieId: number): Promise<number | null> {
  try {
    const user = await ensureUser();

    const rating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    return rating?.rating ?? null;
  } catch {
    return null;
  }
}

/**
 * Add view to history
 */
export async function addToViewHistory(
  movieId: number,
  title: string,
  posterPath: string | null
): Promise<void> {
  try {
    const user = await ensureUser();

    await prisma.viewHistory.create({
      data: {
        userId: user.id,
        movieId,
        title,
        posterPath,
      },
    });
  } catch {
    // Silently fail for view history
  }
}
