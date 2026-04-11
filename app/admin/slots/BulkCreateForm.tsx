"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Generer alle tider fra 08:00 til 20:00 i halvtimer
const ALL_TIMES: string[] = [];
for (let h = 8; h <= 20; h++) {
  ALL_TIMES.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) {
    ALL_TIMES.push(`${String(h).padStart(2, "0")}:30`);
  }
}

export default function BulkCreateForm() {
  const [date, setDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function toggleTime(time: string) {
    setSelectedTimes((prev) => {
      const next = new Set(prev);
      if (next.has(time)) {
        next.delete(time);
      } else {
        next.add(time);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedTimes(new Set(ALL_TIMES));
  }

  function clearAll() {
    setSelectedTimes(new Set());
  }

  async function handleSubmit() {
    if (!date) {
      setMsg("Vælg en dato først.");
      return;
    }
    if (selectedTimes.size === 0) {
      setMsg("Vælg mindst én tid.");
      return;
    }

    setLoading(true);
    setMsg(null);

    const times = Array.from(selectedTimes).sort();

    try {
      const res = await fetch("/api/admin/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, times }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const skippedMsg =
        json.data.skipped > 0
          ? ` (${json.data.skipped} fandtes allerede)`
          : "";
      setMsg(`${json.data.created} tider oprettet!${skippedMsg}`);
      setDate("");
      setSelectedTimes(new Set());
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Fejl.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Dato
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">
            Vælg tider ({selectedTimes.size} valgt)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-rose-400 hover:text-rose-600 underline"
            >
              Vælg alle
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Ryd
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => toggleTime(time)}
              className={cn(
                "py-1.5 rounded-lg text-xs font-medium border transition-all",
                selectedTimes.has(time)
                  ? "bg-rose-400 text-white border-rose-400 shadow-sm"
                  : "bg-white text-gray-500 border-rose-200 hover:border-rose-400 hover:text-rose-500"
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {msg && <p className="text-xs text-rose-500 font-medium">{msg}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || selectedTimes.size === 0}
        className="w-full py-2.5 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Opretter..."
          : `Opret ${selectedTimes.size} tid${selectedTimes.size !== 1 ? "er" : ""}`}
      </button>
    </div>
  );
}
