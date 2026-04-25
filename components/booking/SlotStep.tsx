"use client";

import { useEffect, useState, useMemo } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
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

const WEEKDAY_LABELS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  // Set af datoer der har ledige slots
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    grouped.forEach(({ date }) => dates.add(date));
    return dates;
  }, [grouped]);

  // Slots for den valgte dato
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const group = grouped.find((g) => g.date === selectedDate);
    return group?.slots || [];
  }, [grouped, selectedDate]);

  // Generer kalender-dage for visningen
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    // Ugen starter mandag (weekStartsOn: 1)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (isBefore(day, addDays(calEnd, 1))) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const today = startOfDay(new Date());

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

      {/* Måned-navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="w-8 h-8 rounded-xl hover:bg-rose-50 flex items-center justify-center transition text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-gray-700 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: da })}
        </h3>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="w-8 h-8 rounded-xl hover:bg-rose-50 flex items-center justify-center transition text-gray-500 hover:text-gray-700"
        >
          →
        </button>
      </div>

      {/* Ugedage header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Kalender-grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isAvailable = availableDates.has(dateStr);
          const isPast = isBefore(day, today);
          const isSelected = selectedDate === dateStr;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={i}
              disabled={!isAvailable || !isCurrentMonth || isPast}
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                "aspect-square rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center relative",
                !isCurrentMonth && "text-gray-200",
                isCurrentMonth && !isAvailable && "text-gray-300 cursor-default",
                isCurrentMonth && isPast && "text-gray-200 cursor-default",
                isCurrentMonth && isAvailable && !isSelected && "text-gray-700 bg-rose-50 hover:bg-rose-100 cursor-pointer border border-rose-200",
                isSelected && "bg-rose-400 text-white shadow-sm border border-rose-400",
                isToday && !isSelected && isAvailable && "ring-2 ring-rose-300",
                isToday && !isSelected && !isAvailable && "ring-1 ring-gray-300",
              )}
            >
              {format(day, "d")}
              {isAvailable && isCurrentMonth && !isPast && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tider for valgt dato */}
      {selectedDate && slotsForSelectedDate.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 capitalize">
            {format(parseISO(selectedDate), "EEEE d. MMMM", { locale: da })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {slotsForSelectedDate.map((slot) => (
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
      )}

      {selectedDate && slotsForSelectedDate.length === 0 && (
        <p className="text-sm text-gray-400 mb-6 text-center">
          Ingen ledige tider denne dag.
        </p>
      )}

      <div className="flex gap-3">
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
