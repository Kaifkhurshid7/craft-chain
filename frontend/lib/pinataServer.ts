import { NextResponse } from "next/server";

const PINATA_API = "https://api.pinata.cloud";

/**
 * Forward a request to Pinata using the server-only JWT.
 * The JWT is read from PINATA_JWT (never NEXT_PUBLIC_*) so it is not shipped to the browser.
 */
export async function forwardToPinata(
  path: string,
  init: { method: string; body?: BodyInit; contentType?: string }
): Promise<NextResponse> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: { details: "IPFS upload is not configured. Set the PINATA_JWT environment variable." } },
      { status: 500 }
    );
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${jwt}` };
  if (init.contentType) headers["Content-Type"] = init.contentType;

  try {
    const upstream = await fetch(`${PINATA_API}${path}`, {
      method: init.method,
      headers,
      body: init.body,
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ error: { details: "Could not reach the IPFS service." } }, { status: 502 });
  }
}
