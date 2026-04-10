import { NextRequest, NextResponse } from "next/server";
import { videoQueue } from "@/lib/queue";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ state: "invalid", error: "Missing jobId parameter" });
  }

  const job = await videoQueue.getJob(jobId);

  if (!job) {
    console.log(`Job ${jobId} not found in queue`);
    return NextResponse.json({ state: "not_found" });
  }

  const state = await job.getState();
  const result = job.returnvalue;

  console.log(`[Status API] Job ${jobId} - State: ${state}, Result:`, result);

  return NextResponse.json({ state, result });
}