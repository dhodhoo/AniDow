"use client";

import { Bug, MessageSquare, Send, X } from "lucide-react";
import { useState } from "react";

const TYPES = ["Bug", "Saran", "Kritik"] as const;

export default function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("Bug");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const reset = () => {
    setType("Bug");
    setName("");
    setMessage("");
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null, type, message: message.trim() }),
      });
      if (!res.ok) throw new Error("Gagal mengirim feedback");
      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/50"
        title="Kirim Feedback"
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          />

          {/* Modal Body */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Kirim Feedback</h2>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Send className="h-10 w-10 text-emerald-400" />
                <p className="text-white font-semibold">Feedback terkirim!</p>
                <p className="text-sm text-zinc-400">Terima kasih atas masukan Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tipe</label>
                  <div className="flex gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                          type === t
                            ? "border-indigo-400 bg-indigo-600 text-white"
                            : "border-white/10 bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="fb-name">
                    Nama <span className="text-zinc-500">(opsional)</span>
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anonim"
                    className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="fb-msg">
                    Pesan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="fb-msg"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ceritakan bug, saran, atau kritik Anda..."
                    className="resize-none rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-400">Gagal mengirim, coba lagi nanti.</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !message.trim()}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {status === "loading" ? "Mengirim..." : "Kirim"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
