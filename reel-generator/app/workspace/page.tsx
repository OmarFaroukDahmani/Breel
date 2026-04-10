import UserInfo from "../components/user-info";
import ReelGenerator from "../components/generate-reel";
import Sidebar from "../components/sidebar";

export default function WorkspaceLayout() {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <div className="flex-none w-64 lg:w-72 hidden md:block">
        <Sidebar />
      </div> 

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="h-20 flex items-center px-8 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <div className="w-full  mx-auto flex justify-end">
            <UserInfo />
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center ">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ReelGenerator />
          </div>
        </main>
      </div>
    </div> 
  );
}