import { forwardToPinata } from "@/lib/pinataServer";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: { details: "A file is required." } }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: { details: "File must be smaller than 10MB." } }, { status: 413 });
  }

  return forwardToPinata("/pinning/pinFileToIPFS", { method: "POST", body: formData });
}
