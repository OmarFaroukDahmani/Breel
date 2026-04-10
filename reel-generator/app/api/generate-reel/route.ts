import { NextResponse } from "next/server";
import { videoQueue, PRIORITY_MAP } from "@/lib/queue";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { plan: true } 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

   
    const priority = PRIORITY_MAP[user.plan] || 10;

    const job = await videoQueue.add(
      "generate-reel",
      { topic, userId },
      {
        priority, 
        removeOnComplete: { age: 300 }, 
        removeOnFail: { count: 20 } 
      }
    );

    console.log(`Job ${job.id} queued for User ${userId} (${user.plan}) with Priority ${priority}`);

    return NextResponse.json({
      success: true,
      message: "Job queued",
      jobId: job.id
    });

  } catch (error: any) {
    console.error("Queue Error:", error);
    return NextResponse.json({ error: "Failed to queue job" }, { status: 500 });
  }
}