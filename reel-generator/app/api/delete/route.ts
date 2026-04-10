import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
    }

    await prisma.user.delete({
      where: { email: session.user.email },
    });

    return NextResponse.json({ message: "Account deleted forever" });

  } catch (error) {
    return NextResponse.json({ message: "Could not delete account" }, { status: 500 });
  }
}