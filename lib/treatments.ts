import { Treatment } from "@/types";

// Behandlinger — rediger denne liste for at tilpasse til din salon
export const TREATMENTS: Treatment[] = [
  {
    id: "nyt-sat-gel-polish",
    name: "Nyt sæt – Gel polish",
    description: "Nyt sæt gel polish på naturlige negle.",
    durationMinutes: 120,
    price: 250,
  },
  {
    id: "nyt-sat-gele-negle",
    name: "Nyt sæt – Gele negle",
    description: "Nyt sæt gele negle. Forlængelse +30 kr.",
    durationMinutes: 180,
    price: 350,
  },
  {
    id: "opfyldning-gel-polish",
    name: "Opfyldning – Gel polish",
    description: "Opfyldning af eksisterende gel polish.",
    durationMinutes: 120,
    price: 250,
  },
  {
    id: "opfyldning-gele-negle",
    name: "Opfyldning – Gele negle",
    description: "Opfyldning af eksisterende gele negle. Med farve eller design +50 kr.",
    durationMinutes: 180,
    price: 300,
  },
  {
    id: "aftagning",
    name: "Aftagning",
    description: "Blid aftagning af gel polish eller gele negle.",
    durationMinutes: 45,
    price: 50,
  },
];
