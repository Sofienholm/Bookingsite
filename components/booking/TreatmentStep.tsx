"use client";

import { TREATMENTS } from "@/lib/treatments";
import { Treatment } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Props {
  selected: Treatment | null;
  onSelect: (t: Treatment) => void;
  onNext: () => void;
}

export default function TreatmentStep({ selected, onSelect, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-display font-medium text-gray-800 mb-2">
        Vælg behandling
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        Vælg den behandling du ønsker at booke.
      </p>

      <div className="grid gap-3">
        {TREATMENTS.map((treatment) => (
          <Card
            key={treatment.id}
            selected={selected?.id === treatment.id}
            onClick={() => onSelect(treatment)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {treatment.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {treatment.description}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <span className="font-semibold text-rose-500">
                  {treatment.price} kr.
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  ca. {treatment.durationMinutes} min
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button
          onClick={onNext}
          disabled={!selected}
          size="lg"
          className="w-full"
        >
          Vælg dato og tid →
        </Button>
      </div>
    </div>
  );
}
