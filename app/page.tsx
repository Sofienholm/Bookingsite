"use client";

import { useState } from "react";
import { Treatment, Slot, Booking } from "@/types";
import TreatmentStep from "@/components/booking/TreatmentStep";
import SlotStep from "@/components/booking/SlotStep";
import CustomerStep from "@/components/booking/CustomerStep";
import ConfirmationStep from "@/components/booking/ConfirmationStep";

type Step = "treatment" | "slot" | "customer" | "confirmation";

export default function BookingPage() {
  const [step, setStep] = useState<Step>("treatment");
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const steps: Step[] = ["treatment", "slot", "customer", "confirmation"];
  const stepIndex = steps.indexOf(step);

  async function handleConfirm(name: string, phone: string) {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: slot!.id,
        treatmentId: treatment!.id,
        customerName: name,
        customerPhone: phone,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Booking fejlede.");
    setBooking(json.data);
    setStep("confirmation");
  }

  return (
    <div className="min-h-screen bg-[#faf6f3]">
      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="text-3xl font-display font-medium text-gray-800 tracking-tight">
          Negleklinik
        </h1>
        <p className="text-gray-400 text-sm mt-1">Book din tid online</p>
      </header>

      {/* Stepper */}
      {step !== "confirmation" && (
        <div className="flex justify-center gap-2 mb-8">
          {["Behandling", "Tid", "Oplysninger"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < stepIndex
                    ? "bg-rose-400 text-white"
                    : i === stepIndex
                    ? "bg-rose-400 text-white ring-4 ring-rose-100"
                    : "bg-rose-100 text-rose-300"
                }`}
              >
                {i < stepIndex ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  i <= stepIndex ? "text-gray-600 font-medium" : "text-gray-300"
                }`}
              >
                {label}
              </span>
              {i < 2 && (
                <div
                  className={`w-8 h-px mx-1 ${
                    i < stepIndex ? "bg-rose-300" : "bg-rose-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Indhold */}
      <main className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 sm:p-8">
          {step === "treatment" && (
            <TreatmentStep
              selected={treatment}
              onSelect={setTreatment}
              onNext={() => setStep("slot")}
            />
          )}
          {step === "slot" && treatment && (
            <SlotStep
              treatment={treatment}
              selectedSlot={slot}
              onSelect={setSlot}
              onNext={() => setStep("customer")}
              onBack={() => setStep("treatment")}
            />
          )}
          {step === "customer" && treatment && slot && (
            <CustomerStep
              treatment={treatment}
              slot={slot}
              onConfirm={handleConfirm}
              onBack={() => setStep("slot")}
            />
          )}
          {step === "confirmation" && booking && (
            <ConfirmationStep booking={booking} />
          )}
        </div>
      </main>
    </div>
  );
}
