import twilio from "twilio";
import { format, parseISO, subDays } from "date-fns";
import { da } from "date-fns/locale";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_PHONE_NUMBER!;
const OWNER = process.env.OWNER_PHONE_NUMBER!;

async function send(to: string, body: string): Promise<void> {
  await client.messages.create({ from: FROM, to, body });
}

function formatDate(date: string): string {
  return format(parseISO(date), "EEEE 'd.' d. MMMM", { locale: da });
}

// ── Notifikationer ved booking ─────────────────────────────────

export async function notifyOwnerNewBooking(
  customerName: string,
  customerPhone: string,
  treatmentName: string,
  date: string,
  time: string
): Promise<void> {
  const body = `Ny booking!\n${customerName} (${customerPhone})\nBehandling: ${treatmentName}\n${formatDate(date)} kl. ${time}`;
  await send(OWNER, body);
}

export async function notifyCustomerConfirmation(
  customerPhone: string,
  customerName: string,
  treatmentName: string,
  date: string,
  time: string
): Promise<void> {
  const body = `Hej ${customerName}! Din booking er bekræftet.\nBehandling: ${treatmentName}\n${formatDate(date)} kl. ${time}\n\nSes snart!`;
  await send(customerPhone, body);
}

// ── Påmindelser dagen før ──────────────────────────────────────

export async function sendOwnerReminder(
  customerName: string,
  treatmentName: string,
  date: string,
  time: string
): Promise<void> {
  const body = `Påmindelse: I morgen har du ${customerName}\nBehandling: ${treatmentName}\nKl. ${time}`;
  await send(OWNER, body);
}

export async function sendCustomerReminder(
  customerPhone: string,
  customerName: string,
  treatmentName: string,
  date: string,
  time: string
): Promise<void> {
  const body = `Hej ${customerName}! Påmindelse om din booking i morgen:\n${treatmentName} kl. ${time}\n\nSes!`;
  await send(customerPhone, body);
}
