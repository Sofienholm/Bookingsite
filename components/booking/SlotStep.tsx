"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { Slot, Treatment } from "@/types";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface GroupedSlots {
  date: string;
  slots: Slot[];
}

interface Props {
  treatment: Treatment;
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SlotStep({
  treatment,
  selectedSlot,
  onSelect,
  onNext,
  onBack,
}: Props) {
  const [grouped, setGrouped] = useState<GroupedSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/slots");
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setGrouped(json.data);
      } catch {
        setError("Kunne ikke hente tider. Prøv igen.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Henter ledige tider...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          Tilbage
        </Button>
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 text-sm">
          Der er ingen ledige tider i øjeblikket. Kom tilbage snart.
        </p>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          Tilbage
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-medium text-gray-800 mb-2">
        Vælg dato og tid
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        Behandling: <span className="font-medium text-gray-700">{treatment.name}</span>
      </p>

      <div className="space-y-6">
        {grouped.map(({ date, slots }) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {format(parseISO(date), "EEEE d. MMMM", { locale: da })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => onSelect(slot)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-sm font-medium border transition-all duration-150",
                    selectedSlot?.id === slot.id
                      ? "bg-rose-400 text-white border-rose-400 shadow-sm"
                      : "bg-white text-gray-700 border-rose-200 hover:border-rose-400 hover:text-rose-500"
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack} size="lg">
          Tilbage
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedSlot}
          size="lg"
          className="flex-1"
        >
          Udfyld dine oplysninger →
        </Button>
      </div>
    </div>
  );
}
