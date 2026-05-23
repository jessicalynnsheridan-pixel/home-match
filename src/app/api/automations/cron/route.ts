import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

type AutomationType = "day1" | "day3" | "day7" | "inactivity";

interface LeadRow {
  id: string;
  realtor_id: string;
  submitted_at: string;
  status: string;
  score: string;
  answers: {
    firstName?: string;
    lastName?: string;
    email?: string;
    propertyType?: string;
    preferredCity?: string;
    timeline?: string;
    budgetMin?: number;
    budgetMax?: number;
  };
}

interface AutomationLogRow {
  lead_id: string;
  automation_type: AutomationType;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function formatBudget(min?: number, max?: number) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  if (max) return `Up to ${fmt(max)}`;
  return "Not specified";
}

async function sendEmail(resendKey: string, to: string, subject: string, html: string) {
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "HomeMatch <onboarding@resend.dev>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: fromEmail, to, subject, html }),
  }).catch(() => {});
}

// ─── Email templates (buyer-facing) ───────────────────────────────────────────

function emailDay1Buyer(realtorName: string, lead: LeadRow) {
  const buyer = `${lead.answers.firstName ?? ""}`.trim() || "there";
  const city = lead.answers.preferredCity ?? "your target area";
  const budget = formatBudget(lead.answers.budgetMin, lead.answers.budgetMax);
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourhomematch.org";
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:0;color:#2c2825;background:#ffffff">
      <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
        <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
        <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">Your home search is officially on 🏡</h1>
      </div>
      <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
        <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${buyer},</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 20px">Thanks for submitting your profile. I've received everything and I'm already reviewing your search criteria. Here's what I have on file for you:</p>
        <div style="background:#faf9f7;border-radius:12px;padding:18px 20px;margin-bottom:24px;border:1px solid #f0ece6">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;border-bottom:1px solid #ede9e3;color:#8c8580;font-size:12px;width:40%;vertical-align:top">Looking in</td><td style="padding:8px 0;border-bottom:1px solid #ede9e3;font-size:13px;font-weight:600">${city}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #ede9e3;color:#8c8580;font-size:12px;vertical-align:top">Property type</td><td style="padding:8px 0;border-bottom:1px solid #ede9e3;font-size:13px">${lead.answers.propertyType ?? "Any"}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #ede9e3;color:#8c8580;font-size:12px;vertical-align:top">Budget</td><td style="padding:8px 0;border-bottom:1px solid #ede9e3;font-size:13px">${budget}</td></tr>
            <tr><td style="padding:8px 0;color:#8c8580;font-size:12px;vertical-align:top">Timeline</td><td style="padding:8px 0;font-size:13px">${lead.answers.timeline ?? "Flexible"}</td></tr>
          </table>
        </div>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">I'll be reaching out shortly to introduce myself and chat through next steps. In the meantime, feel free to reply to this email with any questions.</p>
        <p style="font-size:14px;color:#5c5550;margin:0 0 4px">Talk soon,</p>
        <p style="font-size:14px;font-weight:700;color:#2c2825;margin:0">${realtorName}</p>
        <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
      </div>
    </div>`;
}

function emailDay3Buyer(realtorName: string, lead: LeadRow) {
  const buyer = `${lead.answers.firstName ?? ""}`.trim() || "there";
  const city = lead.answers.preferredCity ?? "your area";
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:0;color:#2c2825;background:#ffffff">
      <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
        <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
        <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">Just checking in on your search 👋</h1>
      </div>
      <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
        <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${buyer},</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">I wanted to check in and see how you're feeling about your home search in ${city}. Do you have any questions since submitting your profile?</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">Whether you're ready to start viewing properties or just want to talk through your options, I'm here. No rush. Just want to make sure you feel supported every step of the way.</p>
        <p style="font-size:14px;color:#5c5550;margin:0 0 4px">Looking forward to connecting,</p>
        <p style="font-size:14px;font-weight:700;color:#2c2825;margin:0">${realtorName}</p>
        <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
      </div>
    </div>`;
}

