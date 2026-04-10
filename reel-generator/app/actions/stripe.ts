"use server"

import { Stripe } from "stripe";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(priceId: string, mode: "payment" | "subscription" = "payment", planName?: string, credits?: number) {
  const session = await getServerSession(authOptions as any);
  const user = (session as any)?.user as any;

  if (!user || !user.email || !user.id) {
    redirect("/api/auth/signin");
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const stripeSession = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: mode,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/canceled`,
    customer_email: user.email,
    metadata: {
      userId: user.id.toString(),
      ...(planName && { planName }),
      ...(credits && { credits: credits.toString() }),
    },
  });

  redirect(stripeSession.url!);
}
