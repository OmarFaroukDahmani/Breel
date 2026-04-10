import { NextRequest, NextResponse } from "next/server";
import { videoQueue } from "@/lib/queue";
import { getServerSession } from "next-auth";


export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { jobId, retryAll } = body;

        if (retryAll) {
            const failedJobs = await videoQueue.getFailed();
            let retriedCount = 0;

            for (const job of failedJobs) {
                await job.retry();
                retriedCount++;
            }

            return NextResponse.json({
                success: true,
                message: `Retried ${retriedCount} failed jobs`,
                retriedCount,
            });
        } else if (jobId) {
            const job = await videoQueue.getJob(jobId);

            if (!job) {
                return NextResponse.json(
                    { success: false, error: "Job not found" },
                    { status: 404 }
                );
            }

            const state = await job.getState();
            if (state !== 'failed') {
                return NextResponse.json(
                    { success: false, error: `Job is not in failed state (current: ${state})` },
                    { status: 400 }
                );
            }

            await job.retry();

            return NextResponse.json({
                success: true,
                message: `Job ${jobId} has been retried`,
                jobId,
            });
        } else {
            return NextResponse.json(
                { success: false, error: "Must provide either jobId or retryAll=true" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error(" [Retry API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to retry job(s)",
                details: error.message
            },
            { status: 500 }
        );
    }
}
