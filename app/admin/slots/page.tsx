import { getAdminDb } from "@/lib/firebase/admin";
import { Slot } from "@/types";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { getWeekKey, BOOKING_RULES } from "@/lib/booking-rules";
import CreateSlotForm from "./CreateSlotForm";
import BulkCreateForm from "./BulkCreateForm";
import SlotActions from "./SlotActions";

async function getSlotsWithContext(): Promise<{
  grouped: { date: string; slots: Slot[] }[];
  fullWeeks: Set<string>;
}> {
  const db = getAdminDb();
  const today = new Date().toISOString().split("T")[0];

  const [slotsSnap, bookingsSnap] = await Promise.all([
    db
      .collection("slots")
      .where("date", ">=", today)
      .orderBy("date")
      .orderBy("time")
      .get(),
    db
      .collection("bookings")
      .where("status", "==", "confirmed")
      .get(),
  ]);

  const slots = slotsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Slot));
  const bookedDates = bookingsSnap.docs.map((d) => d.data().date as string);

  // Find uger der er fulde
  const weekCounts = new Map<string, number>();
  for (const date of bookedDates) {
    const wk = getWeekKey(date);
    weekCounts.set(wk, (weekCounts.get(wk) || 0) + 1);
  }
  const fullWeeks = new Set<string>();
  weekCounts.forEach((count, wk) => {
    if (count >= BOOKING_RULES.MAX_PER_WEEK) fullWeeks.add(wk);
  });

  // Gruppér pr. dato
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    if (!map.has(slot.date)) map.set(slot.date, []);
    map.get(slot.date)!.push(slot);
  }
  const grouped: { date: string; slots: Slot[] }[] = [];
  map.forEach((slotList, date) => {
    grouped.push({ date, slots: slotList });
  });

  return { grouped, fullWeeks };
}

export default async function SlotsPage() {
  const { grouped, fullWeeks } = await getSlotsWithContext();

  // Konvertér Set til array for client-side brug
  const fullWeeksArray = Array.from(fullWeeks);

  return (
    <div>
      <h1 className="text-2xl font-display font-medium text-gray-800 mb-8">
        Tider
      </h1>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {/* Opret én tid */}
        <div className="bg-white rounded-3xl border border-rose-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Opret én tid</h2>
          <CreateSlotForm />
        </div>

        {/* Hurtig-opret flere */}
        <div className="bg-white rounded-3xl border border-rose-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-1">
            Hurtig-opret flere tider
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Vælg dato og klik på de tider du vil oprette.
          </p>
          <BulkCreateForm />
        </div>
      </div>

      {/* Liste over tider */}
      <h2 className="font-semibold text-gray-700 mb-4">Kommende tider</h2>

      {grouped.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-10 text-center text-gray-400 text-sm">
          Ingen tider oprettet endnu.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ date, slots: daySlots }) => {
            const weekKey = getWeekKey(date);
            const weekIsFull = fullWeeksArray.includes(weekKey);

            return (
              <div key={date} className="bg-white rounded-3xl border border-rose-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {format(parseISO(date), "EEEE d. MMMM", { locale: da })}
                  </h3>
                  {weekIsFull && (
                    <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                      Uge fuld
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <SlotActions
                      key={slot.id}
                      slot={slot}
                      weekIsFull={weekIsFull}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
