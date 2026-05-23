import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Called every Monday at 8am by Vercel Cron (see vercel.json)
// Also callable manually: GET /api/digest?secret=YOUR_CRON_SECRET
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get all realtors
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: "Could not fetch users", detail: usersError.message }, { status: 500 });
  }
  if (!users?.length) {
    return NextResponse.json({ sent: 0, message: "No users found" });
  }

  const results: { email: string; status: string }[] = [];

  for (const user of users) {
    if (!user.email) continue;

    // Get this realtor's leads
    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("id, score, status, answers, submitted_at")
      .eq("realtor_id", user.id)
      .order("submitted_at", { ascending: false });

    if (!leads?.length) continue;

    const hot = leads.filter((l) => l.score === "Hot");
    const warm = leads.filter((l) => l.score === "Warm");
    const newThisWeek = leads.filter((l) => {
      const d = new Date(l.submitted_at ?? "");
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    });
    const offerStage = leads.filter((l) => l.status === "Offer Stage");

    const realtorName = user.user_metadata?.first_name || user.email.split("@")[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourhomematch.org";

    const hotRows = hot.slice(0, 3).map((l) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:600">${l.answers?.firstName ?? ""} ${l.answers?.lastName ?? ""}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;color:#8c8580">${l.answers?.preferredCity ?? "N/A"}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;color:#8c8580">${l.status}</td>
      </tr>`).join("");

    const html = `
      <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:32px;color:#2c2825;background:#faf9f7">

        <div style="margin-bottom:32px">
          <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Weekly Pipeline Digest</p>
          <h1 style="font-size:26px;font-weight:700;margin:0">Good morning, ${realtorName}.</h1>
          <p style="color:#8c8580;font-size:14px;margin-top:8px">Here's where your pipeline stands this week.</p>
        </div>

        <!-- Stats row -->
        <div style="display:flex;gap:12px;margin-bottom:32px">
          <div style="flex:1;background:white;border:1px solid #e8e4de;border-radius:12px;padding:16px;text-align:center">
            <p style="font-size:28px;font-weight:700;margin:0;color:#2c2825">${leads.length}</p>
            <p style="font-size:11px;color:#8c8580;margin:4px 0 0">Total Leads</p>
          </div>
          <div style="flex:1;background:#fff5f5;border:1px solid #fecaca;border-radius:12px;padding:16px;text-align:center">
            <p style="font-size:28px;font-weight:700;margin:0;color:#dc2626">${hot.length}</p>
            <p style="font-size:11px;color:#ef4444;margin:4px 0 0">Hot</p>
          </div>
          <div style="flex:1;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;text-align:center">
            <p style="font-size:28px;font-weight:700;margin:0;color:#d97706">${warm.length}</p>
            <p style="font-size:11px;color:#f59e0b;margin:4px 0 0">Warm</p>
          </div>
          <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center">
            <p style="font-size:28px;font-weight:700;margin:0;color:#16a34a">${newThisWeek.length}</p>
            <p style="font-size:11px;color:#22c55e;margin:4px 0 0">New this week</p>
          </div>
        </div>

        ${hot.length > 0 ? `
        <!-- Hot leads -->
        <div style="margin-bottom:32px">
          <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#b8a88a;margin-bottom:12px">Hot Leads — Act This Week</p>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;color:#8c8580;padding-bottom:8px;font-weight:600">Name</th>
                <th style="text-align:left;font-size:11px;color:#8c8580;padding-bottom:8px;font-weight:600">Location</th>
                <th style="text-align:left;font-size:11px;color:#8c8580;padding-bottom:8px;font-weight:600">Status</th>
              </tr>
            </thead>
            <tbody>${hotRows}</tbody>
          </table>
        </div>` : ""}

        ${offerStage.length > 0 ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:32px">
          <p style="font-size:13px;font-weight:700;color:#16a34a;margin:0 0 4px">🎉 ${offerStage.length} lead${offerStage.length > 1 ? "s" : ""} at Offer Stage</p>
          <p style="font-size:13px;color:#166534;margin:0">You're close. Keep the momentum going.</p>
        </div>` : ""}

        <a href="${appUrl}/dashboard" style="display:inline-block;background:#2c2825;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:32px">Open My Dashboard →</a>

        <p style="font-size:11px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px">HomeMatch · Weekly digest sent every Monday morning · <a href="${appUrl}/dashboard" style="color:#b8a88a">Manage preferences</a></p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "HomeMatch <onboarding@resend.dev>",
        to: user.email,
        subject: `Your pipeline this week: ${hot.length} hot, ${newThisWeek.length} new`,
        html,
      }),
    });

    results.push({ email: user.email, status: res.ok ? "sent" : "failed" });
  }

  return NextResponse.json({ sent: results.length, results });
}
