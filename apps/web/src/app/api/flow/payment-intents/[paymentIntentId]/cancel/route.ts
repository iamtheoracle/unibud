import { NextRequest, NextResponse } from "next/server";
import { FlowPaymentIntentRepository } from "@/lib/server/flow/flow-payment-intent-repository";
import { getFlowAuthDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readSessionCookie, routeError } from "@/lib/server/identity/http";

type Context = { params: Promise<{ paymentIntentId: string }> };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }
  const token = readSessionCookie(request);
  if (!token) return NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 });
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 });
    const { paymentIntentId } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(paymentIntentId)) {
      return NextResponse.json({ ok: false, error: "Invalid payment reference." }, { status: 400 });
    }
    const repository = new FlowPaymentIntentRepository(getFlowAuthDatabasePool());
    const cancelled = await repository.cancelPaymentIntent(
      validation.account.id,validation.session.id,paymentIntentId
    );
    if (!cancelled) {
      return NextResponse.json({ ok: false, error: "This payment instruction can no longer be cancelled." }, { status: 409 });
    }
    return NextResponse.json({
      ok: true,
      state: "cancelled",
      paymentIntentId
    }, { headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:FLOW_|DB_)/.test(error.message)) {
      return NextResponse.json({ ok: false, error: "Flow cancellation is not configured." }, { status: 503 });
    }
    return routeError(error);
  }
}
