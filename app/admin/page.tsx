import { getAdminDb } from "@/lib/firebase/admin";
import { getISOWeek, parseISO, isAfter, startOfToday } from "date-fns";
import { BOOKING_RULES, getWeekKey } from "@/lib/booking-rules";
import Link from "next/link";

async function getDashboardData() {
  const db = getAdminDb();
  const today = new Date().toISOString().split("T")[0];

  const [bookingsSnap, slotsSnap] = await Promise.all([
    db
      .collection("bookings")
      .where("status", "==", "confirmed")
      .orderBy("date")
      .get(),
    db
      .collection("slots")
      .where("status", "==", "available")
      .where("date", ">=", today)
      .get(),
  ]);

  const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const upcoming = bookings.filter(
    (b: any) => b.date >= today
  );

  // Uge-status
  const currentWeek = getWeekKey(today);
  const thisWeekBookings = upcoming.filter(
    (b: any) => getWeekKey(b.date) === currentWeek
  );

  return {
    upcomingCount: upcoming.length,
    availableSlotsCount: slotsSnap.size,
    thisWeekCount: thisWeekBookings.length,
    nextBooking: upcoming[0] ?? null,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-display font-medium text-gray-800 mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Kommende bookinger"
          value={data.upcomingCount}
          sub="bekræftede"
        />
        <StatCard
          label="Ledige tider"
          value={data.availableSlotsCount}
          sub="fremad"
        />
        <StatCard
          label="Bookinger denne uge"
          value={`${data.thisWeekCount} / ${BOOKING_RULES.MAX_PER_WEEK}`}
          sub={data.thisWeekCount >= BOOKING_RULES.MAX_PER_WEEK ? "Ugen er fuld" : "ledig kapacitet"}
          highlight={data.thisWeekCount >= BOOKING_RULES.MAX_PER_WEEK}
        />
      </div>

      {/* Næste booking */}
      {data.nextBooking && (
        <div className="bg-white rounded-3xl border border-rose-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Næste booking
          </h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">
                {(data.nextBooking as any).customerName}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {(data.nextBooking as any).treatmentName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-700">
                {(data.nextBooking as any).date}
              </p>
              <p className="text-sm text-rose-500 font-medium">
                kl. {(data.nextBooking as any).time}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/admin/slots"
          className="bg-rose-400 hover:bg-rose-500 text-white rounded-2xl px-6 py-4 font-medium text-center transition"
        >
          + Opret nye tider
        </Link>
        <Link
          href="/admin/bookings"
          className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl px-6 py-4 font-medium text-center transition"
        >
          Se alle bookinger
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl border border-rose-100 p-5">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
      <p
        className={`text-xs mt-0.5 ${
          highlight ? "text-rose-500 font-medium" : "text-gray-400"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}
