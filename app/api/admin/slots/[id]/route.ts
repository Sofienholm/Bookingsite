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

// PATCH /api/admin/slots/[id] — opdatér status (luk/åbn)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ success: false, error: "Ikke autoriseret." }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    if (!["available", "closed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Ugyldig status." }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection("slots").doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Tid ikke fundet." }, { status: 404 });
    }

    if (doc.data()!.status === "booked") {
      return NextResponse.json(
        { success: false, error: "Kan ikke ændre en booket tid." },
        { status: 400 }
      );
    }

    await ref.update({ status });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/slots/[id]:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}

// DELETE /api/admin/slots/[id] — slet tid
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ success: false, error: "Ikke autoriseret." }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("slots").doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Tid ikke fundet." }, { status: 404 });
    }

    if (doc.data()!.status === "booked") {
      return NextResponse.json(
        { success: false, error: "Kan ikke slette en booket tid. Annuller bookingen først." },
        { status: 400 }
      );
    }

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/slots/[id]:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}
