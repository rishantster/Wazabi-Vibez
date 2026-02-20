// ─── MCP Launch Data (read from MCP's Postgres) ──────────────────────────────

export interface McpLaunch {
  id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  chain: Chain;
  creator_address: string;
  creator_verified: boolean;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  twitter_url: string | null;
  telegram_url: string | null;
  github_repo_url: string | null;
  app_url: string | null;
  artifact_type: ArtifactType | null;
  vesting_tier: VestingTier | null;
  vesting_days: number | null;
  creator_allocation_pct: number | null;
  lp_native_amount: string | null;
  lp_lock_days: number | null;
  lp_lock_until: string | null;
  lp_position_id: string | null;
  fee_amount_usd: number | null;
  source_client: string | null;
  source_session: string | null;
  referral_code: string | null;
  created_at: string;
  finalized_at: string | null;
  status: LaunchStatus;
}

export type Chain = "solana" | "ethereum" | "base" | "bsc";

export type ArtifactType =
  | "app"
  | "agent"
  | "game"
  | "bot"
  | "tool"
  | "workflow"
  | "other";

export type VestingTier = "tier_30" | "tier_60" | "tier_90" | "tier_180";

export type LaunchStatus = "pending" | "minted" | "lp_locked" | "finalized" | "failed";

// ─── Social Layer Types ──────────────────────────────────────────────────────

export interface FeedLaunch extends McpLaunch {
  social: {
    upvoteCount: number;
    commentCount: number;
    convictionTotalUsd: number;
    trendingScore: number;
  };
  creator: {
    displayName: string | null;
    avatarUrl: string | null;
    reputationScore: number;
    totalLaunches: number;
    isFollowing: boolean;
  };
}

export interface ReputationBreakdown {
  tenurePoints: number;       // 0-10
  launchCountPoints: number;  // 0-15
  vestingPoints: number;      // 0-25
  completionPoints: number;   // 0-25
  lpPoints: number;           // 0-15
  verificationPoints: number; // 0-10
  totalScore: number;         // 0-100
}

export interface CreatorProfile {
  walletAddress: string;
  chain: Chain;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  githubUsername: string | null;
  twitterHandle: string | null;
  reputation: ReputationBreakdown;
  totalLaunches: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  joinedAt: string;
}

export interface ConvictionVoteData {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  amountDeclared: string;
  amountUsd: number;
  lockDurationDays: number;
  lockedUntil: string;
  chain: Chain;
  createdAt: string;
}

export interface CommentData {
  id: string;
  body: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  parentCommentId: string | null;
  replies: CommentData[];
  createdAt: string;
  editedAt: string | null;
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | "new_launch"
  | "comment_reply"
  | "new_follower"
  | "conviction_received"
  | "reputation_milestone";

export type FeedSort = "trending" | "new" | "top";
export type FeedFilter = {
  sort: FeedSort;
  chain?: Chain;
  artifactType?: ArtifactType;
  creatorAddress?: string;
  page: number;
  limit: number;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  walletAddress: string | null;
  walletChain: Chain | null;
  displayName: string | null;
  avatarUrl: string | null;
  githubUsername: string | null;
  twitterHandle: string | null;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  details?: string;
}
