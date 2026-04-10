"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminDashboardData() {
  try {
    const [userCount, projectCount, transactionStats] = await Promise.all([
      prisma.user.count(),
      prisma.projects.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: "USAGE" }
      })
    ]);

    const recentProjects = await prisma.projects.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, email: true }
        }
      }
    });

    const topUsers = await prisma.user.findMany({
      take: 5,
      include: {
        _count: { select: { projects: true } }
      },
      orderBy: { projects: { _count: 'desc' } }
    });

    return {
      stats: {
        totalUsers: userCount,
        totalVideos: projectCount,
        totalCreditsSpent: transactionStats._sum.amount || 0,
      },
      recentProjects,
      topUsers
    };
  } catch (error) {
    console.error("Admin Data Fetch Error:", error);
    throw new Error("Failed to load admin data");
  }
}