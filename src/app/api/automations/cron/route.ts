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

// ─── Email helpers ─────────────────────────────────────────────────────────────

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

// ─── Email templates ──────────────────────────────────────────────────────────

function emailDay1Realtor(realtorName: string, lead: LeadRow) {
  const buyer = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();
  return `
    <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:32px;color:#2c2825">
      <p style="color:#b8a88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">New Buyer · Day 1</p>
      <h2 style="font-size:22px;font-weight:700;margin:0 0 4px">Hi ${realtorName} 👋</h2>
      <p style="color:#8c8580;font-size:14px;margin-bottom:24px">A new buyer just submitted their profile. Here's a quick snapshot:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px;width:40%">Buyer</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:600">${buyer}${lead.answers.email ? ` · ${lead.answers.email}` : ""}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Looking for</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${lead.answers.propertyType ?? "Property"} in ${lead.answers.preferredCity ?? "N/A"}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece6;color:#8c8580;font-size:13px">Budget</td><td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px">${formatBudget(lead.answers.budgetMin, lead.answers.budgetMax)}</td></tr>
        <tr><td style="padding:10px 0;color:#8c8580;font-size:13px">Timeline</td><td style="padding:10px 0;font-size:13px">${lead.answers.timeline ?? "Not set"}</td></tr>
      </table>
      <p style="font-size:14px;color:#2c2825;margin-bottom:20px">💡 <strong>Best practice:</strong> Reach out within the first hour — response rates drop significantly after 24 hrs.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/dashboard/${lead.id}" style="display:inline-block;background:#2c2825;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700">View ${buyer}&apos;s Profile →</a>
      <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent automatically by HomeMatch · Day 1 of nurture sequence</p>
    </div>`;
}

function emailDay3Realtor(realtorName: string, lead: LeadRow) {
  const buyer = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();
  return `
    <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:32px;color:#2c2825">
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:24px">
        <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 2px">⏰ 3-Day Follow-Up Reminder</p>
        <p style="color:#92400e;font-size:13px;margin:0">${buyer} submitted 3 days ago — have you connected yet?</p>
      </div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Hi ${realtorName},</h2>
      <p style="color:#5c5550;font-size:14px;line-height:1.6;margin-bottom:20px">${buyer} is still sitting at <strong>${lead.status}</strong>. Buyers who don't hear back within 3 days often move on to another agent.</p>
      <p style="color:#5c5550;font-size:14px;line-height:1.6;margin-bottom:24px">A quick email or call today keeps you top of mind. We've already drafted a template for you:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/dashboard/${lead.id}#outreach" style="display:inline-block;background:#2c2825;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:12px">Open Outreach Templates →</a>
      <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent automatically by HomeMatch · Day 3 of nurture sequence</p>
    </div>`;
}

function emailDay7Realtor(realtorName: string, lead: LeadRow) {
  const buyer = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();
  return `
    <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:32px;color:#2c2825">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:24px">
        <p style="color:#991b1b;font-size:13px;font-weight:700;margin:0 0 2px">🚨 7-Day Alert — Risk of Losing Lead</p>
        <p style="color:#991b1b;font-size:13px;margin:0">${buyer} hasn't been moved past <strong>${lead.status}</strong> in a week.</p>
      </div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Hi ${realtorName},</h2>
      <p style="color:#5c5550;font-size:14px;line-height:1.6;margin-bottom:20px">It's been 7 days since ${buyer} submitted their profile and they're still at <strong>${lead.status}</strong>. At this stage, buyers have almost certainly spoken to other agents.</p>
      <p style="color:#5c5550;font-size:14px;line-height:1.6;margin-bottom:24px">One genuine, personalised outreach today could still turn this around. We've got their full profile and conversation starters ready.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/dashboard/${lead.id}" style="display:inline-block;background:#dc2626;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:12px">Re-engage ${buyer} Now →</a>
      <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent automatically by HomeMatch · Day 7 of nurture sequence · Final reminder</p>
    </div>`;
}

