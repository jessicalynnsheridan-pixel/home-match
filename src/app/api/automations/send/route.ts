import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type AutomationType = "day1" | "day3" | "day7";

interface LeadAnswers {
  firstName?: string;
  lastName?: string;
  email?: string;
  propertyType?: string;
  preferredCity?: string;
  timeline?: string;
  budgetMin?: number;
  budgetMax?: number;
}

function formatBudget(min?: number, max?: number) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  if (max) return `Up to ${fmt(max)}`;
  return "Not specified";
}

// ─── Wrap custom plain-text into branded HTML ─────────────────────────────────

function wrapInHtml(subject: string, text: string, realtorName: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="font-size:14px;color:#5c5550;line-height:1.8;margin:0 0 16px;font-family:Georgia,serif">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2c2825;background:#ffffff">
      <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
        <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
        <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">${subject}</h1>
      </div>
      <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
        ${paragraphs}
        <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:8px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
      </div>
    </div>`;
}

function emailDay1(realtorName: string, answers: LeadAnswers) {
  const first = answers.firstName ?? "there";
  const city = answers.preferredCity ?? "your target area";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app";
  return {
    subject: `Your home search is officially on 🏡`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2c2825;background:#ffffff">
        <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
          <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
          <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">Your home search is officially on 🏡</h1>
        </div>
        <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
          <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${first},</p>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 20px">Thanks for submitting your profile — I've received everything and I'm already reviewing your search criteria. Here's what I have on file for you:</p>
          <div style="background:#faf9f7;border-radius:12px;padding:18px 20px;margin-bottom:24px;border:1px solid #f0ece6">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;border-bottom:1px solid #ede9e3;color:#8c8580;font-size:12px;width:40%">Looking in</td><td style="padding:8px 0;border-bottom:1px solid #ede9e3;font-size:13px;font-weight:600">${city}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #ede9e3;color:#8c8580;font-size:12px">Property type</td><td style="padding:8px 0;border-bottom:1px solid #ede9e3;font-size:13px">${answers.propertyType ?? "Any"}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #ede9e3;color:#8c8580;font-size:12px">Budget</td><td style="padding:8px 0;border-bottom:1px solid #ede9e3;font-size:13px">${formatBudget(answers.budgetMin, answers.budgetMax)}</td></tr>
              <tr><td style="padding:8px 0;color:#8c8580;font-size:12px">Timeline</td><td style="padding:8px 0;font-size:13px">${answers.timeline ?? "Flexible"}</td></tr>
            </table>
          </div>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">I'll be reaching out shortly to introduce myself and chat through next steps. In the meantime, feel free to reply to this email with any questions.</p>
          <p style="font-size:14px;color:#5c5550;margin:0 0 4px">Talk soon,</p>
          <p style="font-size:14px;font-weight:700;color:#2c2825;margin:0">${realtorName}</p>
          <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
        </div>
      </div>`,
  };
}

function emailDay3(realtorName: string, answers: LeadAnswers) {
  const first = answers.firstName ?? "there";
  const city = answers.preferredCity ?? "your area";
  return {
    subject: `Just checking in on your search, ${first} 👋`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2c2825;background:#ffffff">
        <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
          <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">Just checking in on your search 👋</h1>
        </div>
        <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
          <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${first},</p>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">I wanted to check in and see how you're feeling about your home search in ${city}. Do you have any questions since submitting your profile?</p>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">Whether you're ready to start viewing properties or just want to talk through your options, I'm here. No rush — just want to make sure you feel supported every step of the way.</p>
          <p style="font-size:14px;color:#5c5550;margin:0 0 4px">Looking forward to connecting,</p>
          <p style="font-size:14px;font-weight:700;color:#2c2825;margin:0">${realtorName}</p>
          <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
        </div>
      </div>`,
  };
}

function emailDay7(realtorName: string, answers: LeadAnswers) {
  const first = answers.firstName ?? "there";
  const city = answers.preferredCity ?? "your area";
  return {
    subject: `Still thinking about buying in ${city}?`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2c2825;background:#ffffff">
        <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
          <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">Still thinking about buying in ${city}?</h1>
        </div>
        <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
          <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${first},</p>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">It's been a little while since you submitted your profile and I want to make sure you're getting the support you need.</p>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">The market in ${city} moves quickly — but that doesn't mean you have to rush. Even a quick 15-minute call can help clarify what's out there and what fits your situation best.</p>
          <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">Feel free to reply here or give me a call whenever works for you. I'm happy to go at whatever pace feels right.</p>
          <p style="font-size:14px;color:#5c5550;margin:0 0 4px">Here whenever you're ready,</p>
          <p style="font-size:14px;font-weight:700;color:#2c2825;margin:0">${realtorName}</p>
          <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
        </div>
      </div>`,
  };
}

export async function POST(request: NextRequest) {
  // Auth — must be a signed-in realtor
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { leadId: string; type: AutomationType; subject?: string; customText?: string };
  const { leadId, type, subject: customSubject, customText } = body;
  if (!leadId || !type) return NextResponse.json({ error: "Missing leadId or type" }, { status: 400 });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "No Resend key configured" }, { status: 500 });

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch the lead (must belong to this realtor)
  const { data: lead, error: leadError } = await admin
    .from("leads")
    .select("id, realtor_id, answers")
    .eq("id", leadId)
    .eq("realtor_id", user.id)
    .single();

  if (leadError || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const answers = lead.answers as LeadAnswers;
  const buyerEmail = answers.email;
  if (!buyerEmail) return NextResponse.json({ error: "No email on file for this buyer" }, { status: 400 });

  // Realtor display name
  const realtorName =
    user.user_metadata?.first_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Your agent";

  // Build email — prefer custom text from frontend (edited by realtor), fall back to template
  let subject: string;
  let html: string;
  if (customText && customSubject) {
    subject = customSubject;
    html = wrapInHtml(customSubject, customText, realtorName);
  } else {
    const builders: Record<AutomationType, () => { subject: string; html: string }> = {
      day1: () => emailDay1(realtorName, answers),
      day3: () => emailDay3(realtorName, answers),
      day7: () => emailDay7(realtorName, answers),
    };
    ({ subject, html } = builders[type]());
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "HomeMatch <onboarding@resend.dev>";

  // Send via Resend
  const sendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: fromEmail, to: buyerEmail, subject, html }),
  });

  if (!sendRes.ok) {
    const err = await sendRes.text();
    return NextResponse.json({ error: `Resend error: ${err}` }, { status: 500 });
  }

  // Log it
  try {
    await admin.from("automation_log").insert({
      lead_id: leadId,
      realtor_id: user.id,
      automation_type: type,
      email_to: buyerEmail,
      subject,
    });
  } catch { /* table may not exist yet */ }

  return NextResponse.json({ sent: true, to: buyerEmail, subject });
}
