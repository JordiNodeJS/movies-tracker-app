/**
 * Test script for CRUD operations in Movies Tracker App
 * Tests: Register, Login, Watchlist (Add/Remove/Get), Ratings (Create/Update/Get)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  signJWT,
  verifyJWT,
} from "./src/lib/auth-utils";

// Create Prisma client
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// Test data
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: "TestPassword123!",
  name: "Test User",
};

const TEST_MOVIE = {
  movieId: 550, // Fight Club
  title: "Fight Club",
  posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  voteAverage: 8.4,
};

const TEST_MOVIE_2 = {
  movieId: 278, // Shawshank Redemption
  title: "The Shawshank Redemption",
  posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
  voteAverage: 8.7,
};

let testUserId: string | undefined;
let testToken: string | undefined;

console.log("🚀 Starting CRUD Tests for Movies Tracker App\n");
console.log("=".repeat(60));

async function testRegister() {
  console.log("\n📝 TEST 1: Register User");
  console.log("-".repeat(40));

  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (existing) {
      console.log("⚠️  User already exists, using existing user");
      testUserId = existing.id;
      return true;
    }

    // Create user
    const hashedPassword = await hashPassword(TEST_USER.password);
    const user = await prisma.user.create({
      data: {
        email: TEST_USER.email,
        password: hashedPassword,
        name: TEST_USER.name,
      },
    });

    testUserId = user.id;
    console.log(`✅ User created successfully`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    return true;
  } catch (error) {
    console.error("❌ Registration failed:", error);
    return false;
  }
}

async function testLogin() {
  console.log("\n🔐 TEST 2: Login User");
  console.log("-".repeat(40));

  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (!user || !user.password) {
      console.error("❌ User not found");
      return false;
    }

    const isValid = await verifyPassword(TEST_USER.password, user.password);
    if (!isValid) {
      console.error("❌ Invalid password");
      return false;
    }

    testToken = await signJWT({ userId: user.id, email: user.email });
    console.log(`✅ Login successful`);
    console.log(`   Token generated: ${testToken.substring(0, 30)}...`);

    // Verify token
    const payload = await verifyJWT(testToken);
    console.log(`   Token payload: userId=${payload?.userId}`);
    return true;
  } catch (error) {
    console.error("❌ Login failed:", error);
    return false;
  }
}

async function testAddToWatchlist() {
  console.log("\n🎬 TEST 3: Add to Watchlist (CREATE)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    // Add first movie
    const item1 = await prisma.watchlistItem.create({
      data: {
        userId: testUserId,
        movieId: TEST_MOVIE.movieId,
        title: TEST_MOVIE.title,
        posterPath: TEST_MOVIE.posterPath,
        voteAverage: TEST_MOVIE.voteAverage,
      },
    });
    console.log(`✅ Added "${TEST_MOVIE.title}" to watchlist`);
    console.log(`   ID: ${item1.id}`);

    // Add second movie
    const item2 = await prisma.watchlistItem.create({
      data: {
        userId: testUserId,
        movieId: TEST_MOVIE_2.movieId,
        title: TEST_MOVIE_2.title,
        posterPath: TEST_MOVIE_2.posterPath,
        voteAverage: TEST_MOVIE_2.voteAverage,
      },
    });
    console.log(`✅ Added "${TEST_MOVIE_2.title}" to watchlist`);
    console.log(`   ID: ${item2.id}`);

    return true;
  } catch (error) {
    console.error("❌ Add to watchlist failed:", error);
    return false;
  }
}

async function testGetWatchlist() {
  console.log("\n📋 TEST 4: Get Watchlist (READ)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: testUserId },
      orderBy: { addedAt: "desc" },
    });

    console.log(`✅ Found ${watchlist.length} items in watchlist:`);
    watchlist.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (Movie ID: ${item.movieId})`);
      console.log(
        `      Rating: ${item.voteAverage}/10 | Added: ${item.addedAt.toLocaleDateString()}`,
      );
    });

    return true;
  } catch (error) {
    console.error("❌ Get watchlist failed:", error);
    return false;
  }
}

async function testRateMovie() {
  console.log("\n⭐ TEST 5: Rate Movies (CREATE/UPDATE)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    // Rate first movie
    const rating1 = await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: TEST_MOVIE.movieId,
        },
      },
      update: { rating: 9.0 },
      create: {
        userId: testUserId,
        movieId: TEST_MOVIE.movieId,
        title: TEST_MOVIE.title,
        posterPath: TEST_MOVIE.posterPath,
        rating: 9.0,
      },
    });
    console.log(`✅ Rated "${TEST_MOVIE.title}": ${rating1.rating}/10`);

    // Rate second movie
    const rating2 = await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: TEST_MOVIE_2.movieId,
        },
      },
      update: { rating: 10.0 },
      create: {
        userId: testUserId,
        movieId: TEST_MOVIE_2.movieId,
        title: TEST_MOVIE_2.title,
        posterPath: TEST_MOVIE_2.posterPath,
        rating: 10.0,
      },
    });
    console.log(`✅ Rated "${TEST_MOVIE_2.title}": ${rating2.rating}/10`);

    // Update rating (test UPDATE)
    const updatedRating = await prisma.rating.update({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: TEST_MOVIE.movieId,
        },
      },
      data: { rating: 8.5 },
    });
    console.log(
      `✅ Updated "${TEST_MOVIE.title}" rating: ${updatedRating.rating}/10`,
    );

    return true;
  } catch (error) {
    console.error("❌ Rate movie failed:", error);
    return false;
  }
}

async function testGetRatings() {
  console.log("\n📊 TEST 6: Get User Ratings (READ)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    const ratings = await prisma.rating.findMany({
      where: { userId: testUserId },
      orderBy: { updatedAt: "desc" },
    });

    console.log(`✅ Found ${ratings.length} ratings:`);
    ratings.forEach((rating, index) => {
      console.log(`   ${index + 1}. ${rating.title}: ${rating.rating}/10`);
      console.log(`      Updated: ${rating.updatedAt.toLocaleString()}`);
    });

    return true;
  } catch (error) {
    console.error("❌ Get ratings failed:", error);
    return false;
  }
}

async function testIsInWatchlist() {
  console.log("\n🔍 TEST 7: Check if Movie in Watchlist (READ)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    // Check existing movie
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: TEST_MOVIE.movieId,
        },
      },
    });
    console.log(`✅ "${TEST_MOVIE.title}" in watchlist: ${!!existing}`);

    // Check non-existing movie
    const nonExisting = await prisma.watchlistItem.findUnique({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: 999999,
        },
      },
    });
    console.log(`✅ Movie ID 999999 in watchlist: ${!!nonExisting}`);

    return true;
  } catch (error) {
    console.error("❌ Check watchlist failed:", error);
    return false;
  }
}

async function testRemoveFromWatchlist() {
  console.log("\n🗑️  TEST 8: Remove from Watchlist (DELETE)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    // Remove first movie
    await prisma.watchlistItem.delete({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: TEST_MOVIE.movieId,
        },
      },
    });
    console.log(`✅ Removed "${TEST_MOVIE.title}" from watchlist`);

    // Verify removal
    const remaining = await prisma.watchlistItem.findMany({
      where: { userId: testUserId },
    });
    console.log(`✅ Remaining items in watchlist: ${remaining.length}`);

    return true;
  } catch (error) {
    console.error("❌ Remove from watchlist failed:", error);
    return false;
  }
}

async function testDeleteRating() {
  console.log("\n🗑️  TEST 9: Delete Rating (DELETE)");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.error("❌ No user ID available");
      return false;
    }

    // Delete rating
    await prisma.rating.delete({
      where: {
        userId_movieId: {
          userId: testUserId,
          movieId: TEST_MOVIE.movieId,
        },
      },
    });
    console.log(`✅ Deleted rating for "${TEST_MOVIE.title}"`);

    // Verify deletion
    const remaining = await prisma.rating.findMany({
      where: { userId: testUserId },
    });
    console.log(`✅ Remaining ratings: ${remaining.length}`);

    return true;
  } catch (error) {
    console.error("❌ Delete rating failed:", error);
    return false;
  }
}

async function cleanup() {
  console.log("\n🧹 CLEANUP: Removing test data");
  console.log("-".repeat(40));

  try {
    if (!testUserId) {
      console.log("⚠️  No test user to clean up");
      return;
    }

    // Delete all related data first (cascade should handle this, but let's be explicit)
    await prisma.watchlistItem.deleteMany({ where: { userId: testUserId } });
    await prisma.rating.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });

    console.log(`✅ Test user and all related data deleted`);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}

async function runAllTests() {
  const results: { name: string; passed: boolean }[] = [];

  // Run tests
  results.push({ name: "Register User", passed: await testRegister() });
  results.push({ name: "Login User", passed: await testLogin() });
  results.push({
    name: "Add to Watchlist",
    passed: await testAddToWatchlist(),
  });
  results.push({ name: "Get Watchlist", passed: await testGetWatchlist() });
  results.push({ name: "Rate Movies", passed: await testRateMovie() });
  results.push({ name: "Get Ratings", passed: await testGetRatings() });
  results.push({ name: "Check Watchlist", passed: await testIsInWatchlist() });
  results.push({
    name: "Remove from Watchlist",
    passed: await testRemoveFromWatchlist(),
  });
  results.push({ name: "Delete Rating", passed: await testDeleteRating() });

  // Cleanup
  await cleanup();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((r) => {
    console.log(`   ${r.passed ? "✅" : "❌"} ${r.name}`);
  });

  console.log("\n" + "-".repeat(40));
  console.log(`   Total: ${passed}/${total} tests passed`);
  console.log(
    `   Status: ${passed === total ? "🎉 ALL TESTS PASSED!" : "⚠️  SOME TESTS FAILED"}`,
  );
  console.log("=".repeat(60));

  await prisma.$disconnect();
}

// Run all tests
runAllTests().catch(console.error);
