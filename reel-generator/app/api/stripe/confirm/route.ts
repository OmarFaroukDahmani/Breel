import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"]
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Session not paid" }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId in metadata" }, { status: 400 });
    }
    const userIdInt = parseInt(userId);
    const planName = session.metadata?.planName || null;
    const creditsFromMetadata = session.metadata?.credits ? parseInt(session.metadata.credits) : null;
    const amount = session.amount_total || 0;

    const existing = await prisma.transaction.findFirst({
      where: {
        userId: userIdInt,
        reason: { contains: `[STRIPE_SESSION:${session.id}]` }
      }
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already processed", sessionId });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: userIdInt,
          amount,
          type: "PURCHASE",
          reason: planName 
            ? `Plan Upgrade: ${planName} [STRIPE_SESSION:${session.id}]`
            : `Credit Purchase [STRIPE_SESSION:${session.id}]`,
        }
      });

      let creditsToAdd = 0;
      if (planName) {
        if (creditsFromMetadata) creditsToAdd = creditsFromMetadata;
        else if (planName === "PREMIUM") creditsToAdd = 100;
        else if (planName === "ULTIMATE") creditsToAdd = 500;

        const updatedUser = await tx.user.update({
          where: { id: userIdInt },
          data: {
            plan: planName as any,
            credits: { increment: creditsToAdd }
          }
        });
        return { transaction, updatedUser };
      } else {
        if (creditsFromMetadata) creditsToAdd = creditsFromMetadata;
        else if (amount === 500) creditsToAdd = 20;
        else if (amount === 2000) creditsToAdd = 100;
        else if (amount === 8000) creditsToAdd = 500;

        const updatedUser = await tx.user.update({
          where: { id: userIdInt },
          data: { credits: { increment: creditsToAdd } }
        });
        return { transaction, updatedUser };
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Stripe Confirm Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
