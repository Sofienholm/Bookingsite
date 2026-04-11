import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { isDayFull, isWeekFull } from "@/lib/booking-rules";
import { Slot } from "@/types";

interface GroupedSlots {
  date: string;
  slots: Slot[];
}

// GET /api/slots — returnerer ledige tider, grupperet pr. dag
export async function GET() {
  try {
    const db = getAdminDb();

    // Hent alle bekræftede bookinger (datoer)
    const bookingsSnap = await db
      .collection("bookings")
      .where("status", "==", "confirmed")
      .get();

    const bookedDates: string[] = bookingsSnap.docs.map(
      (d) => d.data().date as string
    );

    // Hent alle ledige slots
    const today = new Date().toISOString().split("T")[0];
    const slotsSnap = await db
      .collection("slots")
      .where("status", "==", "available")
      .where("date", ">=", today)
      .orderBy("date")
      .orderBy("time")
      .get();

    const slots = slotsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Slot, "id">),
    }));

    // Filtrer slots baseret på bookingregler
    // forceOpen-slots springer uge-reglen over (men dag-reglen gælder stadig)
    const filteredSlots = slots.filter((slot) => {
      if (isDayFull(slot.date, bookedDates)) return false;
      if (slot.forceOpen) return true;
      if (isWeekFull(slot.date, bookedDates)) return false;
      return true;
    });

    // Gruppér pr. dato
    const grouped: GroupedSlots[] = [];
    const dateMap = new Map<string, Slot[]>();

    for (const slot of filteredSlots) {
      if (!dateMap.has(slot.date)) dateMap.set(slot.date, []);
      dateMap.get(slot.date)!.push(slot);
    }

    dateMap.forEach((slotList, date) => {
      grouped.push({ date, slots: slotList });
    });

    return NextResponse.json({ success: true, data: grouped });
  } catch (err) {
    console.error("GET /api/slots error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
