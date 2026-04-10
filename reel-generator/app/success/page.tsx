"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [message, setMessage] = useState("Thank you for your purchase. Your credits have been added to your account.");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    setStatus("processing");
    fetch(`/api/stripe/confirm?session_id=${sessionId}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("done");
          setMessage("Payment confirmed. Your account has been updated.");
        } else {
          setStatus("error");
          setMessage(data.error || "Could not confirm payment. If credits are missing, contact support.");
        }
      })
      .catch((e) => {
        setStatus("error");
        setMessage("Network error while confirming payment.");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8 text-sm">
          {message}
        </p>
        <Link
          href="workspace"
          className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          Go to Workspace
        </Link>
        {status === "processing" && (
          <div className="mt-4 text-xs text-slate-500">Finalizing your account...</div>
        )}
      </div>
    </div>
  );
}
