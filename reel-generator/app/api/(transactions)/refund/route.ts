import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(); 
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const userEmail = session?.user?.email!;
      
      const user = await tx.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) throw new Error("User not found");

      const updatedUser = await tx.user.update({
        where: { email: userEmail },
        data: { credits: { increment: 1 } },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: 1,
          type: "REFUND",
          reason: "Video generation failed",
        },
      });

      return { 
        success: true, 
        newBalance: updatedUser.credits 
      };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Refund Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}