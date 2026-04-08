"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSlotForm() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setMsg("Tid oprettet!");
      setDate("");
      setTime("");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Fejl.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Dato
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Tid
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>
      {msg && (
        <p className="text-xs text-rose-500 font-medium">{msg}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
      >
        {loading ? "Opretter..." : "Opret tid"}
      </button>
    </form>
  );
}
