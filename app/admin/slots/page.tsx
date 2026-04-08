import { getAdminDb } from "@/lib/firebase/admin";
import { Slot } from "@/types";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import CreateSlotForm from "./CreateSlotForm";
import BulkCreateForm from "./BulkCreateForm";
import SlotActions from "./SlotActions";

async function getSlots(): Promise<Slot[]> {
  const db = getAdminDb();
  const today = new Date().toISOString().split("T")[0];

  const snap = await db
    .collection("slots")
    .where("date", ">=", today)
    .orderBy("date")
    .orderBy("time")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Slot));
}

export default async function SlotsPage() {
  const slots = await getSlots();

  // Gruppér pr. dato
  const grouped: { date: string; slots: Slot[] }[] = [];
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    if (!map.has(slot.date)) map.set(slot.date, []);
    map.get(slot.date)!.push(slot);
  }
  for (const [date, slotList] of map) {
    grouped.push({ date, slots: slotList });
  }

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
            Skriv tider adskilt af komma: 13:00, 15:00, 18:00
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
          {grouped.map(({ date, slots: daySlots }) => (
            <div key={date} className="bg-white rounded-3xl border border-rose-100 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {format(parseISO(date), "EEEE d. MMMM", { locale: da })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <SlotActions key={slot.id} slot={slot} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
