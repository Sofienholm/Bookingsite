"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  slotId: string;
  googleEventId?: string;
}

export default function CancelBookingButton({
  bookingId,
  slotId,
  googleEventId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Er du sikker på at du vil annullere denne booking?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, googleEventId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.refresh();
    } catch (err) {
      alert("Kunne ikke annullere booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
    >
      {loading ? "..." : "Annuller"}
    </button>
  );
}
