import { NextRequest, NextResponse } from "next/server";
import { getRecentJobs } from "@/lib/queue";
import { getServerSession } from "next-auth";


export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get("status") as 'waiting' | 'active' | 'completed' | 'failed' || 'waiting';
        const limit = parseInt(searchParams.get("limit") || "20");

        const jobs = await getRecentJobs(status, limit);

        return NextResponse.json({
            success: true,
            status,
            count: jobs.length,
            jobs,
        });
    } catch (error: any) {
        console.error(" [Jobs API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch jobs",
                details: error.message
            },
            { status: 500 }
        );
    }
}
