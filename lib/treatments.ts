import { Treatment } from "@/types";

// Behandlinger — rediger denne liste for at tilpasse til din salon
export const TREATMENTS: Treatment[] = [
  {
    id: "gel-lak",
    name: "Gel lak",
    description: "Holdbar gel lak på naturlige negle. Varer 3–4 uger.",
    durationMinutes: 60,
    price: 350,
  },
  {
    id: "negle-forlangelse",
    name: "Neglefrlængelse",
    description: "Acryl- eller gelforlængelse for ekstra længde og styrke.",
    durationMinutes: 90,
    price: 550,
  },
  {
    id: "manicure",
    name: "Manicure",
    description: "Klassisk manicure med filning, neglebånd og lak.",
    durationMinutes: 45,
    price: 280,
  },
  {
    id: "fjernelse",
    name: "Fjernelse",
    description: "Blid fjernelse af gel lak eller acryl.",
    durationMinutes: 30,
    price: 150,
  },
  {
    id: "infill",
    name: "Infill",
    description: "Vedligeholdelse og fyldning af forlængede negle.",
    durationMinutes: 75,
    price: 450,
  },
];
