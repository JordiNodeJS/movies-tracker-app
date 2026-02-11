# 🛠️ Maintenance Guide - Movies Tracker App

## Overview

This guide provides instructions for maintaining, monitoring, and troubleshooting the Movies Tracker App in production.

### Infrastructure Details

- **Active Neon Project:** `neon-indigo-kite` (ID: `wispy-poetry-52762475`)
- **Neon Region:** AWS EU-West-2
- **Database:** `neondb` (Schema: `movies_tracker_app_2`)
- **Current Branch:** `main` with endpoint `ep-aged-night-ab7l7nwr.eu-west-2.aws.neon.tech`
- **PostgreSQL Version:** 17
- **Deployment:** Vercel with automatic deployments on `main` branch push

---

## 📋 Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring & Health Checks](#monitoring--health-checks)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Environment Variables Management](#environment-variables-management)
5. [Database Maintenance](#database-maintenance)
6. [Performance Optimization](#performance-optimization)
7. [Security Updates](#security-updates)
8. [Disaster Recovery](#disaster-recovery)
9. [Useful Commands](#useful-commands)

---

## Daily Operations

### Checking Deployment Status

```bash
# View current production deployment
vercel inspect <deployment-url>

# View deployment logs
vercel inspect <deployment-url> --logs

# Check environment variables
vercel env list
```

### Monitoring Recent Deployments

```bash
# View recent deployments
vercel list

# Get detailed info about a specific deployment
vercel inspect <deployment-url>
```

### Local Testing Before Deployment

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Monitoring & Health Checks

### Key Metrics to Monitor

#### 1. **Deployment Status**

- Check Vercel dashboard regularly
- Monitor build success rate
- Track deployment frequency

#### 2. **Application Performance**

- Response times (target: < 200ms)
- Error rates (target: < 0.1%)
- Uptime (target: > 99.9%)

#### 3. **API Integration Health**

- TMDB API availability
- Database connection status
- JWT token generation/validation

### Vercel Analytics

```bash
# View analytics for your deployment
# Navigate to: https://vercel.com/dashboard > movies-tracker-app > Analytics

# Key indicators:
# - Page load time
# - Core Web Vitals
# - User geographic distribution
# - Device breakdown
```

### Database Health Checks

```bash
# Connect to Neon database console
# https://console.neon.tech

# Check connection status:
# - Active connections count
# - Query performance
# - Storage usage
```

### TMDB API Status

```bash
# Test TMDB API availability
curl -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" \
  https://api.themoviedb.org/3/trending/movie/week

# Should return valid JSON with movie data
# If fails, check:
# - API token validity
# - API rate limits
# - TMDB service status
```

---

## Common Issues & Solutions

### Issue 1: Movies Not Loading

**Symptoms:**

- Blank movie listings on home page
- Error messages about TMDB

**Diagnosis:**

```bash
# Check if TMDB_ACCESS_TOKEN is set
vercel env list

# Verify token by testing API
curl -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" \
  https://api.themoviedb.org/3/trending/movie/week
```

**Solutions:**

- Verify TMDB_ACCESS_TOKEN is set correctly: `vercel env add TMDB_ACCESS_TOKEN production`
- Check TMDB API status: https://status.themoviedb.org/
- Check Vercel build logs: `vercel inspect <url> --logs`
- Clear Vercel cache and redeploy: `vercel deploy --prod`

### Issue 2: Database Connection Errors

**Symptoms:**

- "Failed to add to watchlist" errors
- User data not saving
- Authentication failures

**Diagnosis:**

```bash
# Check DATABASE_URL
vercel env list

# Check Neon database status
# https://console.neon.tech > Monitoring
```

**Solutions:**

- Verify DATABASE_URL format: `postgresql://[user]:[password]@[host]:[port]/[database]`
- Check Neon connection limits: https://console.neon.tech
- Restart database connection: Disconnect and reconnect in Neon console
- Check for active long-running queries in Neon console
- Verify SSL certificates are up-to-date

### Issue 3: Authentication Not Working

**Symptoms:**

- Login fails silently
- JWT token validation errors
- Users unable to register

**Diagnosis:**

```bash
# Check JWT_SECRET is set
vercel env list | grep JWT_SECRET

# Check if JWT is being generated
# Look for token in browser cookies/localStorage
```

**Solutions:**

- Verify JWT_SECRET is set: `vercel env add JWT_SECRET production`
- Ensure JWT_SECRET is cryptographically secure (32+ characters)
- Clear browser cookies and retry login
- Check browser console for auth errors: `F12 > Console`

### Issue 4: Build Failures

**Symptoms:**

- Deployment fails
- "Build completed with errors" message
- Application unavailable after deployment attempt

**Diagnosis:**

```bash
# Check build logs
vercel inspect <deployment-url> --logs

# Verify locally before deploying
pnpm build
pnpm type-check
```

**Solutions:**

- Review error messages in build logs
- Run `npm run build` locally to reproduce
- Check TypeScript errors: `npm run type-check`
- Check for missing dependencies: `pnpm install`
- Verify environment variables are accessible during build
- Clear build cache: Vercel dashboard > Settings > Redeploy

### Issue 5: Performance Degradation

**Symptoms:**

- Slow page loads (> 5 seconds)
- High CPU usage
- Timeout errors

**Solutions:**

- Check Vercel analytics for bottlenecks
- Optimize database queries in Neon
- Enable Vercel caching for static assets
- Reduce bundle size with code splitting
- Check for N+1 database queries
- Review and optimize TMDB API calls
- Enable image optimization: check `next.config.ts`

---

## Environment Variables Management

### Adding New Variables

```bash
# Add to production
vercel env add VARIABLE_NAME production

# Add to preview deployments
vercel env add VARIABLE_NAME preview

# Add to development
vercel env add VARIABLE_NAME development
```

### Updating Existing Variables

```bash
# Remove old variable
vercel env rm VARIABLE_NAME

# Add new variable with same name
vercel env add VARIABLE_NAME production
```

### Current Production Variables

| Variable            | Purpose                    | Rotation                          | Status    |
| ------------------- | -------------------------- | --------------------------------- | --------- |
| `TMDB_ACCESS_TOKEN` | TMDB API authentication    | Check annually or if issues arise | ✅ Active |
| `DATABASE_URL`      | Neon PostgreSQL connection | Only if changing databases        | ✅ Active |
| `JWT_SECRET`        | User authentication tokens | Can rotate for security           | ✅ Active |

### JWT_SECRET Rotation (if needed)

```bash
# Generate new secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Vercel
vercel env rm JWT_SECRET
vercel env add JWT_SECRET production

# Redeploy
vercel deploy --prod

# Note: All existing JWT tokens become invalid after rotation
# Users will need to log in again
```

---

## Database Maintenance

### Neon Database Tasks

#### Weekly Tasks

- [ ] Monitor connection count
- [ ] Review slow query logs
- [ ] Check storage usage
- [ ] Verify backups are created

#### Monthly Tasks

- [ ] Analyze database performance
- [ ] Check for unused indexes
- [ ] Review user data integrity
- [ ] Test database restoration procedures

### Useful Database Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- List table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY datname, usename;

-- View recent slow queries (if slow_query_log enabled)
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

### Prisma Database Commands

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# View database in Prisma Studio
pnpm db:studio
```

---

## Performance Optimization

### Caching Strategy

#### 1. Next.js Caching

- Static pages are cached at build time
- Dynamic pages cached per request
- Cache revalidation: 300-3600 seconds

#### 2. TMDB API Caching

- Trending movies: 1 hour cache
- Popular movies: 1 hour cache
- Movie details: 24 hour cache
- Search results: 5 minute cache

#### 3. Database Query Caching

- User data: Per-request cache
- Watchlist items: Per-request cache
- Ratings: Per-request cache

### Optimization Checklist

- [ ] Enable image optimization in `next.config.ts`
- [ ] Monitor bundle size: `npm run build`
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Enable compression in Vercel
- [ ] Use CDN for static assets (automatic with Vercel)
- [ ] Optimize database indexes for frequently queried fields
- [ ] Enable query pagination for large result sets

---

## Security Updates

### Regular Security Tasks

#### Weekly

- [ ] Monitor GitHub security advisories
- [ ] Check npm vulnerabilities: `npm audit`
- [ ] Review access logs in Vercel

#### Monthly

- [ ] Update dependencies: `pnpm update`
- [ ] Run full security audit
- [ ] Review and rotate credentials if compromised
- [ ] Check TMDB API access logs

#### Quarterly

- [ ] Penetration testing (if budget allows)
- [ ] Security review of authentication flow
- [ ] Database backup integrity testing
- [ ] Disaster recovery drill

### Dependency Updates

```bash
# Check for outdated packages
pnpm outdated

# Update all packages
pnpm update

# Update specific package
pnpm up package-name

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

### Key Security Practices

1. **Never commit secrets** - Use `.env.local` (gitignored)
2. **Encrypt sensitive data** - Enable Vercel encryption for env vars
3. **Use HTTPS** - Always enabled by Vercel
4. **Validate inputs** - All user inputs should be validated
5. **Rate limiting** - Implement if TMDB API is being hammered
6. **CORS policy** - Only allow same-origin requests
7. **SQL injection prevention** - Prisma provides protection

---

## Disaster Recovery

### Backup Strategy

#### Automatic Backups

- Vercel: Automatic deployment snapshots (7-day retention)
- Neon: Automatic daily backups (7-day retention)
- GitHub: Version control backup

#### Manual Backups

```bash
# Backup database to file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Store in safe location (Google Drive, S3, etc.)
```

### Recovery Procedures

#### Scenario 1: Deployment Rollback

```bash
# List previous deployments
vercel list

# Rollback to previous production deployment
vercel promote <previous-deployment-url>

# Or redeploy from Git
vercel deploy --prod
```

#### Scenario 2: Database Corruption

```bash
# Use Neon console: https://console.neon.tech
# 1. Go to Branches tab
# 2. Create branch from backup point
# 3. Test recovery
# 4. Switch traffic to recovered database if successful
```

#### Scenario 3: Complete Application Failure

```bash
# 1. Check Vercel status page
vercel status

# 2. Check TMDB API status
curl https://www.themoviedb.org/settings/api

# 3. Check database connection
# https://console.neon.tech

# 4. If all services OK, force rebuild
vercel deploy --prod --force

# 5. Clear build cache if needed
# Via Vercel dashboard > Settings > "Redeploy"
```

---

## Useful Commands

### Vercel CLI Commands

```bash
# Authentication
vercel login
vercel logout
vercel whoami

# Deployment
vercel deploy                          # Deploy to preview
vercel deploy --prod                   # Deploy to production
vercel redeploy <deployment-url>       # Redeploy specific deployment

# Environment Management
vercel env list                        # List variables
vercel env add <name> <target>        # Add variable
vercel env rm <name>                  # Remove variable
vercel env pull                        # Sync with .env.local

# Project Information
vercel project list                    # List projects
vercel inspect <url>                   # Inspect deployment
vercel inspect <url> --logs            # View build logs
vercel list                            # List recent deployments

# Local Development
vercel dev                             # Start local dev server
vercel link                            # Link local repo to Vercel project
```

### npm/pnpm Commands

```bash
# Dependency Management
pnpm install                           # Install dependencies
pnpm update                            # Update all packages
pnpm outdated                          # Show outdated packages

# Code Quality
pnpm lint                              # Run ESLint
pnpm type-check                        # Run TypeScript checker
pnpm build                             # Build for production

# Development
pnpm dev                               # Start dev server
pnpm db:studio                         # Open Prisma Studio
pnpm db:generate                       # Generate Prisma client
pnpm db:push                           # Push schema to database
```

### Git Commands

```bash
# Deployment trigger
git push                               # Triggers automatic Vercel deployment

# View deployment status
# Check GitHub Actions or Vercel dashboard after push
```

---

## Documentation & References

### Internal Docs

- `DEPLOYMENT_REPORT.md` - How the app was fixed and deployed
- `IMPROVEMENTS.md` - Recommended code improvements
- `README.md` - Project overview and setup instructions

### External Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TMDB API Docs](https://developers.themoviedb.org/)
- [Neon Docs](https://neon.tech/docs)

### Contact & Support

- **Vercel Support:** https://vercel.com/support
- **TMDB Support:** https://www.themoviedb.org/settings/api
- **Neon Support:** https://console.neon.tech/support

---

## Maintenance Calendar

### Daily

- Check Vercel dashboard for errors
- Monitor error logs

### Weekly

- Run `npm audit`
- Check TMDB API status
- Monitor database performance

### Monthly

- Update dependencies (`pnpm update`)
- Review security advisories
- Analyze performance metrics

### Quarterly

- Full security review
- Database backup testing
- Performance optimization review

### Annually

- Renewal of API keys/tokens
- Full infrastructure review
- Architecture optimization

---

## Troubleshooting Checklist

When something breaks:

- [ ] Check Vercel deployment status
- [ ] Check TMDB API status
- [ ] Check database connectivity
- [ ] Review application error logs
- [ ] Test locally with `pnpm dev`
- [ ] Check environment variables are set
- [ ] Review git diff for recent changes
- [ ] Check browser console (F12 > Console)
- [ ] Clear browser cache and cookies
- [ ] Try force-redeploying: `vercel deploy --prod --force`
- [ ] Check GitHub Actions/Vercel build logs
- [ ] Ask in relevant community (Next.js, Prisma, etc.)

---

## Support Contact

For critical issues:

1. Check this guide first
2. Check relevant documentation
3. Contact service providers (Vercel, Neon, TMDB)
4. Review GitHub issues and discussions

---

**Last Updated:** February 2, 2025  
**Maintained By:** Development Team  
**Next Review Date:** May 2, 2025
