import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return globalForRedis.redis;
}

export const redis = getRedis();

// Cache keys
export const CACHE_KEYS = {
  feed: (sort: string, chain?: string, type?: string, page?: number) =>
    `feed:${sort}:${chain || "all"}:${type || "all"}:${page || 1}`,
  launchStats: (tokenAddress: string) => `launch:stats:${tokenAddress}`,
  creatorReputation: (address: string) => `creator:rep:${address}`,
  creatorProfile: (address: string) => `creator:profile:${address}`,
} as const;

// Default TTLs in seconds
export const CACHE_TTL = {
  FEED: 30,           // 30 seconds — feeds update frequently
  LAUNCH_STATS: 60,   // 1 minute
  REPUTATION: 300,    // 5 minutes — reputation changes slowly
  PROFILE: 120,       // 2 minutes
} as const;
