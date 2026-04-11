import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { Booking } from "@/types";

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

// GET /api/admin/bookings?from=2024-08-12&to=2024-08-18
export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ success: false, error: "Ikke autoriseret." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: "Mangler from/to parametre." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const snap = await db
      .collection("bookings")
      .where("date", ">=", from)
      .where("date", "<=", to)
      .orderBy("date")
      .orderBy("time")
      .get();

    const bookings = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Booking[];

    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    console.error("GET /api/admin/bookings:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}
