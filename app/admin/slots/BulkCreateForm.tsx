"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkCreateForm() {
  const [date, setDate] = useState("");
  const [timesInput, setTimesInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const times = timesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (times.length === 0) {
      setMsg("Ingen gyldige tider.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, times }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setMsg(`${json.data.created} tider oprettet!`);
      setDate("");
      setTimesInput("");
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
          Tider (kommasepareret)
        </label>
        <input
          type="text"
          value={timesInput}
          onChange={(e) => setTimesInput(e.target.value)}
          placeholder="13:00, 15:00, 18:00"
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
        {loading ? "Opretter..." : "Opret alle"}
      </button>
    </form>
  );
}
