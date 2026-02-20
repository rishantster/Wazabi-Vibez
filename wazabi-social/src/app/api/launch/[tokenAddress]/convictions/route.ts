import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyMessage } from "viem";
import { CONVICTION_LOCK_OPTIONS, CONVICTION_LOCK_MULTIPLIERS } from "@/lib/constants";
import type { ConvictionVoteData, Chain } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  const { tokenAddress } = params;

  const votes = await prisma.convictionVote.findMany({
    where: { launchTokenAddress: tokenAddress },
    include: {
      user: true,
    },
    orderBy: { amountUsd: "desc" },
  });

  const data: ConvictionVoteData[] = votes.map((v) => ({
    id: v.id,
    userId: v.userId,
    displayName: v.user.displayName,
    avatarUrl: v.user.avatarUrl,
    amountDeclared: v.amountDeclared,
    amountUsd: v.amountUsd,
    lockDurationDays: v.lockDurationDays,
    lockedUntil: v.lockedUntil.toISOString(),
    chain: v.chain as Chain,
    createdAt: v.createdAt.toISOString(),
  }));

  return NextResponse.json({ data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { tokenAddress } = params;
  const body = await req.json();

  const {
    chain,
    amountDeclared,
    amountUsd,
    lockDurationDays,
    message,
    signature,
    signerAddress,
  } = body;

  // Validate lock duration
  if (!CONVICTION_LOCK_OPTIONS.includes(lockDurationDays)) {
    return NextResponse.json(
      { error: `Lock duration must be one of: ${CONVICTION_LOCK_OPTIONS.join(", ")} days` },
      { status: 400 }
    );
  }

  // Validate amount
  if (!amountDeclared || !amountUsd || amountUsd <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }

  // Verify the signature matches the message and signer
  if (!message || !signature || !signerAddress) {
    return NextResponse.json({ error: "Signed attestation required" }, { status: 400 });
  }

  // Verify EVM signature (for Solana, we'd use a different verify path)
  if (chain !== "solana") {
    try {
      const isValid = await verifyMessage({
        address: signerAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }
  }

  // Verify the message contains expected data
  const expectedContent = `I back ${tokenAddress} with ${amountDeclared} conviction for ${lockDurationDays} days`;
  if (!message.includes(tokenAddress) || !message.includes(String(lockDurationDays))) {
    return NextResponse.json({ error: "Message does not match expected format" }, { status: 400 });
  }

  const lockedUntil = new Date(Date.now() + lockDurationDays * 24 * 60 * 60 * 1000);

  const vote = await prisma.convictionVote.create({
    data: {
      userId,
      launchTokenAddress: tokenAddress,
      chain,
      amountDeclared: String(amountDeclared),
      amountUsd,
      lockDurationDays,
      message,
      signature,
      signerAddress,
      lockedUntil,
    },
    include: { user: true },
  });

  // Update social stats — conviction weighted by lock multiplier
  const weightedUsd = amountUsd * (CONVICTION_LOCK_MULTIPLIERS[lockDurationDays] ?? 1);
  await prisma.launchSocialStats.upsert({
    where: { tokenAddress },
    update: {
      convictionTotal: { increment: weightedUsd },
      upvoteCount: { increment: 1 },
    },
    create: {
      tokenAddress,
      convictionTotal: weightedUsd,
      upvoteCount: 1,
    },
  });

  return NextResponse.json(
    {
      id: vote.id,
      userId: vote.userId,
      displayName: vote.user.displayName,
      avatarUrl: vote.user.avatarUrl,
      amountDeclared: vote.amountDeclared,
      amountUsd: vote.amountUsd,
      lockDurationDays: vote.lockDurationDays,
      lockedUntil: vote.lockedUntil.toISOString(),
      chain: vote.chain,
      createdAt: vote.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
