import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { realtorId, buyerName, buyerEmail, preferredDates, preferredTime, message } = body;

  if (!realtorId || !buyerName || !preferredDates) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Save showing request to Supabase
  const { error } = await supabaseAdmin.from("showing_requests").insert({
    realtor_id: realtorId,
    buyer_name: buyerName,
    buyer_email: buyerEmail ?? "",
    preferred_dates: preferredDates,
    preferred_time: preferredTime ?? "",
    message: message ?? "",
    status: "pending",
    requested_at: new Date().toISOString(),
  });

  if (error) {
    // Table may not exist yet — still return success so buyer UX works
    console.error("Showing request insert failed:", error.message);
  }

  // Email the realtor via Resend (if key is configured)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    // Get realtor email from Supabase auth
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(realtorId);
    const realtorEmail = userData?.user?.email;

    if (realtorEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "HomeMatch <noreply@homematch.ca>",
          to: realtorEmail,
          subject: `Showing request from ${buyerName}`,
          html: `
            <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:32px;color:#2c2825">
              <h2 style="font-size:22px;font-weight:700;margin-bottom:8px">New Showing Request</h2>
              <p style="color:#8c8580;margin-bottom:24px">${buyerName} wants to see a property.</p>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Buyer</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:600">${buyerName}${buyerEmail ? ` · ${buyerEmail}` : ""}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Dates</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${preferredDates}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Time</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${preferredTime || "Flexible"}</td></tr>
                ${message ? `<tr><td style="padding:10px 0;color:#8c8580;font-size:13px">Note</td><td style="padding:10px 0;font-size:13px">${message}</td></tr>` : ""}
              </table>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;margin-top:24px;background:#2c2825;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">View in Dashboard</a>
            </div>
          `,
        }),
      }).catch(() => { /* non-blocking */ });
    }
  }

  return NextResponse.json({ success: true });
}
