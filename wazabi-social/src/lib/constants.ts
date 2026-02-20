// ─── Reputation Weights ──────────────────────────────────────────────────────

export const REPUTATION_WEIGHTS = {
  TENURE_MAX: 10,
  LAUNCH_COUNT_MAX: 15,
  VESTING_MAX: 25,
  COMPLETION_MAX: 25,
  LP_MAX: 15,
  VERIFICATION_MAX: 10,
} as const;

// Tenure: 1 point per 30 days, capped at 10
export const TENURE_DAYS_PER_POINT = 30;

// Launch count: log2(launches) * 5, capped at 15
export const LAUNCH_COUNT_LOG_MULTIPLIER = 5;

// Vesting tier numeric values (for averaging)
export const VESTING_TIER_VALUES: Record<string, number> = {
  tier_30: 1,
  tier_60: 2,
  tier_90: 3,
  tier_180: 4,
};

// ─── Feed ────────────────────────────────────────────────────────────────────

export const FEED_PAGE_SIZE = 20;

// Trending score weights
export const TRENDING_WEIGHTS = {
  CONVICTION: 0.4,
  REPUTATION: 0.2,
  ENGAGEMENT: 0.1,
  RECENCY: 0.3,
} as const;

// Trending half-life in hours (exponential decay)
export const TRENDING_HALF_LIFE_HOURS = 12;

// ─── Conviction Voting ──────────────────────────────────────────────────────

export const CONVICTION_LOCK_OPTIONS = [7, 30, 90] as const;

// Lock duration multiplier for conviction weight
export const CONVICTION_LOCK_MULTIPLIERS: Record<number, number> = {
  7: 1,
  30: 2.5,
  90: 5,
};

// ─── Chains ──────────────────────────────────────────────────────────────────

export const CHAIN_CONFIG = {
  solana: {
    label: "Solana",
    nativeSymbol: "SOL",
    color: "#9945FF",
    explorerUrl: "https://solscan.io",
  },
  ethereum: {
    label: "Ethereum",
    nativeSymbol: "ETH",
    color: "#627EEA",
    explorerUrl: "https://etherscan.io",
  },
  base: {
    label: "Base",
    nativeSymbol: "ETH",
    color: "#0052FF",
    explorerUrl: "https://basescan.org",
  },
  bsc: {
    label: "BSC",
    nativeSymbol: "BNB",
    color: "#F0B90B",
    explorerUrl: "https://bscscan.com",
  },
} as const;

// ─── Artifact Types ──────────────────────────────────────────────────────────

export const ARTIFACT_TYPE_CONFIG = {
  app: { label: "App", icon: "layout-grid" },
  agent: { label: "AI Agent", icon: "bot" },
  game: { label: "Game", icon: "gamepad-2" },
  bot: { label: "Bot", icon: "cpu" },
  tool: { label: "Tool", icon: "wrench" },
  workflow: { label: "Workflow", icon: "workflow" },
  other: { label: "Other", icon: "package" },
} as const;

// ─── Vesting Display ─────────────────────────────────────────────────────────

export const VESTING_TIER_CONFIG = {
  tier_30: { label: "30 Days", days: 30, allocation: "0.25%" },
  tier_60: { label: "60 Days", days: 60, allocation: "0.50%" },
  tier_90: { label: "90 Days", days: 90, allocation: "0.75%" },
  tier_180: { label: "180 Days", days: 180, allocation: "1.00%" },
} as const;
