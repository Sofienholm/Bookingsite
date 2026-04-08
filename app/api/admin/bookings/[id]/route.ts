import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { deleteCalendarEvent } from "@/lib/calendar/google";

async function verifySession(req: NextRequest): Promise<boolean> {
  const session = req.cookies.get("session")?.value;
  if (!session) return false;
  try {
    await getAdminAuth().verifySessionCookie(session, true);
    return true;
  } catch {
    return false;
  }
}

// DELETE /api/admin/bookings/[id] — annuller booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ success: false, error: "Ikke autoriseret." }, { status: 401 });
  }

  try {
    const { slotId, googleEventId } = await req.json();
    const db = getAdminDb();

    await db.runTransaction(async (tx) => {
      const bookingRef = db.collection("bookings").doc(params.id);
      const slotRef = db.collection("slots").doc(slotId);

      tx.update(bookingRef, { status: "cancelled" });
      tx.update(slotRef, { status: "available", bookingId: null });
    });

    // Slet Google Kalender begivenhed
    if (googleEventId) {
      await deleteCalendarEvent(googleEventId).catch(() => {
        // Ignorér fejl fra kalender — bookingen er stadig annulleret
        console.warn("Kunne ikke slette kalenderbegivenhed:", googleEventId);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/bookings/[id]:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}
