import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

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

// POST /api/admin/slots/bulk — opret flere tider på én dato
export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ success: false, error: "Ikke autoriseret." }, { status: 401 });
  }

  try {
    const { date, times } = await req.json() as { date: string; times: string[] };

    if (!date || !Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mangler dato eller tider." },
        { status: 400 }
      );
    }

    // Valider tidsformat HH:MM
    const timeRegex = /^\d{2}:\d{2}$/;
    const invalid = times.filter((t) => !timeRegex.test(t));
    if (invalid.length > 0) {
      return NextResponse.json(
        { success: false, error: `Ugyldige tider: ${invalid.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Tjek eksisterende tider på datoen
    const existing = await db
      .collection("slots")
      .where("date", "==", date)
      .get();

    const existingTimes = new Set(existing.docs.map((d) => d.data().time as string));
    const newTimes = times.filter((t) => !existingTimes.has(t));

    if (newTimes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Alle tider eksisterer allerede." },
        { status: 409 }
      );
    }

    // Batch write
    const batch = db.batch();
    for (const time of newTimes) {
      const ref = db.collection("slots").doc();
      batch.set(ref, { date, time, status: "available" });
    }
    await batch.commit();

    return NextResponse.json({
      success: true,
      data: { created: newTimes.length, skipped: times.length - newTimes.length },
    });
  } catch (err) {
    console.error("POST /api/admin/slots/bulk:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}
