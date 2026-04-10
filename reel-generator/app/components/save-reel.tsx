"use client";

import { useState } from "react";
import { Bookmark, Check, Loader2, Save } from "lucide-react";

type SaveReelProps = {
  videoId: string;
  topic: string;
  userId: any; 
}

export default function SaveReel({ videoId, topic, userId }: SaveReelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (isSaved) return;

    setIsSaving(true);
    try {
      let finalUserId = typeof userId === 'function' ? await userId() : userId;

      if (!finalUserId) {
        alert("User session not found. Please refresh.");
        setIsSaving(false);
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          topic,
          userId: finalUserId, 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setIsSaved(true);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Error saving reel.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving || isSaved}
      className={`relative w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 border-2 ${
        isSaved 
          ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-lg shadow-emerald-50" 
          : "bg-white border-slate-100 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 shadow-sm"
      } ${isSaving ? "cursor-wait opacity-80" : ""}`}
    >
      {isSaving ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          <span>Processing...</span>
        </>
      ) : isSaved ? (
        <>
          <Check size={18} className="animate-in zoom-in duration-300" />
          <span>Added to Projects</span>
        </>
      ) : (
        <>
          <Bookmark size={18} className="transition-transform group-hover:-translate-y-0.5" />
          <span>Save to Library</span>
        </>
      )}
    </button>
  );
}