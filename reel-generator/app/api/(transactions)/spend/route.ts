import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { idea, contentType } = await req.json();

    const result = await prisma.$transaction(async (tx) => {

      const userEmail = session?.user?.email;
      
      if (!userEmail) throw new Error("User email not found");

      const user = await tx.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) throw new Error("User not found");

      if (user.credits < 1) {
        throw new Error("You don't have enough credits!");
      }

      if (!userEmail) throw new Error("User email not found");
      
      await tx.user.update({
        where: { email: userEmail },
        data: { credits: { decrement: 1 } },
      });


      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -1,
          type: "USAGE", 
          reason: `Generated ${contentType}: ${idea.substring(0, 20)}...`,
        },
      });

      return { success: true, message: `Your ${contentType} is being created!` };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}