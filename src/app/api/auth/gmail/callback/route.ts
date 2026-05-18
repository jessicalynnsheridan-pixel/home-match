import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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

  // Get the authenticated realtor's ID from their session
  const cookieStore = await cookies();
  const supabaseSession = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabaseSession.auth.getUser();

  if (!user) {
    console.error("Gmail callback: no authenticated user");
    return NextResponse.redirect(`${appUrl}/integrations?gmail=error`);
  }

  // Store tokens server-side only using the service role key.
  // This bypasses RLS so tokens are never writable from the client.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: upsertError } = await supabaseAdmin
    .from("realtor_integrations")
    .upsert(
      {
        realtor_id: user.id,
        provider: "gmail",
        email: googleUser.email ?? "",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "realtor_id,provider" }
    );

  if (upsertError) {
    console.error("Failed to save Gmail integration:", upsertError.message);
    return NextResponse.redirect(`${appUrl}/integrations?gmail=error`);
  }

  // Remove old tokens from user metadata if they were stored there previously
  await supabaseSession.auth.updateUser({
    data: {
      gmail_connected: undefined,
      gmail_email: undefined,
      gmail_access_token: undefined,
      gmail_refresh_token: undefined,
    },
  });

  return NextResponse.redirect(`${appUrl}/integrations?gmail=connected`);
}
