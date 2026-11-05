import { normalizePhone } from "./phone";

export type SmsResult = { ok: boolean; provider: string; error?: string };

interface SmsProvider {
  name: string;
  send(phone: string, message: string): Promise<SmsResult>;
}

const stub: SmsProvider = {
  name: "stub",
  async send(phone, message) {
    console.log(`[sms:stub] ${phone}: ${message}`);
    return { ok: true, provider: "stub" };
  },
};

const netgsm: SmsProvider = {
  name: "netgsm",
  async send(phone, message) {
    const usercode = process.env.NETGSM_USERNAME;
    const password = process.env.NETGSM_PASSWORD;
    const msgheader = process.env.NETGSM_HEADER;
    if (!usercode || !password || !msgheader) {
      return { ok: false, provider: "netgsm", error: "NETGSM_* ayarları eksik" };
    }
    const res = await fetch("https://api.netgsm.com.tr/sms/send/get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usercode, password, gsmno: phone, message, msgheader, dil: "TR" }),
      signal: AbortSignal.timeout(10_000),
    });
    const text = (await res.text()).trim();
    // Başarılı yanıt "00 <jobid>" ile başlar
    return text.startsWith("00") ? { ok: true, provider: "netgsm" } : { ok: false, provider: "netgsm", error: text };
  },
};

function getProvider(): SmsProvider {
  return process.env.SMS_PROVIDER === "netgsm" ? netgsm : stub;
}

/** Asla throw etmez. */
export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const provider = getProvider();
  try {
    const normalized = normalizePhone(phone);
    if (!normalized) return { ok: false, provider: provider.name, error: "Geçersiz telefon" };
    return await provider.send(normalized, message);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[sms] gönderim hatası:", error);
    return { ok: false, provider: provider.name, error };
  }
}
