import { parseISO } from "date-fns";

const ENABLED =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  !!process.env.GOOGLE_REFRESH_TOKEN &&
  !!process.env.GOOGLE_CALENDAR_ID;

function getCalendarClient() {
  const { google } = require("googleapis");
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createCalendarEvent(
  treatmentName: string,
  customerName: string,
  customerPhone: string,
  date: string,
  time: string,
  durationMinutes: number
): Promise<string> {
  if (!ENABLED) {
    console.log("[Kalender] Google Calendar ikke konfigureret — springer over.");
    return "";
  }

  const calendar = getCalendarClient();

  const [hours, minutes] = time.split(":").map(Number);
  const startDate = parseISO(date);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `${customerName} — ${treatmentName}`,
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
  if (!ENABLED || !eventId) return;

  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
  });
}
