import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    console.log("📥 Received Webhook. Signature present:", !!signature);

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;
        const creditsFromMetadata = session.metadata?.credits ? parseInt(session.metadata.credits) : null;
        const amount = session.amount_total || 0;

        console.log(`📦 Webhook Session Data:`, {
            userId,
            planName,
            metadataCredits: creditsFromMetadata,
            amount,
            currency: session.currency,
            paymentStatus: session.payment_status,
            metadata: session.metadata
        });

        if (!userId) {
            console.error("❌ Webhook Error: No userId in metadata. Full Session:", JSON.stringify(session, null, 2));
            return new NextResponse("User id is required", { status: 400 });
        }

        const userIdInt = parseInt(userId);

        try {
            await prisma.$transaction(async (tx) => {
                // 1. Log the transaction
                const transaction = await tx.transaction.create({
                    data: {
                        userId: userIdInt,
                        amount: amount,
                        type: "PURCHASE",
                        reason: planName 
                            ? `Plan Upgrade: ${planName} [STRIPE_SESSION:${session.id}]` 
                            : `Credit Purchase [STRIPE_SESSION:${session.id}]`,
                    }
                });
                console.log(`📝 Transaction record created: ${transaction.id}`);

                let creditsToAdd = 0;

                // 2. Determine credits and plan updates
                if (planName) {
                    // Plan Upgrades
                    if (creditsFromMetadata) {
                        creditsToAdd = creditsFromMetadata;
                    } else {
                        // Fallback logic for old sessions
                        if (planName === 'PREMIUM') creditsToAdd = 100;
                        else if (planName === 'ULTIMATE') creditsToAdd = 500;
                    }

                    await tx.user.update({
                        where: { id: userIdInt },
                        data: {
                            plan: planName as any,
                            credits: { increment: creditsToAdd }
                        }
                    });
                    console.log(`✅ Net Upgrade: User ${userId} to ${planName} (+${creditsToAdd} credits)`);
                } else {
                    // Individual Credit Packs
                    if (creditsFromMetadata) {
                        creditsToAdd = creditsFromMetadata;
                    } else {
                        // Fallback amount mapping for old sessions
                        if (amount === 500) creditsToAdd = 20;
                        else if (amount === 2000) creditsToAdd = 100;
                        else if (amount === 8000) creditsToAdd = 500;
                    }

                    if (creditsToAdd > 0) {
                        await tx.user.update({
                            where: { id: userIdInt },
                            data: {
                                credits: { increment: creditsToAdd }
                            }
                        });
                        console.log(`✅ Credits added: ${creditsToAdd} to user ${userId} for amount ${amount}`);
                    } else {
                        console.warn(`⚠️ No credit mapping found for metadata: ${creditsFromMetadata} or amount: ${amount}.`);
                    }
                }
            });
        } catch (error: any) {
            console.error(`❌ Database Update Failed: ${error.message}`);
            return new NextResponse("Database Error", { status: 500 });
        }
    } else {
        console.log(`ℹ️ Received Stripe event: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
}
