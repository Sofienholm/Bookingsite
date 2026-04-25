import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { isDayFull, isWeekFull } from "@/lib/booking-rules";
import { TREATMENTS } from "@/lib/treatments";
import { notifyOwnerNewBooking } from "@/lib/sms/twilio";
import { createCalendarEvent } from "@/lib/calendar/google";
import { formatPhone } from "@/lib/utils";
import { Booking } from "@/types";

// Tillad større request body (base64 billeder)
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// POST /api/bookings — opret en booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotId, treatmentId, customerName, customerPhone, comment, imageUrl } = body;

    if (!slotId || !treatmentId || !customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: "Manglende felter." },
        { status: 400 }
      );
    }

    const treatment = TREATMENTS.find((t) => t.id === treatmentId);
    if (!treatment) {
      return NextResponse.json(
        { success: false, error: "Ukendt behandling." },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Kør alt i en transaktion for at undgå race conditions
    const booking = await db.runTransaction(async (tx) => {
      // 1. Hent slot og tjek at den stadig er ledig
      const slotRef = db.collection("slots").doc(slotId);
      const slotDoc = await tx.get(slotRef);

      if (!slotDoc.exists) throw new Error("Tid findes ikke.");
      const slotData = slotDoc.data()!;

      if (slotData.status !== "available") {
        throw new Error("Denne tid er desværre ikke længere ledig.");
      }

      const { date, time } = slotData as { date: string; time: string };

      // 2. Hent bekræftede bookinger og tjek bookingregler
      const bookingsSnap = await db
        .collection("bookings")
        .where("status", "==", "confirmed")
        .get();

      const bookedDates: string[] = bookingsSnap.docs.map(
        (d) => d.data().date as string
      );

      if (isDayFull(date, bookedDates)) {
        throw new Error("Denne dag er fuldt booket.");
      }
      // forceOpen-slots springer uge-reglen over
      if (!slotData.forceOpen && isWeekFull(date, bookedDates)) {
        throw new Error("Denne uge er fuldt booket.");
      }

      // 3. Opret booking
      const bookingRef = db.collection("bookings").doc();
      const newBooking: Omit<Booking, "id"> = {
        slotId,
        date,
        time,
        treatmentId,
        treatmentName: treatment.name,
        customerName,
        customerPhone: formatPhone(customerPhone),
        status: "confirmed",
        createdAt: new Date().toISOString(),
        ...(comment ? { comment } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      };

      tx.set(bookingRef, newBooking);

      // 4. Markér slot som booket
      tx.update(slotRef, { status: "booked", bookingId: bookingRef.id });

      return { id: bookingRef.id, ...newBooking };
    });

    // 5. Send SMS og opret kalenderbegivenhed (uden for transaktionen)
    const phone = formatPhone(customerPhone);

    const results = await Promise.allSettled([
      notifyOwnerNewBooking(
        customerName,
        phone,
        treatment.name,
        booking.date,
        booking.time
      ),
      createCalendarEvent(
        treatment.name,
        customerName,
        phone,
        booking.date,
        booking.time,
        treatment.durationMinutes
      ).then(async (googleEventId) => {
        console.log("[Kalender] Event oprettet med ID:", googleEventId);
        if (googleEventId) {
          await db
            .collection("bookings")
            .doc(booking.id)
            .update({ googleEventId });
        }
      }),
    ]);

    // Log fejl fra SMS og kalender
    results.forEach((result, i) => {
      const label = i === 0 ? "SMS" : "Kalender";
      if (result.status === "rejected") {
        console.error(`[${label}] Fejl:`, result.reason);
      }
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Booking fejlede. Prøv igen.";
    console.error("POST /api/bookings error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