function emailInactivityRealtor(realtorName: string, lead: LeadRow, daysSinceContact: number) {
  const buyer = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();
  const scoreEmoji = lead.score === "Hot" ? "🔥" : "⚡";
  return `
    <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:32px;color:#2c2825">
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;margin-bottom:24px">
        <p style="color:#9a3412;font-size:13px;font-weight:700;margin:0 0 2px">${scoreEmoji} Inactivity Alert · ${lead.score} Lead</p>
        <p style="color:#9a3412;font-size:13px;margin:0">No contact recorded with ${buyer} in ${Math.floor(daysSinceContact)} days.</p>
      </div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Hi ${realtorName},</h2>
      <p style="color:#5c5550;font-size:14px;line-height:1.6;margin-bottom:20px">Your ${lead.score.toLowerCase()} lead <strong>${buyer}</strong> (${lead.answers.propertyType ?? "buyer"} in ${lead.answers.preferredCity ?? "N/A"}) hasn't had any recorded contact in ${Math.floor(daysSinceContact)} days.</p>
      <p style="color:#5c5550;font-size:14px;line-height:1.6;margin-bottom:24px">Hot and warm leads cool fast. A quick check-in keeps the relationship alive and signals you're the proactive agent they want representing them.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/dashboard/${lead.id}" style="display:inline-block;background:#ea580c;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:12px">View ${buyer}&apos;s Profile →</a>
      <p style="font-size:12px;color:#b8b4b0;border-top:1px solid #e8e4de;padding-top:16px;margin-top:24px">Sent automatically by HomeMatch · Inactivity detection (${Math.floor(daysSinceContact)} days)</p>
    </div>`;
}

// ─── Cron handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET ?? "homematch2026";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ skipped: "No Resend key" });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch all non-closed leads
  const { data: leads, error: leadsError } = await admin
    .from("leads")
    .select("id, realtor_id, submitted_at, status, score, answers")
    .neq("status", "Closed");

  if (leadsError || !leads) {
    return NextResponse.json({ error: leadsError?.message ?? "No leads" }, { status: 500 });
  }

  // Fetch already-sent automation logs to avoid duplicates
  const { data: logs } = await admin
    .from("automation_log")
    .select("lead_id, automation_type")
    .in("lead_id", (leads as LeadRow[]).map((l) => l.id));

  const sent = new Set<string>();
  for (const log of (logs ?? []) as AutomationLogRow[]) {
    sent.add(`${log.lead_id}:${log.automation_type}`);
  }

  const results: { leadId: string; type: string; status: string }[] = [];

  for (const lead of leads as LeadRow[]) {
    const age = daysSince(lead.submitted_at);

    // Look up realtor email
    const { data: userData } = await admin.auth.admin.getUserById(lead.realtor_id);
    const realtorEmail = userData?.user?.email;
    const realtorName = userData?.user?.user_metadata?.first_name ?? "there";
    if (!realtorEmail) continue;

    async function logAndSend(type: AutomationType, subject: string, html: string) {
      if (sent.has(`${lead.id}:${type}`)) return;
      await sendEmail(resendKey!, realtorEmail!, subject, html);
      await admin.from("automation_log").insert({
        lead_id: lead.id,
        realtor_id: lead.realtor_id,
        automation_type: type,
        email_to: realtorEmail,
        subject,
      });
      results.push({ leadId: lead.id, type, status: "sent" });
    }

    const buyerName = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim();

    // Day 1 — new lead intro (within first 36 hours)
    if (age >= 0 && age < 1.5) {
      await logAndSend("day1", `New buyer: ${buyerName} just submitted their profile`, emailDay1Realtor(realtorName, lead));
    }

    // Day 3 — follow-up reminder (still New Lead or Qualified, no action)
    if (age >= 3 && age < 4 && ["New Lead", "Qualified"].includes(lead.status)) {
      await logAndSend("day3", `⏰ Follow up with ${buyerName} — 3 days since they submitted`, emailDay3Realtor(realtorName, lead));
    }

    // Day 7 — final nudge
    if (age >= 7 && age < 8 && ["New Lead", "Qualified"].includes(lead.status)) {
      await logAndSend("day7", `🚨 ${buyerName} — 7 days with no progress`, emailDay7Realtor(realtorName, lead));
    }

    // Inactivity alert — Hot/Warm leads idle 5+ days (send once per 7-day window)
    if (age >= 5 && (lead.score === "Hot" || lead.score === "Warm")) {
      const windowKey = `${lead.id}:inactivity`;
      // Check last inactivity sent
      const { data: lastInactivity } = await admin
        .from("automation_log")
        .select("sent_at")
        .eq("lead_id", lead.id)
        .eq("automation_type", "inactivity")
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const daysSinceLastInactivity = lastInactivity
        ? daysSince(lastInactivity.sent_at)
        : Infinity;

      if (daysSinceLastInactivity >= 7) {
        await sendEmail(resendKey, realtorEmail, `${lead.score === "Hot" ? "🔥" : "⚡"} Inactivity alert: ${buyerName} (${Math.floor(age)} days)`, emailInactivityRealtor(realtorName, lead, age));
        await admin.from("automation_log").insert({
          lead_id: lead.id,
          realtor_id: lead.realtor_id,
          automation_type: "inactivity",
          email_to: realtorEmail,
          subject: `Inactivity alert: ${buyerName}`,
        });
        results.push({ leadId: lead.id, type: "inactivity", status: "sent" });
        sent.add(windowKey);
      }
    }
  }

  return NextResponse.json({ ran: new Date().toISOString(), sent: results.length, results });
}
