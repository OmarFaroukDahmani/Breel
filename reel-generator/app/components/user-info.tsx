import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCog , LogOut, Coins } from 'lucide-react';

export default async function UserInfo() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return (
      <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[10px] font-black uppercase tracking-widest">
        Access Denied
      </div>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return (
    <nav className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-xl font-black text-slate-900 truncate max-w-[150px] sm:max-w-none tracking-tight">
              Hi, <span className="text-indigo-600">{dbUser?.username || "User"}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            
            <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 sm:px-5 py-2 rounded-[1.25rem] shadow-sm transition-all hover:border-indigo-100 hover:shadow-md group">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                <Coins size={16} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base text-slate-800 font-black tracking-tight">
                  {dbUser?.credits ?? 0}
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 bg-slate-900 text-[9px] text-white rounded-md uppercase font-black tracking-widest">
                  {dbUser?.plan || "Free"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 pl-4 sm:pl-6 border-l border-slate-100">
              <Link 
                href="/profile" 
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Account Settings"
              >
                <UserCog  size={22} />
              </Link>
              
              <Link 
                href="/api/auth/signout" 
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-red-50 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}