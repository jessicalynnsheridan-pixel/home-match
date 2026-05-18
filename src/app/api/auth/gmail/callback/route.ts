import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/integrations?gmail=error`);
  }

  // Exchange authorization code for access + refresh tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}/api/auth/gmail/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    console.error("Gmail token exchange failed:", tokens);
    return NextResponse.redirect(`${appUrl}/integrations?gmail=error`);
  }

  // Get the user's Gmail address from Google
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const googleUser = await userRes.json();

  // Save connection status to Supabase user metadata
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      gmail_connected: true,
      gmail_email: googleUser.email ?? "",
      gmail_access_token: tokens.access_token,
      gmail_refresh_token: tokens.refresh_token ?? null,
    },
  });

  if (updateError) {
    console.error("Supabase updateUser failed:", updateError.message);
    return NextResponse.redirect(`${appUrl}/integrations?gmail=error`);
  }

  return NextResponse.redirect(`${appUrl}/integrations?gmail=connected`);
}
