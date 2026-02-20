import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CommentData } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  const { tokenAddress } = params;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
  const limit = 30;
  const offset = (page - 1) * limit;

  // Get top-level comments with first level of replies
  const comments = await prisma.comment.findMany({
    where: {
      launchTokenAddress: tokenAddress,
      parentCommentId: null,
    },
    include: {
      user: {
        include: { reputationStats: true },
      },
      replies: {
        include: {
          user: {
            include: { reputationStats: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  });

  const total = await prisma.comment.count({
    where: {
      launchTokenAddress: tokenAddress,
      parentCommentId: null,
    },
  });

  function mapComment(c: any): CommentData {
    return {
      id: c.id,
      body: c.body,
      userId: c.userId,
      displayName: c.user.displayName,
      avatarUrl: c.user.avatarUrl,
      reputationScore: c.user.reputationStats?.reputationScore ?? 0,
      parentCommentId: c.parentCommentId,
      replies: (c.replies ?? []).map(mapComment),
      createdAt: c.createdAt.toISOString(),
      editedAt: c.editedAt?.toISOString() ?? null,
    };
  }

  return NextResponse.json({
    data: comments.map(mapComment),
    page,
    limit,
    total,
    hasMore: offset + limit < total,
  });
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
  const { text, parentCommentId } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }

  if (text.length > 2000) {
    return NextResponse.json({ error: "Comment too long (max 2000 chars)" }, { status: 400 });
  }

  // Verify parent exists if replying
  if (parentCommentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentCommentId },
    });
    if (!parent || parent.launchTokenAddress !== tokenAddress) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      launchTokenAddress: tokenAddress,
      userId,
      parentCommentId: parentCommentId || null,
      body: text.trim(),
    },
    include: {
      user: {
        include: { reputationStats: true },
      },
    },
  });

  // Update comment count on social stats
  await prisma.launchSocialStats.upsert({
    where: { tokenAddress },
    update: { commentCount: { increment: 1 } },
    create: { tokenAddress, commentCount: 1 },
  });

  // Create notification for launch creator (if not self-comment)
  // We'd look up the creator here — simplified for now

  const mapped: CommentData = {
    id: comment.id,
    body: comment.body,
    userId: comment.userId,
    displayName: comment.user.displayName,
    avatarUrl: comment.user.avatarUrl,
    reputationScore: comment.user.reputationStats?.reputationScore ?? 0,
    parentCommentId: comment.parentCommentId,
    replies: [],
    createdAt: comment.createdAt.toISOString(),
    editedAt: null,
  };

  return NextResponse.json(mapped, { status: 201 });
}
