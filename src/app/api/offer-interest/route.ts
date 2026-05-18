import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { realtorId, buyerName, buyerEmail, propertyNote, preApprovalStatus, checklistCompleted } = body;

  if (!realtorId || !buyerName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ success: true }); // silent if not configured

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: userData } = await admin.auth.admin.getUserById(realtorId);
  const realtorEmail = userData?.user?.email;
  const realtorName = userData?.user?.user_metadata?.first_name || "there";

  if (!realtorEmail) return NextResponse.json({ success: true });

  const approvalBadge =
    preApprovalStatus === "Yes, fully approved" ? "✅ Pre-approved"
    : preApprovalStatus === "Paying cash"       ? "💰 Cash buyer"
    : preApprovalStatus === "In progress"       ? "⏳ Pre-approval in progress"
    : "⚠️ No pre-approval yet";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "HomeMatch <onboarding@resend.dev>",
      to: realtorEmail,
      subject: `🚨 ${buyerName} is ready to make an offer`,
      html: `
        <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:32px;color:#2c2825">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 4px">🚨 Action Required — Offer Ready</p>
            <p style="color:#166534;font-size:13px;margin:0">${buyerName} has completed their offer checklist and wants to move forward.</p>
          </div>

          <h2 style="font-size:22px;font-weight:700;margin:0 0 4px">Hi ${realtorName},</h2>
          <p style="color:#8c8580;font-size:14px;margin-bottom:24px">Your buyer is ready. Here's what you need to know:</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px;width:40%">Buyer</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:600">${buyerName}${buyerEmail ? ` · ${buyerEmail}` : ""}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Financing</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${approvalBadge}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Checklist</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${checklistCompleted} of 5 items complete</td></tr>
            ${propertyNote ? `<tr><td style="padding:10px 0;color:#8c8580;font-size:13px">Note</td><td style="padding:10px 0;font-size:13px;font-style:italic">${propertyNote}</td></tr>` : ""}
          </table>

          <a href="${appUrl}/dashboard" style="display:inline-block;background:#2c2825;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:24px">Open Dashboard →</a>

          <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:8px">Sent via HomeMatch · ${buyerName} triggered this by completing the offer readiness checklist.</p>
        </div>
      `,
    }),
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
