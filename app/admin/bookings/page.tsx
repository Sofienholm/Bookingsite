"use client";

import { useEffect, useState, useCallback } from "react";
import {
  startOfISOWeek,
  endOfISOWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  getISOWeek,
  addDays,
  isToday,
} from "date-fns";
import { da } from "date-fns/locale";
import { Booking } from "@/types";
import CancelBookingButton from "./CancelBookingButton";

const WEEKDAYS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

export default function BookingsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfISOWeek(currentDate);
  const weekEnd = endOfISOWeek(currentDate);
  const weekNumber = getISOWeek(currentDate);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const from = format(weekStart, "yyyy-MM-dd");
      const to = format(weekEnd, "yyyy-MM-dd");
      const res = await fetch(`/api/admin/bookings?from=${from}&to=${to}`);
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function goToPrevWeek() {
    setCurrentDate((d) => subWeeks(d, 1));
  }
  function goToNextWeek() {
    setCurrentDate((d) => addWeeks(d, 1));
  }
  function goToThisWeek() {
    setCurrentDate(new Date());
  }

  // Gruppér bookinger pr. dato
  const bookingsByDate = new Map<string, Booking[]>();
  for (const b of bookings) {
    if (!bookingsByDate.has(b.date)) bookingsByDate.set(b.date, []);
    bookingsByDate.get(b.date)!.push(b);
  }

  // Generer ugens 7 dage
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      {/* Header med uge-navigation */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-medium text-gray-800">
          Bookinger
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={goToThisWeek}
            className="text-xs text-rose-400 hover:text-rose-600 font-medium transition"
          >
            Denne uge
          </button>

          <div className="flex items-center gap-1 bg-white rounded-2xl border border-rose-100 px-1 py-1">
            <button
              onClick={goToPrevWeek}
              className="w-8 h-8 rounded-xl hover:bg-rose-50 flex items-center justify-center transition text-gray-500 hover:text-gray-700"
            >
              ←
            </button>
            <span className="px-3 text-sm font-medium text-gray-700 min-w-[140px] text-center">
              Uge {weekNumber} · {format(weekStart, "d. MMM", { locale: da })} – {format(weekEnd, "d. MMM", { locale: da })}
            </span>
            <button
              onClick={goToNextWeek}
              className="w-8 h-8 rounded-xl hover:bg-rose-50 flex items-center justify-center transition text-gray-500 hover:text-gray-700"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* Ugeskema */
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDate.get(dateStr) || [];
            const today = isToday(day);

            return (
              <div key={i} className="min-h-[160px]">
                {/* Dag-header */}
                <div
                  className={`text-center pb-2 mb-2 border-b ${
                    today ? "border-rose-300" : "border-rose-100"
                  }`}
                >
                  <p className="text-xs font-medium text-gray-400 uppercase">
                    {WEEKDAYS[i]}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      today
                        ? "text-rose-500"
                        : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </p>
                </div>

                {/* Bookinger den dag */}
                <div className="space-y-1.5">
                  {dayBookings.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center py-4">—</p>
                  ) : (
                    dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`rounded-xl p-2 text-xs border ${
                          booking.status === "confirmed"
                            ? "bg-rose-50 border-rose-200"
                            : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      >
                        <p className="font-semibold text-rose-500">
                          {booking.time}
                        </p>
                        <p className="font-medium text-gray-800 truncate mt-0.5">
                          {booking.customerName}
                        </p>
                        <p className="text-gray-400 truncate">
                          {booking.treatmentName}
                        </p>
                        {booking.status === "confirmed" && (
                          <div className="mt-1.5">
                            <CancelBookingButton
                              bookingId={booking.id}
                              slotId={booking.slotId}
                              googleEventId={booking.googleEventId}
                              onCancelled={fetchBookings}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
