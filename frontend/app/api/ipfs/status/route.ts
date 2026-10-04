import { forwardToPinata } from "@/lib/pinataServer";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return forwardToPinata("/data/testAuthentication", { method: "GET" });
}
