import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Returns which server-side integrations are configured.
// Safe to call from the client — no secrets are returned.
export async function GET() {
  return NextResponse.json({
    claudeEnabled: !!process.env.ANTHROPIC_API_KEY,
  });
}
