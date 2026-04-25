// ── Behandlinger ──────────────────────────────────────────────
export interface Treatment {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

// ── Tider ─────────────────────────────────────────────────────
export type SlotStatus = "available" | "booked" | "closed";

export interface Slot {
  id: string;
  date: string;        // ISO dato: "2024-08-15"
  time: string;        // "13:00"
  status: SlotStatus;
  bookingId?: string;
  forceOpen?: boolean; // Admin kan tvinge en tid åben selv om ugen er fuld
}

// ── Bookinger ─────────────────────────────────────────────────
export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  slotId: string;
  date: string;         // "2024-08-15"
  time: string;         // "13:00"
  treatmentId: string;
  treatmentName: string;
  customerName: string;
  customerPhone: string;
  status: BookingStatus;
  createdAt: string;    // ISO timestamp
  googleEventId?: string;
  comment?: string;     // Kundens kommentar
  imageUrl?: string;    // URL til vedhæftet billede (Firebase Storage)
}

// ── API responses ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Ugeinfo (bruges i admin) ───────────────────────────────────
export interface WeekStatus {
  weekNumber: number;
  year: number;
  bookingCount: number;
  maxBookings: number;
  isFull: boolean;
}
