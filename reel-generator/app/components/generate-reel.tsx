"use client";

import { useState, useEffect, useRef } from "react";
import VideoGenrate from "../components/video-genrate";
import {
  Sparkles,
  RotateCcw,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function ReelGenerator() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [userPlan, setUserPlan] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user?.id) {
          setUserId(session.user.id);
          setUserPlan(session.user.plan);
        }
      } catch (e) {
        console.error("Session error", e);
      }
    };

    init();

    const saved = localStorage.getItem("currentVedioId");
    if (saved) setVideoId(saved);

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);



  const startPolling = (jobId: string, currentIdea: string) => {
    setStatusMessage("Job is in the queue...");

    pollingInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?jobId=${jobId}`);
        const data = await res.json();

        const metricsRes = await fetch("/api/queue/metrics");
        const metricsData = await metricsRes.json();
        
        let latestQueuePos: number | null = null;
        if (metricsData?.success) {
          latestQueuePos = metricsData.metrics.waiting > 0 ? metricsData.metrics.waiting : null;
          setQueuePosition(latestQueuePos);
        }

        if (data.state === "waiting") {
          setStatusMessage(
            latestQueuePos ? `Queue position #${latestQueuePos}` : "Waiting in queue..."
          );
        }

        if (data.state === "active") {
          setStatusMessage("AI is rendering your video...");
          setQueuePosition(null);
        }

        if (data.state === "completed") {
          if (pollingInterval.current) clearInterval(pollingInterval.current);

          let foundId: string | null = null;
          const result = data.result;

          if (result?.videoId) foundId = result.videoId;
          else if (Array.isArray(result))
            foundId = result[0]?.videoId || result[0]?.json?.videoId;
          else if (result?.json?.videoId)
            foundId = result.json.videoId;

          if (foundId) {
            setVideoId(foundId);
            localStorage.setItem("currentVedioId", foundId);
            setLoading(false);
            

          } else {
            setError("Video generated but ID not found.");
            setLoading(false);
          }
        }

        if (data.state === "failed") {
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          setError("The background worker failed.");
          setLoading(false);
          setQueuePosition(null);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
  };

  const handleGenerate = async () => {
    if (!idea || !userId) {
        if (!userId) setError("Please sign in to generate reels.");
        return;
    };

    setError("");
    setLoading(true);
    setStatusMessage("Connecting to queue...");

    try {
      const spendRes = await fetch("/api/spend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },              
          body: JSON.stringify({ idea }),
        });

        if (!spendRes.ok) {
          const txData = await spendRes.json();
          throw new Error(txData.message || "Failed to process credits.");
        }
      const res = await fetch("/api/generate-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: idea, userId }),
      });

      const data = await res.json();
      if (!data.jobId) throw new Error(data.error || "No Job ID returned.");

      startPolling(data.jobId, idea);
    } catch (err: any) {
      await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Socket hang up or generation error" }),
      });
      setError(err.message);
      setLoading(false);
    }
  };

  const reset = () => {
    setIdea("");
    setVideoId("");
    localStorage.removeItem("currentVedioId");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-2xl">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!videoId ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                AI Reel Generator
              </h1>
              <p className="text-sm text-gray-500">
                Turn a simple idea into a short-form video.
              </p>
            </div>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={loading}
              placeholder="A futuristic city at night, neon lights, flying cars..."
              className="w-full h-36 resize-none rounded-2xl border border-gray-200 px-5 py-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !idea}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {statusMessage}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Reel
                  </>
                )}
              </span>
            </button>

            {loading && (
              <div className="space-y-3">
                {queuePosition !== null && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                    <p className="text-sm font-bold text-blue-700">
                      Queue Position #{queuePosition}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {userPlan === "ULTIMATE"
                        ? "Ultra priority processing"
                        : userPlan === "PREMIUM"
                        ? "Fast lane enabled"
                        : "Standard queue"}
                    </p>
                  </div>
                )}
                <p className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  Average time: 1–2 minutes
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
              >
                <RotateCcw size={14} />
                New Reel
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <VideoGenrate
                videoId={videoId}
                topic={idea}
                userId={userId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}