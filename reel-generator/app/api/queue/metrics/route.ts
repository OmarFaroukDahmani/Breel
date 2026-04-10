import { NextResponse } from "next/server";
import { getQueueMetrics } from "@/lib/queue";

export async function GET() {
    try {
        const metrics = await getQueueMetrics();

        return NextResponse.json({
            success: true,
            metrics,
        });
    } catch (error: any) {
        console.error("[Metrics API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch queue metrics",
                details: error.message
            },
            { status: 500 }
        );
    }
}
