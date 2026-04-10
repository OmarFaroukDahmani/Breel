"use client";

import { useState, useEffect } from "react";
import { createReelWorkflow, getWorkflows } from "./actions";
import { 
  Settings2, Activity, RefreshCw, ExternalLink, 
  MessageSquare, Clock, Video, Layers, Mic 
} from "lucide-react";

export default function WorkflowMasterPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    model: "llama3.2:latest",
    interval: 1,
    voiceName: "en-US-Wavenet-D",
    aspectRatio: "16:9",
    systemPrompt: "Create a video script about the topic. Return JSON only with fields video_title and scenes."
  });

  const loadData = async () => {
    setFetching(true);
    const data = await getWorkflows();
    setList(data);
    setFetching(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createReelWorkflow(form);
    if (res.success) {
      loadData();
      alert("New Reel Engine Deployed!");
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reel Architect</h1>
            <p className="text-slate-500 font-medium">Deploy automated Postgres-to-Video workers.</p>
          </div>
          <button onClick={loadData} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 border border-slate-200 transition-all">
            <RefreshCw size={20} className={fetching ? "animate-spin" : ""} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white sticky top-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Worker Config</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <InputWrapper label="Workflow Name" icon={<Layers size={14}/>}>
                  <input className="field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Daily Tech Reels" required />
                </InputWrapper>

                <div className="grid grid-cols-2 gap-4">
                  <InputWrapper label="Check Every (Min)" icon={<Clock size={14}/>}>
                    <input type="number" className="field" value={form.interval} onChange={e=>setForm({...form, interval:parseInt(e.target.value)})} />
                  </InputWrapper>
                  <InputWrapper label="Aspect Ratio" icon={<Video size={14}/>}>
                    <select className="field" value={form.aspectRatio} onChange={e=>setForm({...form, aspectRatio:e.target.value})}>
                      <option value="16:9">16:9 (YouTube)</option>
                      <option value="9:16">9:16 (TikTok)</option>
                      <option value="1:1">1:1 (Insta)</option>
                    </select>
                  </InputWrapper>
                </div>

                <InputWrapper label="Voice Model" icon={<Mic size={14}/>}>
                  <input className="field" value={form.voiceName} onChange={e=>setForm({...form, voiceName:e.target.value})} />
                </InputWrapper>

                <InputWrapper label="AI System Instructions" icon={<MessageSquare size={14}/>}>
                  <textarea className="field h-24 resize-none text-sm" value={form.systemPrompt} onChange={e=>setForm({...form, systemPrompt:e.target.value})} />
                </InputWrapper>

                <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300">
                  {loading ? "Injecting Logic..." : "Deploy Worker to n8n"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl min-h-[600px]">
                <h2 className="text-xl font-bold flex items-center gap-3 mb-8">
                   <Activity className="text-indigo-400" /> Active Worker Fleet
                </h2>
                <div className="space-y-4">
                  {list.map((wf) => (
                    <div key={wf.id} className="group bg-slate-800/50 border border-slate-700/50 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-800 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${wf.active ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-slate-600'}`}></div>
                        <div>
                          <h3 className="font-bold text-slate-100">{wf.name}</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">POSTGRES QUEUE ENABLED</p>
                        </div>
                      </div>
                      <a href={`http://localhost:5678/workflow/${wf.id}`} target="_blank" className="p-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-indigo-600 transition-all">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .field {
          @apply w-full mt-2 p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none text-slate-900 font-medium transition-all text-sm;
        }
      `}</style>
    </div>
  );
}

function InputWrapper({ label, children, icon }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2 ml-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}