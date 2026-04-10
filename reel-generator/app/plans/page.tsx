"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown, Coins, ChevronLeft } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe"; // Your server action

const plans = [
  {
    name: "FREE",
    price: "$0",
    description: "Perfect for trying things out",
    features: ["5 Credits included", "Standard priority", "1 Project"],
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    name: "PREMIUM",
    price: "$19",
    description: "Best for growing creators",
    features: ["100 Credits/mo", "High priority", "Unlimited Projects"],
    priceId: "price_1Sx9NhLUJYoNPXPmXGihZDlT",
    icon: <Zap className="w-5 h-5 text-blue-500" />,
  },
  {
    name: "ULTIMATE",
    price: "$49",
    description: "For heavy users and teams",
    features: ["500 Credits/mo", "Highest priority", "24/7 Support"],
    priceId: "price_1Sx9OGLUJYoNPXPmcLmyuT0H",
    icon: <Crown className="w-5 h-5 text-yellow-500" />,
  },
];

const creditBundles = [
  { name: "Starter Pack", credits: 20, price: "$5", priceId: "price_1Sx9PMLUJYoNPXPmd1TubPoz" },
  { name: "Pro Pack", credits: 100, price: "$20", priceId: "price_1Sx9PlLUJYoNPXPmfuUORMZf" },
  { name: "Whale Pack", credits: 500, price: "$80", priceId: "price_1Sx9Q5LUJYoNPXPmsEc1DCyV" },
];

export default function PricingSection() {
  const [view, setView] = useState<"plans" | "credits">("plans");

  return (
    <section className="py-12 max-w-6xl mx-auto px-4">
      <Link
        href="/"
        className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <span className="p-2 rounded-xl bg-white shadow group-hover:bg-indigo-50 transition">
          <ChevronLeft size={16} />
        </span>
        Back home
      </Link>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Upgrade your Experience</h2>

        <div className="flex justify-center items-center gap-4 bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setView("plans")}
            className={`px-4 py-2 rounded-md transition ${view === "plans" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            Monthly Plans
          </button>
          <button
            onClick={() => setView("credits")}
            className={`px-4 py-2 rounded-md transition ${view === "credits" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            Buy Credits
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {view === "plans" ? (
          plans.map((plan) => (
            <div key={plan.name} className="border rounded-2xl p-8 flex flex-col hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-xl">{plan.name}</span>
                {plan.icon}
              </div>
              <div className="text-4xl font-bold mb-2">{plan.price}<span className="text-sm text-gray-500">/mo</span></div>
              <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
              <form action={() => createCheckoutSession(plan.priceId!, "subscription", plan.name, plan.name === 'PREMIUM' ? 100 : 500)}>
                <button
                  disabled={plan.disabled}
                  className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium disabled:bg-gray-200"
                >
                  {plan.buttonText || "Upgrade Now"}
                </button>
              </form>
            </div>
          ))
        ) : (
          creditBundles.map((bundle) => (
            <div key={bundle.name} className="border rounded-2xl p-8 flex flex-col items-center text-center hover:border-blue-500 transition border-2">
              <Coins className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="font-bold text-lg">{bundle.name}</h3>
              <div className="text-3xl font-bold my-2">+{bundle.credits} Credits</div>
              <div className="text-gray-500 mb-6 font-medium">{bundle.price} one-time</div>
              <form action={() => createCheckoutSession(bundle.priceId, "payment", undefined, bundle.credits)}>
                <button className="w-full py-2 px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Purchase
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </section>
  );
}