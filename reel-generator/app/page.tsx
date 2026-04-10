import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 selection:bg-indigo-100">

      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-sm shadow-lg">
              B
            </div>
            Breel
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold">

            <Link
              href="/plans"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Pricing
            </Link>

            {session ? (
              <Link
                href="/api/auth/signout"
                className="px-5 py-2 rounded-xl text-red-500 border border-red-200 hover:bg-red-50 transition"
              >
                Sign out
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <header className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-36 overflow-hidden">

        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-200/40 blur-[140px] rounded-full" />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600">
          <Sparkles size={14} />
          AI Reel Generator
        </div>

        <h1 className="max-w-4xl text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-8">
          Turn your ideas into <br />
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent italic">
            viral reels
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-14">
          Your Idea will finally come true. <br />
          Generate short-form videos automatically using AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={session ? "/workspace" : "/signup"}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-indigo-200 transition hover:bg-slate-800 active:scale-95"
          >
            {session ? "Start Generating" : "Start For Free"}
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </header>

      <footer className="mt-auto border-t border-slate-100 py-10 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          © 2026 Breel · Built for creators
        </p>
      </footer>
    </div>
  );
}
