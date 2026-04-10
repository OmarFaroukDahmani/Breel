import { 
  Home, 
  ChevronRight, 
  Info,
  CircleFadingArrowUp,
  FolderKanban,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Sidebar() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return (
      <div className="p-4 m-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-bold uppercase tracking-widest">
        Access Denied
      </div>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
    
  const navItems = [
    { icon: Home, label: 'Workspace', active: true, link: "/workspace" },
    { icon: FolderKanban, label: 'Projects', active: false, link: "/projects" },
    { icon: CircleFadingArrowUp, label: 'Upgrade', active: false, link: "/plans" },
  ];

  const bottomItems = [
    { icon: Info, label: "About Us", link: "/about" },
  ];

  return (
    <aside className="w-full h-screen bg-white flex flex-col border-r border-slate-100 p-6 font-sans">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
          <Sparkles size={20} className="text-white" />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tighter">Breel</span>
      </div>
        
      <Link href={'/dashboard'}>
        <div className="flex items-center justify-between p-4 mb-8 bg-slate-50 rounded-[1.5rem] border border-slate-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
              <UserIcon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 line-clamp-1">{dbUser?.username || "Creator"}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dbUser?.plan || "Free"} Plan</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
        </div>
      </Link>

      <nav className="flex-1 space-y-2">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Menu</p>
        {navItems.map((item) => (
          <Link
            href={item.link}
            key={item.label}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
              item.active 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="pt-6 mt-auto border-t border-slate-50 space-y-2">
        {bottomItems.map((item) => (
          <Link
            href={item.link}
            key={item.label}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-indigo-600 font-bold text-sm transition-all"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}