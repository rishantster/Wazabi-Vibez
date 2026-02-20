import { Pool } from "pg";
import type { McpLaunch } from "@/types";

// Separate read-only pool for MCP's launches table
// This connects to the same Postgres but reads from the MCP schema
const globalForPool = globalThis as unknown as {
  mcpPool: Pool | undefined;
};

function getMcpPool(): Pool {
  if (!globalForPool.mcpPool) {
    globalForPool.mcpPool = new Pool({
      connectionString: process.env.MCP_DATABASE_URL || process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return globalForPool.mcpPool;
}

export async function getLaunches(options: {
  chain?: string;
  artifactType?: string;
  creatorAddress?: string;
  status?: string;
  limit: number;
  offset: number;
  orderBy?: string;
}): Promise<{ launches: McpLaunch[]; total: number }> {
  const pool = getMcpPool();
  const conditions: string[] = ["status = 'finalized'"];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (options.chain) {
    conditions.push(`chain = $${paramIdx++}`);
    params.push(options.chain);
  }
  if (options.artifactType) {
    conditions.push(`artifact_type = $${paramIdx++}`);
    params.push(options.artifactType);
  }
  if (options.creatorAddress) {
    conditions.push(`creator_address = $${paramIdx++}`);
    params.push(options.creatorAddress);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = options.orderBy || "created_at DESC";

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM launches ${where} ORDER BY ${orderBy} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, options.limit, options.offset]
    ),
    pool.query(
      `SELECT COUNT(*) as total FROM launches ${where}`,
      params
    ),
  ]);

  return {
    launches: dataResult.rows as McpLaunch[],
    total: parseInt(countResult.rows[0].total, 10),
  };
}

export async function getLaunchByToken(tokenAddress: string): Promise<McpLaunch | null> {
  const pool = getMcpPool();
  const result = await pool.query(
    "SELECT * FROM launches WHERE token_address = $1 LIMIT 1",
    [tokenAddress]
  );
  return (result.rows[0] as McpLaunch) ?? null;
}

export async function getLaunchesByCreator(
  creatorAddress: string,
  limit = 50,
  offset = 0
): Promise<McpLaunch[]> {
  const pool = getMcpPool();
  const result = await pool.query(
    "SELECT * FROM launches WHERE creator_address = $1 AND status = 'finalized' ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [creatorAddress, limit, offset]
  );
  return result.rows as McpLaunch[];
}
