import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  if (!cleaned.startsWith("+")) return "+45" + cleaned;
  return cleaned;
}
