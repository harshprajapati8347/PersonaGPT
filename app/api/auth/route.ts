import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { password } = body as { password?: unknown };

    if (typeof password !== "string") {
      return NextResponse.json(
        { ok: false, message: "Password is required." },
        { status: 400 },
      );
    }

    const expected = process.env.ACCESS_PASSWORD;

    if (!expected) {
      console.error("[/api/auth] ACCESS_PASSWORD is not set.");
      return NextResponse.json(
        { ok: false, message: "Access is not configured." },
        { status: 500 },
      );
    }

    if (password !== expected) {
      return NextResponse.json(
        { ok: false, message: "Incorrect password." },
        { status: 401 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/auth]", error);

    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
