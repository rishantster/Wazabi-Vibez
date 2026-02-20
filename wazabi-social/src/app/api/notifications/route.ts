import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
  const limit = 30;
  const offset = (page - 1) * limit;
  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";

  const where: any = { userId };
  if (unreadOnly) where.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return NextResponse.json({
    data: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      payload: n.payload,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    page,
    limit,
    total,
    unreadCount,
    hasMore: offset + limit < total,
  });
}

// Mark notifications as read
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { notificationIds, markAllRead } = body;

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } else if (notificationIds?.length) {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // ensure user owns these notifications
      },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
