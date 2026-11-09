import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { AuthRateLimitExceededError } from "../auth/auth-rpc-repository-core";

export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return null;
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 16_384) return null;
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > 16_384) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Host-unibud_session"
    : "unibud_session";
}

export function readSessionCookie(request: NextRequest): string | undefined {
  return request.cookies.get(sessionCookieName())?.value;
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  absoluteExpiresAt: string
): void {
  const expires = new Date(absoluteExpiresAt);
  const maxAge = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000));
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
    maxAge
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0
  });
}

export function routeError(error: unknown): NextResponse {
  if (error instanceof AuthRateLimitExceededError) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait and try again." }, { status: 429 });
  }
  if (error instanceof Error && /not configured|connection|timeout/i.test(error.message)) {
    return NextResponse.json({ ok: false, error: "The service is temporarily unavailable." }, { status: 503 });
  }
  return NextResponse.json({ ok: false, error: "The request could not be completed." }, { status: 500 });
}
