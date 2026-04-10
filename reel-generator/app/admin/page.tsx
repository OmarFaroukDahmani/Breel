"use client";

import { useState, useEffect } from "react";
import { getAdminDashboardData } from "./actions";
import { 
  Users, Video, CreditCard, RefreshCw, 
  ExternalLink, UserCheck, Clock 
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const result = await getAdminDashboardData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <RefreshCw className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Admin</h1>
            <p className="text-gray-500 mt-1">Real-time overview of users and video generations.</p>
          </div>
          <Link href={"/create"} className="p-2 hover:bg-gray-200 rounded-full transition-colors" >
            create new workflow
          </Link>
          <button onClick={fetchData} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatBox label="Total Users" value={data.stats.totalUsers} icon={Users} color="bg-blue-500" />
          <StatBox label="Videos Generated" value={data.stats.totalVideos} icon={Video} color="bg-purple-500" />
          <StatBox label="Credits Consumed" value={data.stats.totalCreditsSpent} icon={CreditCard} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Recent Projects</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Topic / Video ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentProjects.map((p: any) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 truncate max-w-[200px]">{p.topic}</p>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-tighter">{p.videoId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">{p.user.username}</p>
                        <p className="text-xs text-gray-400">{p.user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserCheck size={18} className="text-green-500" /> Top Creators
            </h2>
            <div className="space-y-6">
              {data.topUsers.map((u: any, i: number) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{u.username}</p>
                      <p className="text-xs text-gray-400 uppercase">{u.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">{u._count.projects}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Reels</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}