import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus, Download, Video, Calendar } from "lucide-react";

export default async function ProjectsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) redirect("/api/auth/signin");

  const projects = await prisma.projects.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
              <Video size={16} /> Library
            </div>
            <h1 className="text-4xl font-black tracking-tight">My Projects</h1>
            <p className="text-slate-500 font-medium">Manage and export your generated assets.</p>
          </div>
          <a 
            href="/workspace" 
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} /> Create New Reel
          </a>
        </header>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white p-24 rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <Video size={40} />
            </div>
            <p className="text-slate-400 text-xl font-bold text-center">Your library is empty.<br/><span className="text-sm font-medium">Start generating to see your reels here.</span></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[9/16] bg-slate-900 relative">
                  <video 
                    src={`/api-proxy/short-video/${proj.videoId}`} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {'Reel'}
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="font-black text-slate-800 text-lg mb-4 line-clamp-2 leading-tight">
                    { proj.topic || "Untitled Reel"}
                  </h2>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-tighter">
                      <Calendar size={12} />
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </div>
                    
                    <a 
                      href={`/api-proxy/short-video/${proj.videoId}`} 
                      download={`video-${proj.videoId}.mp4`}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors"
                      title="Download Video"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}