import { NextResponse } from "next/server";

/**
 * Receives events FROM Vapi (tool calls, end-of-call report, etc.).
 * Set in Vapi Dashboard → Assistant → Server URL (HTTPS, publicly reachable):
 *   Production: https://<your-vercel-domain>/api/vapi/webhook
 *   Local dev:  https://<ngrok-subdomain>.ngrok-free.app/api/vapi/webhook
 * (nginx on localhost is optional dev-only; Vapi never calls nginx directly.)
 */

export const maxDuration = 10;

/** Browser checks use GET — Vapi still must POST JSON payloads here. */
export function GET() {
  return NextResponse.json(
    {
      ok: true,
      path: "/api/vapi/webhook",
      detail:
        "Vapi sends POST requests here. A GET in the browser only checks that the route exists.",
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      message?: {
        type?: string;
        toolCallList?: Array<{
          toolCallId?: string;
          id?: string;
          function?: { name?: string; arguments?: Record<string, unknown> };
          name?: string;
          arguments?: Record<string, unknown>;
        }>;
      };
    };

    const message = payload?.message;
    const type = message?.type;

    console.log("📞 Vapi Event:", type);

    if (type === "tool-calls") {
      const toolCallList = message?.toolCallList || [];

      const results = toolCallList.map((tc) => {
        const toolCallId = tc.toolCallId || tc.id;
        const fnName = tc.function?.name || tc.name;
        const args =
          tc.function?.arguments ?? tc.arguments ?? ({} as Record<string, unknown>);

        if (fnName === "book_demo") {
          void args;
          return {
            toolCallId,
            result: {
              ok: true,
              booked: true,
              message: "Demo booking link sent via SMS!",
            },
          };
        }

        return {
          toolCallId,
          result: { ok: false, error: `Unknown tool: ${fnName}` },
        };
      });

      return NextResponse.json({ results });
    }

    if (type === "end-of-call-report") {
      const raw = payload as {
        message?: {
          call?: { id?: string; endedReason?: string };
          artifact?: {
            transcript?: string;
            summary?: string;
            recordingUrl?: string;
          };
        };
      };

      const call = raw.message?.call;
      const transcript = raw.message?.artifact?.transcript;
      const summary = raw.message?.artifact?.summary;
      const recordingUrl = raw.message?.artifact?.recordingUrl;

      console.log("📊 Call ended:", {
        callId: call?.id,
        endReason: call?.endedReason,
        summary,
      });

      const ghlUrl = process.env.GHL_WEBHOOK_URL?.trim();
      if (ghlUrl) {
        await fetch(ghlUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "call-completed",
            callId: call?.id,
            endReason: call?.endedReason,
            summary: summary || "",
            transcript: transcript || "",
            recordingUrl: recordingUrl || "",
            completedAt: new Date().toISOString(),
          }),
        });
        console.log("✅ Call report sent to GHL");
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
