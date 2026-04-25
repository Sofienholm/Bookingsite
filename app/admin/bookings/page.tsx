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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
                      today ? "text-rose-500" : "text-gray-700"
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
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full text-left rounded-xl p-2 text-xs border cursor-pointer hover:shadow-md transition ${
                          booking.status === "confirmed"
                            ? "bg-rose-50 border-rose-200 hover:border-rose-400"
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
                        {(booking.comment || booking.imageUrl) && (
                          <p className="text-rose-400 mt-1 text-[10px] font-medium">
                            📎 Har vedhæftning
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking-detalje modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-display font-medium text-gray-800">
                  {selectedBooking.customerName}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {format(parseISO(selectedBooking.date), "EEEE d. MMMM yyyy", { locale: da })} kl. {selectedBooking.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Detaljer */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Behandling</span>
                <span className="font-medium text-gray-800">{selectedBooking.treatmentName}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Telefon</span>
                <a href={`tel:${selectedBooking.customerPhone}`} className="font-medium text-rose-500 hover:text-rose-600">
                  {selectedBooking.customerPhone}
                </a>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${selectedBooking.status === "confirmed" ? "text-green-600" : "text-gray-400"}`}>
                  {selectedBooking.status === "confirmed" ? "Bekræftet" : "Aflyst"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Oprettet</span>
                <span className="text-gray-600">
                  {format(parseISO(selectedBooking.createdAt), "d. MMM yyyy HH:mm", { locale: da })}
                </span>
              </div>
            </div>

            {/* Kommentar */}
            {selectedBooking.comment && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Kommentar fra kunden</h3>
                <div className="bg-rose-25 rounded-2xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedBooking.comment}
                </div>
              </div>
            )}

            {/* Billede */}
            {selectedBooking.imageUrl && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Vedhæftet billede</h3>
                <a href={selectedBooking.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={selectedBooking.imageUrl}
                    alt="Kundebillede"
                    className="w-full rounded-2xl border border-rose-100 hover:opacity-90 transition cursor-zoom-in"
                  />
                </a>
              </div>
            )}

            {/* Handlinger */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Luk
              </button>
              {selectedBooking.status === "confirmed" && (
                <CancelBookingButton
                  bookingId={selectedBooking.id}
                  slotId={selectedBooking.slotId}
                  googleEventId={selectedBooking.googleEventId}
                  onCancelled={() => {
                    setSelectedBooking(null);
                    fetchBookings();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
