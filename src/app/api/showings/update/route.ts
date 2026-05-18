import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();
  if (!id || !["confirmed", "declined", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: req, error } = await admin
    .from("showing_requests")
    .update({ status })
    .eq("id", id)
    .eq("realtor_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send confirmation email to buyer if confirmed + email exists
  if (status === "confirmed" && req?.buyer_email) {
    const resendKey = process.env.RESEND_API_KEY;
    const realtorData = await admin.auth.admin.getUserById(user.id);
    const realtorName = realtorData.data.user?.user_metadata?.first_name || "Your Realtor";

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? "HomeMatch <onboarding@resend.dev>",
          to: req.buyer_email,
          subject: `✅ Showing confirmed — ${req.preferred_dates}`,
          html: `
            <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px;color:#2c2825">
              <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Showing Confirmed</p>
              <h2 style="font-size:22px;font-weight:700;margin:0 0 16px">You're all set, ${req.buyer_name || "there"}!</h2>
              <p style="color:#8c8580;font-size:14px;margin-bottom:24px">${realtorName} has confirmed your showing request.</p>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:600">${req.preferred_dates}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Time</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${req.preferred_time || "Flexible"}</td></tr>
                ${req.message ? `<tr><td style="padding:10px 0;color:#8c8580;font-size:13px">Your note</td><td style="padding:10px 0;font-size:13px;color:#8c8580;font-style:italic">${req.message}</td></tr>` : ""}
              </table>
              <p style="font-size:13px;color:#8c8580;margin-top:24px">Questions? Reply to this email or reach out to ${realtorName} directly.</p>
            </div>
          `,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ success: true, status });
}
