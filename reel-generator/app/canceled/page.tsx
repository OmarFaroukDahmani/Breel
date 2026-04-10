import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CanceledPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Payment Canceled</h1>
                <p className="text-gray-600 mb-8">
                    Your payment was canceled. No charges were made.
                </p>
                <Link
                    href="/pricing"
                    className="block w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
                >
                    Try Again
                </Link>
            </div>
        </div>
    );
}
