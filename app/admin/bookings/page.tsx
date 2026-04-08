import { getAdminDb } from "@/lib/firebase/admin";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { Booking } from "@/types";
import CancelBookingButton from "./CancelBookingButton";

async function getBookings(): Promise<Booking[]> {
  const db = getAdminDb();
  const today = new Date().toISOString().split("T")[0];

  const snap = await db
    .collection("bookings")
    .where("date", ">=", today)
    .orderBy("date")
    .orderBy("time")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div>
      <h1 className="text-2xl font-display font-medium text-gray-800 mb-8">
        Kommende bookinger
      </h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center text-gray-400">
          <p>Ingen kommende bookinger.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl border border-rose-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {booking.status === "confirmed" ? "Bekræftet" : "Annulleret"}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 mt-2">
                  {booking.customerName}
                </p>
                <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.treatmentName}
                </p>
              </div>

              <div className="sm:text-right flex sm:flex-col flex-row items-center sm:items-end gap-4">
                <div>
                  <p className="font-medium text-gray-700">
                    {format(parseISO(booking.date), "EEE d. MMM", {
                      locale: da,
                    })}
                  </p>
                  <p className="text-rose-500 font-medium text-sm">
                    kl. {booking.time}
                  </p>
                </div>

                {booking.status === "confirmed" && (
                  <CancelBookingButton
                    bookingId={booking.id}
                    slotId={booking.slotId}
                    googleEventId={booking.googleEventId}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
