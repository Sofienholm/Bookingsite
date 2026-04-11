import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";

const ENABLED =
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_PHONE_NUMBER;

async function send(body: string): Promise<void> {
  if (!ENABLED) {
    console.log("[SMS] Twilio ikke konfigureret — springer over:", body);
    return;
  }
  const twilio = (await import("twilio")).default;
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: process.env.OWNER_PHONE_NUMBER!,
    body,
  });
}

function formatDate(date: string): string {
  return format(parseISO(date), "EEEE 'd.' d. MMMM", { locale: da });
}

// ── Notifikation til dig ved ny booking ────────────────────────

export async function notifyOwnerNewBooking(
  customerName: string,
  customerPhone: string,
  treatmentName: string,
  date: string,
  time: string
): Promise<void> {
  const body = `Ny booking!\n${customerName} (${customerPhone})\nBehandling: ${treatmentName}\n${formatDate(date)} kl. ${time}`;
  await send(body);
}

// ── Påmindelse til dig dagen før ───────────────────────────────

export async function sendOwnerReminder(
  customerName: string,
  treatmentName: string,
  date: string,
  time: string
): Promise<void> {
  const body = `Påmindelse: I morgen har du ${customerName}\nBehandling: ${treatmentName}\nKl. ${time}`;
  await send(body);
}
