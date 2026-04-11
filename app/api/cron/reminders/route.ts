import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { addDays, format } from "date-fns";
import { sendOwnerReminder } from "@/lib/sms/twilio";

// GET /api/cron/reminders — køres dagligt (f.eks. via Vercel Cron)
// Beskyttet af CRON_SECRET header
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Uautoriseret." }, { status: 401 });
  }

  try {
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const db = getAdminDb();

    const snap = await db
      .collection("bookings")
      .where("date", "==", tomorrow)
      .where("status", "==", "confirmed")
      .get();

    const results = await Promise.allSettled(
      snap.docs.map(async (doc) => {
        const b = doc.data();
        await sendOwnerReminder(b.customerName, b.treatmentName, b.date, b.time);
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ success: true, sent, failed });
  } catch (err) {
    console.error("Cron reminder error:", err);
    return NextResponse.json({ success: false, error: "Fejl." }, { status: 500 });
  }
}
