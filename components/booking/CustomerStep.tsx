"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { Slot, Treatment } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Props {
  treatment: Treatment;
  slot: Slot;
  onConfirm: (name: string, phone: string) => Promise<void>;
  onBack: () => void;
}

export default function CustomerStep({
  treatment,
  slot,
  onConfirm,
  onBack,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(name.trim(), phone.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Noget gik galt. Prøv igen.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-medium text-gray-800 mb-2">
        Dine oplysninger
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        Vi bruger dit telefonnummer til at sende dig en bekræftelse.
      </p>

      {/* Opsummering */}
      <Card className="mb-6 bg-rose-25 border-rose-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Behandling</span>
          <span className="font-medium text-gray-800">{treatment.name}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-500">Dato</span>
          <span className="font-medium text-gray-800">
            {format(parseISO(slot.date), "EEEE d. MMMM", { locale: da })}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-500">Tid</span>
          <span className="font-medium text-gray-800">kl. {slot.time}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-500">Pris</span>
          <span className="font-semibold text-rose-500">
            {treatment.price} kr.
          </span>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Navn
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dit fulde navn"
            required
            className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Telefonnummer
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="f.eks. 12 34 56 78"
            required
            className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-2xl">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            size="lg"
            disabled={loading}
          >
            Tilbage
          </Button>
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="flex-1"
          >
            Bekræft booking
          </Button>
        </div>
      </form>
    </div>
  );
}
