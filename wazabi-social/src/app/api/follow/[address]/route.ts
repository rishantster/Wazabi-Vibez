import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Follow a creator
export async function POST(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;
  const { address } = params;

  // Find the target user by wallet address
  const targetUser = await prisma.user.findFirst({
    where: { walletAddress: address },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === currentUserId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Upsert to handle duplicate follows gracefully
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    },
    update: {},
    create: {
      followerId: currentUserId,
      followingId: targetUser.id,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: targetUser.id,
      type: "new_follower",
      payload: {
        followerId: currentUserId,
        followerAddress: (session.user as any).walletAddress,
      },
    },
  });

  return NextResponse.json({ following: true });
}

// Unfollow a creator
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;
  const { address } = params;

  const targetUser = await prisma.user.findFirst({
    where: { walletAddress: address },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUser.id,
    },
  });

  return NextResponse.json({ following: false });
}
