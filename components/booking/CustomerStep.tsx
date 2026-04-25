"use client";

import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { Slot, Treatment } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Props {
  treatment: Treatment;
  slot: Slot;
  onConfirm: (name: string, phone: string, comment?: string, imageUrl?: string) => Promise<void>;
  onBack: () => void;
}

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (h * maxWidth) / w;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CustomerStep({
  treatment,
  slot,
  onConfirm,
  onBack,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Billedet må max være 10 MB.");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setError(null);
    } catch {
      setError("Kunne ikke læse billedet. Prøv et andet.");
    }
  }

  function removeImage() {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(
        name.trim(),
        phone.trim(),
        comment.trim() || undefined,
        imagePreview || undefined
      );
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
        Udfyld dine oplysninger for at bekræfte din booking.
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Kommentar <span className="text-gray-400 font-normal">(valgfrit)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Evt. ønsker til design, allergier eller andet..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Vedhæft billede <span className="text-gray-400 font-normal">(valgfrit)</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            F.eks. inspiration til dit design.
          </p>

          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Vedhæftet billede"
                className="w-32 h-32 object-cover rounded-2xl border border-rose-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-4 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-25 text-rose-400 text-sm hover:border-rose-400 hover:text-rose-500 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Vælg billede
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
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
