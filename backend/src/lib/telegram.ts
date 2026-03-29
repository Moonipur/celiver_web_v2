import { format, toZonedTime } from "date-fns-tz";

type caseType = {
  bCode: string;
  visit: number;
};

export const sendTelegram = async (
  lotId: string,
  orgSlug: string,
  date: Date,
  cases: caseType[],
) => {
  const BOT_TOKEN = process.env.BOT_TOKEN!;
  const CHAT_ID = process.env.CHAT_ID!;

  const timeZone = "Asia/Bangkok";
  const zonedDate = toZonedTime(date, timeZone);

  const formattedDate = format(zonedDate, "dd/MM/yy-HH:mm", { timeZone });

  // Construct the HTML message
  const caseList = cases
    .map((c) => `  ▫️ <code>${c.bCode} - V${c.visit}</code>`)
    .join("\n");

  // 2. Combine into the final HTML message
  const message = [
    `<b>📦 New Order</b>`,
    `<b>Date:</b> <code>${formattedDate}</code>`,
    `<b>Lot ID:</b> <code>${lotId.toUpperCase()}</code>`,
    `<b>Org Code:</b> <code>${orgSlug}</code>`,
    `<b>Cases (${cases.length}):</b>`,
    caseList,
  ].join("\n");

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Telegram Notification Failed:", error);
    return { ok: false, error };
  }
};

export const sendNotify = async (
  name: string,
  email: string,
): Promise<void> => {
  const BOT_TOKEN = process.env.BOT_TOKEN!;
  const CHAT_ID = process.env.CHAT_ADMIN!;

  const date = new Date();
  const timeZone = "Asia/Bangkok";
  const zonedDate = toZonedTime(date, timeZone);

  const formattedDate = format(zonedDate, "dd/MM/yy-HH:mm", { timeZone });

  // 2. Combine into the final HTML message
  const message = [
    `<b>📦 New Registration</b>`,
    `<b>Date:</b> <code>${formattedDate}</code>`,
    `<b>Name:</b> <code>${name}</code>`,
    `<b>Email:</b> <code>${email}</code>`,
  ].join("\n");

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Telegram Notification Failed:", error);
  }
};
