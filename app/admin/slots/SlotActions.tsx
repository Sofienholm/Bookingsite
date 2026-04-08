"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slot } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<Slot["status"], string> = {
  available: "Ledig",
  booked: "Booket",
  closed: "Lukket",
};

const STATUS_STYLES: Record<Slot["status"], string> = {
  available: "bg-green-50 text-green-600 border-green-200",
  booked: "bg-rose-50 text-rose-600 border-rose-200",
  closed: "bg-gray-100 text-gray-400 border-gray-200",
};

interface Props {
  slot: Slot;
}

export default function SlotActions({ slot }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Slet tid kl. ${slot.time}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots/${slot.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.refresh();
    } catch {
      alert("Kunne ikke slette tid.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleClose() {
    const newStatus = slot.status === "closed" ? "available" : "closed";
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.refresh();
    } catch {
      alert("Fejl.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm",
        STATUS_STYLES[slot.status]
      )}
    >
      <span className="font-medium">{slot.time}</span>
      <span className="text-xs opacity-70">{STATUS_LABELS[slot.status]}</span>

      {slot.status !== "booked" && (
        <>
          <button
            onClick={handleToggleClose}
            disabled={loading}
            className="text-xs underline opacity-60 hover:opacity-100 transition disabled:opacity-30"
          >
            {slot.status === "closed" ? "Åbn" : "Luk"}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs opacity-40 hover:opacity-80 transition disabled:opacity-20"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
