import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: CacheClient | undefined;
};

type CacheClient = {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, seconds: number, value: string) => Promise<unknown>;
};

const disabledRedis: CacheClient = {
  async get() {
    return null;
  },
  async setex() {
    return "OK";
  },
};

function getRedis(): CacheClient {
  if (!globalForRedis.redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      globalForRedis.redis = disabledRedis;
      return globalForRedis.redis;
    }

    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    client.on("error", (err) => {
      console.warn("[redis] connection error:", err.message);
    });
    globalForRedis.redis = client;
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
