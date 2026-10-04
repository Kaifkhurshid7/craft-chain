import { forwardToPinata } from "@/lib/pinataServer";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { hashToPin?: unknown } | null;

  if (!body || typeof body.hashToPin !== "string" || body.hashToPin.trim() === "") {
    return Response.json({ error: { details: "hashToPin is required." } }, { status: 400 });
  }

  return forwardToPinata("/pinning/pinByHash", {
    method: "POST",
    body: JSON.stringify({ hashToPin: body.hashToPin }),
    contentType: "application/json",
  });
}
