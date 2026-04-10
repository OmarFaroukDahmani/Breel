import { createCheckoutSession } from "@/app/actions/stripe";

export default function CheckoutButton({ priceId }: { priceId: string }) {
  return (
    <form action={() => createCheckoutSession(priceId)}>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Buy Now
      </button>
    </form>
  );
}