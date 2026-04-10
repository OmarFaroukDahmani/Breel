import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId, topic, userId } = body;

    const parsedUserId = Number(userId);

    if (!videoId || isNaN(parsedUserId)) {
      return NextResponse.json({ error: "Invalid Video ID or User ID" }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: parsedUserId }
    });

    if (!userExists) {
      return NextResponse.json({ error: "User does not exist in database" }, { status: 404 });
    }

    const project = await prisma.projects.upsert({
      where: { videoId: videoId },
      update: {
        topic: topic || "Untitled Reel",
        userId: parsedUserId,
      },
      create: {
        videoId: videoId,
        topic: topic || "New Reel",
        user: {
          connect: { id: parsedUserId }
        }
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Detailed Prisma Error:", error.code, error.message);
    return NextResponse.json({ 
      error: "Database error", 
      code: error.code,
      message: error.message 
    }, { status: 500 });
  }
}