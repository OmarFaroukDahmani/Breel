import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "../components/delete-user";
import {
  User,
  History,
  ChevronLeft,
  LogOut,
  ShoppingBag,
} from "lucide-react";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-lg font-bold text-slate-700">
          Access Denied
        </div>
      </div>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Link
            href="/workspace"
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition"
          >
            <span className="p-2 rounded-xl bg-white shadow group-hover:bg-indigo-50 transition">
              <ChevronLeft size={16} />
            </span>
            Back to Workspace
          </Link>

          <div className="flex gap-3">
            <Link
              href="/plans"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition"
            >
              <ShoppingBag size={16} />
              Buy Tokens
            </Link>

            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              Sign out
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-white bg-white/80 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

              <div className="relative z-10 flex items-center justify-between mb-8">
                <h2 className="flex items-center gap-3 text-2xl font-black text-slate-800">
                  <User size={24} className="text-indigo-600" />
                  Account Overview
                </h2>
                <DeleteButton />
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Username
                  </span>
                  <p className="text-lg font-bold text-slate-800">
                    {dbUser?.username || "Not set"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Email
                  </span>
                  <p className="text-lg font-bold text-slate-800">
                    {dbUser?.email}
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-indigo-50 blur-2xl" />
            </div>
          </div>

          <div className="h-fit">
            <div className="rounded-3xl border border-white bg-white/80 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

              <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-slate-800">
                <History size={20} className="text-indigo-600" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {dbUser?.transactions.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-white hover:shadow-md overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex-1 min-w-0 text-sm font-bold text-slate-700 truncate">
                        {t.reason}
                      </span>
                      <span
                        className={`text-xs font-black ${
                          t.amount < 0
                            ? "text-red-500"
                            : "text-emerald-500"
                        } shrink-0`}
                      >
                        {t.amount > 0 ? `+${t.amount}` : t.amount}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {dbUser?.transactions.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium italic text-slate-400">
                      No transactions yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
