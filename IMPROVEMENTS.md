# 🔧 Code Improvements & Recommendations

## Priority 1: Error Handling for Missing Environment Variables

### Issue: Unvalidated Environment Variables

Currently, the application assumes environment variables exist without validation. This causes cryptic errors at runtime.

### Recommended Fixes

#### 1. `src/lib/tmdb.ts` - Add validation

```typescript
import "server-only";
import { unstable_cache } from "next/cache";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

// Validate at module load time
if (!ACCESS_TOKEN) {
  console.error(
    "❌ CRITICAL: TMDB_ACCESS_TOKEN environment variable is not set. " +
      "The application cannot fetch movie data. " +
      "Please configure this variable in your .env file or Vercel dashboard.",
  );

  // In production, throw error; in development, allow with warning
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: TMDB_ACCESS_TOKEN");
  }
}

// ... rest of the file
```

#### 2. `src/lib/prisma.ts` - Add validation with helpful message

```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  // Validate environment variable
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
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

#### 3. `src/lib/auth-utils.ts` - Add JWT_SECRET validation

```typescript
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET_RAW =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

// Validate JWT_SECRET in production
if (
  process.env.NODE_ENV === "production" &&
  JWT_SECRET_RAW === "your-super-secret-key-change-in-production"
) {
  throw new Error(
    "❌ CRITICAL: JWT_SECRET is using the default development value in production! " +
      "Please set a secure random JWT_SECRET in your environment variables.",
  );
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

// ... rest of the file
```

#### 4. Create a new validation file: `src/lib/validate-env.ts`

```typescript
/**
 * Validate that all required environment variables are set
 * Call this early in application startup
 */

export function validateEnvironmentVariables() {
  const requiredVars = {
    TMDB_ACCESS_TOKEN: "TMDB API Bearer token for movie data",
    DATABASE_URL: "PostgreSQL connection string for Neon database",
    JWT_SECRET: "Secret key for JWT token signing (should be random & secure)",
  };

  const missing: string[] = [];

  for (const [key, description] of Object.entries(requiredVars)) {
    if (!process.env[key]) {
      missing.push(`${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║     ❌ MISSING ENVIRONMENT VARIABLES                           ║
╚════════════════════════════════════════════════════════════════╝

The following environment variables are required but not set:

${missing.map((v) => `  • ${v}`).join("\n")}

📝 How to fix:

1. Local Development:
   Create or update .env.local with these variables

2. Production (Vercel):
   Run: vercel env add [VARIABLE_NAME] production
   Or set them in Vercel dashboard > Settings > Environment Variables

3. Generate a secure JWT_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

For more info, see: DEPLOYMENT_REPORT.md
════════════════════════════════════════════════════════════════
    `;

    console.error(errorMessage);

    // Fail loudly in production
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing required environment variables: " +
          missing.map((v) => v.split(":")[0]).join(", "),
      );
    }
  }
}
```

#### 5. Update `src/app/layout.tsx` to validate on startup

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { validateEnvironmentVariables } from "@/lib/validate-env";

// Validate environment variables at startup
validateEnvironmentVariables();

export const metadata: Metadata = {
  title: "Movies Tracker",
  description: "Track, rate, and discover your favorite movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
```

---

## Priority 2: Better Error Handling in Components

### Recommended: Add error boundary for TMDB API failures

```typescript
// src/components/movie-section-error.tsx
export function MovieSectionError({
  title,
  error
}: {
  title: string;
  error: Error
}) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          <p className="font-semibold">Failed to load movies</p>
          <p className="text-sm mt-2 text-red-300">
            {error.message || "An error occurred while fetching data"}
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## Priority 3: Environment Variable Documentation

### Create `env.example` file

```bash
# Copy this file to .env.local and fill in your actual values
# Never commit .env files to version control

# TMDB API Configuration
# Get your Bearer token from: https://www.themoviedb.org/settings/api
TMDB_ACCESS_TOKEN=your_tmdb_bearer_token_here

# Database Configuration
# Get your connection string from: https://console.neon.tech
# Format: postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require&channel_binding=require
DATABASE_URL=your_neon_postgres_connection_string_here

# Authentication Configuration
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_secure_random_jwt_secret_here
```

---

## Priority 4: Add Environment Validation Script

### Create `scripts/validate-env.sh`

```bash
#!/bin/bash

echo "🔍 Validating environment variables..."
echo ""

REQUIRED_VARS=("TMDB_ACCESS_TOKEN" "DATABASE_URL" "JWT_SECRET")
MISSING=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING+=("$var")
  else
    echo "✅ $var is set"
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "❌ Missing environment variables:"
  for var in "${MISSING[@]}"; do
    echo "  - $var"
  done
  exit 1
else
  echo ""
  echo "✨ All required environment variables are configured!"
  exit 0
fi
```

### Note on Environment Validation

The current `package.json` does not include the `validate-env` script suggestion below. If implementing this recommendation, ensure to update package.json accordingly and use `pnpm` instead of `npm run` for all commands.

---

## Priority 5: Enhanced Logging for Debugging

### Create `src/lib/logger.ts`

```typescript
/**
 * Simple logger utility for consistent logging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

function formatLog(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const emoji = {
    debug: "🐛",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  };

  console.log(
    `${emoji[level]} [${timestamp}] [${level.toUpperCase()}] ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

export const logger = {
  debug: (message: string, data?: unknown) => formatLog("debug", message, data),
  info: (message: string, data?: unknown) => formatLog("info", message, data),
  warn: (message: string, data?: unknown) => formatLog("warn", message, data),
  error: (message: string, data?: unknown) => formatLog("error", message, data),
};
```

---

## Summary of Changes

| File                      | Change                                | Priority |
| ------------------------- | ------------------------------------- | -------- |
| `src/lib/validate-env.ts` | NEW - Centralized env validation      | 🔴 P1    |
| `src/lib/tmdb.ts`         | Add error check for TMDB_ACCESS_TOKEN | 🔴 P1    |
| `src/lib/prisma.ts`       | Add error check for DATABASE_URL      | 🔴 P1    |
| `src/lib/auth-utils.ts`   | Add validation for JWT_SECRET         | 🔴 P1    |
| `src/app/layout.tsx`      | Call validateEnvironmentVariables()   | 🔴 P1    |
| `env.example`             | NEW - Document required variables     | 🟡 P2    |
| `scripts/validate-env.sh` | NEW - Pre-flight check script         | 🟡 P2    |
| `package.json`            | Add validate-env script               | 🟡 P2    |
| `src/lib/logger.ts`       | NEW - Better logging                  | 🟢 P3    |

---

## Testing Recommendations

### Test 1: Missing TMDB_ACCESS_TOKEN

```bash
# Temporarily unset TMDB_ACCESS_TOKEN
unset TMDB_ACCESS_TOKEN
npm run dev
# Should fail with helpful error message
```

### Test 2: Missing DATABASE_URL

```bash
# Temporarily unset DATABASE_URL
unset DATABASE_URL
npm run dev
# Should fail with helpful error message
```

### Test 3: Invalid JWT_SECRET in production

```bash
# Test that default JWT_SECRET fails in production
NODE_ENV=production npm run build
# Should fail with helpful error message
```

---

## Deployment Checklist for Future Releases

- [ ] All environment variables validated at startup
- [ ] Error messages are helpful and actionable
- [ ] `.env.example` file is up-to-date
- [ ] No hardcoded secrets in code
- [ ] All secrets are encrypted in Vercel
- [ ] `validate-env.sh` script passes locally before deploying
- [ ] Build logs checked for any warning about missing variables
- [ ] Application tested with all required environment variables set
