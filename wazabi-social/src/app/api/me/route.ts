import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reputationStats: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    walletAddress: user.walletAddress,
    walletChain: user.walletChain,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    githubUsername: user.githubUsername,
    twitterHandle: user.twitterHandle,
    reputationScore: user.reputationStats?.reputationScore ?? 0,
    followerCount: user._count.followers,
    followingCount: user._count.following,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

  const allowedFields = ["displayName", "avatarUrl", "bio"];
  const updateData: Record<string, string> = {};

  for (const field of allowedFields) {
    if (field in body && typeof body[field] === "string") {
      updateData[field] = body[field].trim();
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Validate field lengths
  if (updateData.displayName && updateData.displayName.length > 50) {
    return NextResponse.json({ error: "Display name too long (max 50)" }, { status: 400 });
  }
  if (updateData.bio && updateData.bio.length > 500) {
    return NextResponse.json({ error: "Bio too long (max 500)" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json({
    id: updated.id,
    displayName: updated.displayName,
    avatarUrl: updated.avatarUrl,
    bio: updated.bio,
  });
}
