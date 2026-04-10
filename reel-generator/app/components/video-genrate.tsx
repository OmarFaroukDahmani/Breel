"use client"

import { useState, useEffect } from 'react'
import SaveReel from './save-reel';
import { Loader2, CheckCircle, Download, FileVideo } from "lucide-react";

type SaveReelProps = {
  videoId: string;
  topic: string;
  userId: any; 
}

export default function VideoGenerate({ videoId, topic, userId }: SaveReelProps) {
  const [videoStatus, setVideoStatus] = useState("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api-proxy/short-video/${videoId}/status`);
        const data = await res.json();
        
        setVideoStatus(data.status);

        if (data.status === 'ready') {
          setVideoUrl(`/api-proxy/short-video/${videoId}`);
        } else if (data.status !== 'failed') {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    };

    checkStatus();
  }, [videoId]);

  if (!videoId) return null;

  return (
    <div className="p-8 text-slate-900">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Production ID</p>
          <p className="font-mono text-xs text-indigo-600 font-bold">{videoId}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          {videoStatus === 'ready' ? (
            <CheckCircle size={14} className="text-emerald-500" />
          ) : (
            <Loader2 size={14} className="animate-spin text-indigo-500" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {videoStatus}
          </span>
        </div>
      </div>
      
      {videoStatus === "ready" && videoUrl ? (
        <div className="flex flex-col items-center animate-in fade-in duration-700">
          <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-100 mb-8 bg-slate-50 aspect-[9/16] w-full max-w-[320px] mx-auto">
            <video 
              src={videoUrl} 
              controls 
              className="h-full w-full object-contain" 
            />
          </div>

          <div className="flex items-center justify-center flex-col sm:flex-row gap-4 w-full">
            <a 
              href={videoUrl} 
              download={`video-${videoId}.mp4`}
              className="flex items-center justify-center gap-2 p-5 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Download size={18} /> Download
            </a>

            <div >
              <SaveReel videoId={videoId} topic={topic} userId={userId} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse" />
            <div className="relative p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
              <FileVideo size={48} className="text-indigo-600" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Rendering your Reel</h3>
          <p className="text-sm text-slate-400 mt-2 font-medium max-w-[240px] leading-relaxed">
            Our AI is currently stitching your scenes and generating audio.
          </p>
        </div>
      )}
    </div>
  );
}