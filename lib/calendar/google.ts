import { google } from "googleapis";
import { parseISO, format } from "date-fns";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;

export async function createCalendarEvent(
  treatmentName: string,
  customerName: string,
  customerPhone: string,
  date: string,
  time: string,
  durationMinutes: number
): Promise<string> {
  const [hours, minutes] = time.split(":").map(Number);
  const startDate = parseISO(date);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `${treatmentName} — ${customerName}`,
      description: `Kunde: ${customerName}\nTelefon: ${customerPhone}\nBehandling: ${treatmentName}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Europe/Copenhagen",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Europe/Copenhagen",
      },
    },
  });

  return event.data.id!;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
  });
}
