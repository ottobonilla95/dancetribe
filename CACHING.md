# Dashboard Caching Strategy

## Overview
The dashboard uses Next.js `unstable_cache` to cache expensive database queries and reduce load times.

## Cache Durations
- **Dance Styles**: 1 minute (data rarely changes)
- **Hot Dance Styles**: 5 minutes (updates when users add styles)
- **Hot Cities**: 1 minute (updates when user counts change)
- **Community Stats**: 2 minutes (expensive aggregations)
- **Trending Songs**: 5 minutes (updates when users set anthems)
- **Trendy Countries**: 2 minutes (expensive aggregations)

## Safety Features

### 1. Short Cache Times
All caches have been set to 1-5 minutes instead of longer durations. This means:
- Empty results won't persist long
- Data stays relatively fresh
- Auto-recovery from cache issues

### 2. Warning Logs
Each cached function logs a warning if it returns empty data:
```
⚠️ getCities returned empty - check database
⚠️ getDanceStyles returned empty - check database
```

### 3. Manual Cache Clearing
If cache gets into a bad state in production, you can clear it manually:

```bash
# Using curl
curl -X POST https://your-domain.com/api/cache/clear \
  -H "Cookie: your-auth-cookie"

# Or create a simple admin button that calls:
fetch('/api/cache/clear', { method: 'POST' })
```

## Why Not Skip Caching Empty Results?

With `unstable_cache`, we can't conditionally decide whether to cache - it always caches the return value. However:

1. ✅ Short cache times mean bad data clears quickly
2. ✅ Warning logs help debug issues
3. ✅ Manual clearing is available for emergencies
4. ✅ In production, data should never be empty anyway

## Future Improvements

If caching empty results becomes a problem, consider:
1. Using Redis with conditional caching logic
2. Implementing cache warming on deployment
3. Adding health checks that clear cache if data is empty
4. Using middleware to prevent caching empty responses

## Monitoring

Watch for these warnings in your logs:
- `⚠️ getCities returned empty`
- `⚠️ getDanceStyles returned empty`
- `⚠️ getHotDanceStyles returned empty`
- `⚠️ getCommunityStats returned 0 dancers`

If you see these in production, investigate your database connection and data.