function emailDay7Buyer(realtorName: string, lead: LeadRow) {
  const buyer = `${lead.answers.firstName ?? ""}`.trim() || "there";
  const city = lead.answers.preferredCity ?? "your area";
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:0;color:#2c2825;background:#ffffff">
      <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
        <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch</p>
        <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">Still thinking about buying in ${city}?</h1>
      </div>
      <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
        <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${buyer},</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">It's been a little while since you submitted your profile and I want to make sure you're getting the support you need.</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">The market in ${city} moves quickly, but that doesn't mean you have to rush. Even a quick 15-minute call can help clarify what's out there and what fits your situation best.</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">Feel free to reply here or give me a call whenever works for you. I'm happy to go at whatever pace feels right.</p>
        <p style="font-size:14px;color:#5c5550;margin:0 0 4px">Here whenever you're ready,</p>
        <p style="font-size:14px;font-weight:700;color:#2c2825;margin:0">${realtorName}</p>
        <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent via HomeMatch · Reply directly to reach ${realtorName}</p>
      </div>
    </div>`;
}

// Inactivity alert goes to the realtor (CRM nudge, not buyer-facing)
function emailInactivityRealtor(realtorName: string, lead: LeadRow, daysIdle: number) {
  const buyer = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourhomematch.org";
  const scoreEmoji = lead.score === "Hot" ? "🔥" : "⚡";
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:0;color:#2c2825;background:#ffffff">
      <div style="background:#2c2825;padding:28px 32px 24px;border-radius:16px 16px 0 0">
        <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">HomeMatch · Inactivity Alert</p>
        <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;line-height:1.3">${scoreEmoji} ${buyer} - ${Math.floor(daysIdle)} days with no contact</h1>
      </div>
      <div style="padding:28px 32px;border:1px solid #e8e4de;border-top:none;border-radius:0 0 16px 16px">
        <p style="font-size:15px;color:#2c2825;margin:0 0 16px">Hi ${realtorName},</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 16px">Your <strong>${lead.score}</strong> lead <strong>${buyer}</strong> (${lead.answers.propertyType ?? "buyer"} in ${lead.answers.preferredCity ?? "N/A"}) hasn't had any recorded contact in ${Math.floor(daysIdle)} days.</p>
        <p style="font-size:14px;color:#5c5550;line-height:1.7;margin:0 0 24px">Hot and warm leads cool fast. A quick personal check-in keeps the relationship warm and shows you're the proactive agent they want in their corner.</p>
        <a href="${appUrl}/dashboard/${lead.id}" style="display:inline-block;background:#ea580c;color:white;padding:13px 26px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700">View ${buyer}'s Profile →</a>
        <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent automatically by HomeMatch · Inactivity detection</p>
      </div>
    </div>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> for cron jobs
  // Also accept direct calls with the secret as a query param for manual testing
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET ?? "homematch2026";

  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManualTrigger = querySecret === cronSecret;

  if (!isVercelCron && !isManualTrigger) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ skipped: "No Resend key configured", ran: new Date().toISOString() });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch all non-closed leads from Supabase
  const { data: leads, error: leadsError } = await admin
    .from("leads")
    .select("id, realtor_id, submitted_at, status, score, answers")
    .neq("status", "Closed");

  if (leadsError) {
    return NextResponse.json({ error: leadsError.message, ran: new Date().toISOString() }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ran: new Date().toISOString(), sent: 0, message: "No active leads found" });
  }

  // Fetch sent automation logs - gracefully handle missing table
  const leadIds = (leads as LeadRow[]).map((l) => l.id);
  const { data: logs } = await admin
    .from("automation_log")
    .select("lead_id, automation_type")
    .in("lead_id", leadIds);

  // Build a set of already-sent automation types per lead
  const sent = new Set<string>();
  for (const log of (logs ?? []) as AutomationLogRow[]) {
    sent.add(`${log.lead_id}:${log.automation_type}`);
  }

  const results: { leadId: string; buyer: string; type: string; status: string }[] = [];

  for (const lead of leads as LeadRow[]) {
    const age = daysSince(lead.submitted_at);
    const buyer = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();

    // Get realtor email
    const { data: userData } = await admin.auth.admin.getUserById(lead.realtor_id);
    const realtorEmail = userData?.user?.email;
    const realtorName = userData?.user?.user_metadata?.first_name ?? "there";
    if (!realtorEmail) continue;

    const buyerEmail = lead.answers.email;

    async function tryLog(type: AutomationType, subject: string, html: string, to: string) {
      if (sent.has(`${lead.id}:${type}`)) return; // already sent
      await sendEmail(resendKey!, to, subject, html);
      // Insert log - silently ignore if table doesn't exist yet
      try {
        await admin.from("automation_log").insert({
          lead_id: lead.id,
          realtor_id: lead.realtor_id,
          automation_type: type,
          email_to: to,
          subject,
        });
      } catch { /* table may not exist yet */ }
      results.push({ leadId: lead.id, buyer, type, status: "sent" });
      sent.add(`${lead.id}:${type}`); // prevent double-send within same run
    }

    // Day 1 - welcome email to buyer (first 36 hours)
    if (age >= 0 && age < 1.5 && buyerEmail) {
      await tryLog("day1", `Your home search is officially on, ${lead.answers.firstName ?? buyer} 🏡`, emailDay1Buyer(realtorName, lead), buyerEmail);
    }

    // Day 3 - check-in email to buyer
    if (age >= 3 && age < 4 && ["New Lead", "Qualified"].includes(lead.status) && buyerEmail) {
      await tryLog("day3", `Just checking in on your search, ${lead.answers.firstName ?? buyer} 👋`, emailDay3Buyer(realtorName, lead), buyerEmail);
    }

    // Day 7 - gentle nudge to buyer
    if (age >= 7 && age < 8 && ["New Lead", "Qualified"].includes(lead.status) && buyerEmail) {
      await tryLog("day7", `Still thinking about buying in ${lead.answers.preferredCity ?? "your area"}?`, emailDay7Buyer(realtorName, lead), buyerEmail);
    }

    // Inactivity - Hot/Warm leads idle 5+ days, re-alerts every 7 days
    if (age >= 5 && (lead.score === "Hot" || lead.score === "Warm")) {
      let lastAlert: { sent_at: string } | null = null;
      try {
        const { data } = await admin
          .from("automation_log")
          .select("sent_at")
          .eq("lead_id", lead.id)
          .eq("automation_type", "inactivity")
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        lastAlert = data;
      } catch { /* table may not exist */ }

      const daysSinceLast = lastAlert?.sent_at ? daysSince(lastAlert.sent_at) : Infinity;
      if (daysSinceLast >= 7) {
        const scoreEmoji = lead.score === "Hot" ? "🔥" : "⚡";
        await tryLog("inactivity", `${scoreEmoji} Inactivity alert: ${buyer} (${Math.floor(age)} days)`, emailInactivityRealtor(realtorName, lead, age), realtorEmail!);
      }
    }
  }

  return NextResponse.json({
    ran: new Date().toISOString(),
    leadsChecked: leads.length,
    sent: results.length,
    results,
  });
}
