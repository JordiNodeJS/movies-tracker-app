import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    const message =
      "❌ CRITICAL: DATABASE_URL environment variable is not set. " +
      "Database operations will fail. " +
      "Please configure this variable:\n" +
      "- Local: Add to .env.local\n" +
      "- Production: Configure in Vercel dashboard\n" +
      "- Expected format: postgresql://[user]:[password]@[host]:[port]/[database]";

    console.error(message);

    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }
    
    // Fallback for development if not throwing
    return new PrismaClient();
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
