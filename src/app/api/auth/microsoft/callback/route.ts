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
    console.error("Microsoft OAuth error:", error);
    return NextResponse.redirect(`${appUrl}/integrations?microsoft=error`);
  }

  // Exchange authorization code for access + refresh tokens
  const tokenRes = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/microsoft/callback`,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    console.error("Microsoft token exchange failed:", tokens);
    return NextResponse.redirect(`${appUrl}/integrations?microsoft=error`);
  }

  // Get the user's email address from Microsoft Graph
  const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const msUser = await userRes.json();
  const email = msUser.mail ?? msUser.userPrincipalName ?? "";

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
    console.error("Microsoft callback: no authenticated user");
    return NextResponse.redirect(`${appUrl}/integrations?microsoft=error`);
  }

  // Store tokens server-side using the service role key (bypasses RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // One row covers both Outlook email and Outlook Calendar
  const { error: upsertError } = await supabaseAdmin
    .from("realtor_integrations")
    .upsert(
      {
        realtor_id: user.id,
        provider: "microsoft",
        email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "realtor_id,provider" }
    );

  if (upsertError) {
    console.error("Failed to save Microsoft integration:", upsertError.message);
    return NextResponse.redirect(`${appUrl}/integrations?microsoft=error`);
  }

  return NextResponse.redirect(`${appUrl}/integrations?microsoft=connected`);
}
