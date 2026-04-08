"use client";

import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { Booking } from "@/types";

interface Props {
  booking: Booking;
}

export default function ConfirmationStep({ booking }: Props) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-rose-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-display font-medium text-gray-800 mb-2">
        Booking bekræftet!
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Du modtager en SMS-bekræftelse på dit telefonnummer.
      </p>

      <div className="bg-white rounded-3xl border border-rose-100 p-6 text-left space-y-3 max-w-sm mx-auto">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Navn</span>
          <span className="font-medium text-gray-800">{booking.customerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Behandling</span>
          <span className="font-medium text-gray-800">{booking.treatmentName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Dato</span>
          <span className="font-medium text-gray-800">
            {format(parseISO(booking.date), "EEEE d. MMMM", { locale: da })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tid</span>
          <span className="font-medium text-gray-800">kl. {booking.time}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Husk at afmelde senest 24 timer i forvejen.
      </p>
    </div>
  );
}
