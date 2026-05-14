import { NextResponse } from "next/server";

const VAPI_CALL_URL = "https://api.vapi.ai/call";

export type LeadPayload = {
  businessName: string;
  businessType: string;
  yearsInBusiness: string;
  numLocations: string;
  currentProcessor: string;
  monthlyVolume: string;
  currentPOS: string;
  solutionNeeded: string[];
  contactName: string;
  phone: string;
  email: string;
  bestTime: string;
};

function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (trimmed.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    contactName,
    phone,
    email,
    businessName,
    businessType,
    monthlyVolume,
    solutionNeeded,
    bestTime,
  } = body;

  if (!contactName?.trim() || !phone?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "contactName, phone, and email are required" },
      { status: 400 },
    );
  }

  const e164 = toE164(phone);
  if (!e164) {
    return NextResponse.json(
      { error: "Please enter a valid phone number (US supported)." },
      { status: 400 },
    );
  }

  const apiKey = process.env.VAPI_PRIVATE_API_KEY?.trim();
  const assistantId = process.env.VAPI_ASSISTANT_ID?.trim();
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID?.trim();

  if (!apiKey || apiKey === "paste-your-key-here") {
    return NextResponse.json(
      { error: "Server missing VAPI_PRIVATE_API_KEY in .env.local" },
      { status: 500 },
    );
  }
  if (!assistantId || !phoneNumberId) {
    return NextResponse.json(
      { error: "Server missing VAPI_ASSISTANT_ID or VAPI_PHONE_NUMBER_ID" },
      { status: 500 },
    );
  }

  const firstName = contactName.trim().split(/\s+/)[0] || "there";

  const leadEvent = {
    event: "form-submitted",
    source: "mna-landing",
    submittedAt: new Date().toISOString(),
    contactName: contactName.trim(),
    firstName,
    phone: e164,
    email: email.trim(),
    businessName: businessName?.trim() ?? "",
    businessType: businessType?.trim() ?? "",
    monthlyVolume: monthlyVolume?.trim() ?? "",
    solutionNeeded: Array.isArray(solutionNeeded) ? solutionNeeded : [],
    bestTime: bestTime?.trim() ?? "",
    yearsInBusiness: body.yearsInBusiness?.trim() ?? "",
    numLocations: body.numLocations?.trim() ?? "",
    currentProcessor: body.currentProcessor?.trim() ?? "",
    currentPOS: body.currentPOS?.trim() ?? "",
  };

  const ghlUrl = process.env.GHL_WEBHOOK_URL?.trim();
  if (ghlUrl) {
    try {
      await fetch(ghlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadEvent),
      });
    } catch (e) {
      console.error("GHL webhook (lead) failed:", e);
    }
  }

  const vapiRes = await fetch(VAPI_CALL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId,
      phoneNumberId,
      customer: {
        number: e164,
        name: contactName.trim(),
      },
      assistantOverrides: {
        variableValues: {
          name: firstName,
          businessName: businessName?.trim() || "",
          contactName: contactName.trim(),
        },
      },
    }),
  });

  if (!vapiRes.ok) {
    const errText = await vapiRes.text();
    console.error("Vapi create call failed:", vapiRes.status, errText);
    return NextResponse.json(
      {
        error: "Could not start the call. Your details were saved — we'll reach out shortly.",
        detail: errText,
      },
      { status: 502 },
    );
  }

  const callData = (await vapiRes.json()) as { id?: string };
  return NextResponse.json({
    ok: true,
    callId: callData.id ?? null,
  });
}
