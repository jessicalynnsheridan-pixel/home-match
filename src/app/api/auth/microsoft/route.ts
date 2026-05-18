import { NextResponse } from "next/server";

// Redirects the user to Microsoft's OAuth consent screen
// Requests both Mail.Send and Calendars.ReadWrite so one connection covers
// both the Outlook email and Outlook Calendar integration cards.
export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) {
    return new Response("Microsoft OAuth not configured", { status: 500 });
  }

  const scopes = [
    "https://graph.microsoft.com/Mail.Send",
    "https://graph.microsoft.com/Calendars.ReadWrite",
    "offline_access",
    "openid",
    "profile",
    "email",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`,
    response_type: "code",
    scope: scopes,
    response_mode: "query",
  });

  return NextResponse.redirect(
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
  );
}
