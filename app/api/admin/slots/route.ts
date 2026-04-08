import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminAuth } from "@/lib/firebase/admin";

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

// POST /api/admin/slots — opret én tid
export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ success: false, error: "Ikke autoriseret." }, { status: 401 });
  }

  try {
    const { date, time } = await req.json();
    if (!date || !time) {
      return NextResponse.json(
        { success: false, error: "Mangler dato eller tid." },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Tjek om tid allerede eksisterer
    const existing = await db
      .collection("slots")
      .where("date", "==", date)
      .where("time", "==", time)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Denne tid eksisterer allerede." },
        { status: 409 }
      );
    }

    const ref = db.collection("slots").doc();
    await ref.set({ date, time, status: "available" });

    return NextResponse.json({ success: true, data: { id: ref.id, date, time, status: "available" } });
  } catch (err) {
    console.error("POST /api/admin/slots:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}
