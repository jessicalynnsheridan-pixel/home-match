"use client";

import { useEffect, useState } from "react";
import { Lead, QuestionnaireAnswers } from "@/types";
import { Zap, Mail, CheckCircle2, ChevronDown, Eye, Send, Flame, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AutomationType = "day1" | "day3" | "day7";

interface AutomationLog {
  id: string;
  lead_id: string;
  automation_type: AutomationType;
  sent_at: string;
  subject: string;
}

interface Variant {
  label: string;
  subject: string;
  body: string;
}

interface QueueItem {
  lead: Lead;
  name: string;
  type: AutomationType;
  dayLabel: string;
  tagBg: string;
  tagColor: string;
  variants: Variant[];
}

// ─── Budget helper ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}k`;
}
function fmtBudget(min?: number, max?: number) {
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  if (max) return `up to ${fmt(max)}`;
  return "budget TBD";
}
function daysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

// ─── Personalised email variants ──────────────────────────────────────────────

function day1Variants(a: QuestionnaireAnswers, realtorName: string): Variant[] {
  const first = a.firstName;
  const city = a.preferredCity;
  const feeling  = a.homeFeeling?.[0] ?? "";
  const feeling2 = a.homeFeeling?.[1];
  const vibe     = a.sundayMorning;
  const hoods    = a.preferredNeighbourhoods;
  const style    = a.modernVsCozy;
  const must1    = a.mustHaves?.[0];
  const notes    = a.additionalNotes?.trim();
  const frustration = a.currentFrustration?.[0];
  const budget   = fmtBudget(a.budgetMin, a.budgetMax);
  const subject  = `Your home search is officially on, ${first} 🏡`;

  // Variant 1 - Lifestyle-first (emotional, vibe-led)
  const v1 = `Hi ${first},

I just went through your profile and I love what you're looking for.

${feeling ? `A ${feeling.toLowerCase()}${feeling2 ? ` that doubles as a ${feeling2.toLowerCase()}` : ""}${vibe ? `. Someone whose ideal Sunday starts with ${vibe.toLowerCase()}` : ""}. You're not just looking for a house. You have a feeling in mind, and that's exactly how the best searches start.` : `You're not just looking for a house. You have a feeling in mind, and that's exactly how the best searches start.`}

I've noted everything: ${hoods ? `the ${hoods} neighbourhoods` : `the ${city} pockets`} you're drawn to, ${must1 ? `the ${must1.toLowerCase()} at the top of your list` : "the features that matter most"}, and the things you're leaving behind. I'll be in touch this week to say hello properly and share some early thoughts.

Reply here any time. I read every message personally.

Warm regards,
${realtorName}`;

  // Variant 2 - Practical (by the numbers, shows you read everything)
  const v2 = `Hi ${first},

Your profile is in. I've gone through every detail.

Here's what I'm working with:

City: ${city}${hoods ? ` (${hoods})` : ""}
Property: ${a.propertyType || "Any"}, ${a.bedrooms}bd / ${a.bathrooms}ba
Budget: ${budget}
Timeline: ${a.timeline || "Flexible"}
Style: ${style || "Open"}
Top must-haves: ${a.mustHaves?.slice(0, 3).join(", ") || "see full profile"}

I'll have some initial thoughts and a shortlist worth looking at ready when we connect. Expect to hear from me soon.

Looking forward to it,
${realtorName}`;

  // Variant 3 - Their story (situational, references notes/frustrations)
  let hook = "";
  if (notes && notes.length > 15) {
    hook = `I caught what you wrote: "${notes.split(".")[0]}." That kind of context is exactly what helps me move faster and smarter for you.`;
  } else if (frustration) {
    hook = `The "${frustration.toLowerCase()}" situation you mentioned really stood out. I hear that a lot from people searching in ${city} and the right home genuinely changes it.`;
  } else {
    hook = `You clearly know what you want, and that already puts you ahead. A lot of buyers figure that out three showings in.`;
  }

  const v3 = `Hi ${first},

Your profile came through. Thank you for being so thorough.

${hook}

I'll reach out this week to introduce myself and walk through where your search is headed. No pressure, just a proper conversation.

Talk soon,
${realtorName}`;

  return [
    { label: "Lifestyle", subject, body: v1 },
    { label: "Practical", subject, body: v2 },
    { label: "Their story", subject, body: v3 },
  ];
}

function day3Variants(a: QuestionnaireAnswers, realtorName: string): Variant[] {
  const first    = a.firstName;
  const city     = a.preferredCity;
  const timeline = a.timeline;
  const vibe     = a.neighbourhoodVibe?.[0];
  const must1    = a.mustHaves?.[0];
  const feeling  = a.homeFeeling?.[0]?.toLowerCase() ?? "home";
  const subject  = `Just checking in, ${first} 👋`;

  // Variant 1 - Warm (short, zero pressure)
  const v1 = `Hi ${first},

Just wanted to check in and make sure everything landed okay.

No agenda here. Genuinely just curious how you're feeling about the search. Have any questions come up since you submitted your profile?

I'm here whenever you're ready. A quick reply is more than enough.

Warmly,
${realtorName}`;

  // Variant 2 - Curious (meaningful question pulled from their profile)
  const v2 = `Hi ${first},

Quick question. When you picture ${city}, is there a specific neighbourhood feel you keep coming back to?${vibe ? ` You mentioned "${vibe.toLowerCase()}" and that's exactly the kind of detail that helps me tighten the search before we look at a single listing.` : " That kind of thing helps me tighten the search significantly before we look at a single listing."}

No pressure at all. Just thinking ahead for you.

${realtorName}`;

  // Variant 3 - Momentum (timeline-aware, market-minded)
  let momentumHook = "";
  if (timeline === "ASAP") {
    momentumHook = `You're on an ASAP timeline, so I want to make sure we're moving at the pace that works for you.`;
  } else if (timeline === "1-3 months") {
    momentumHook = `With a 1 to 3 month window, now is a good time to lock in a few viewings. The right ones tend to go fast.`;
  } else {
    momentumHook = `There's no rush on your end, and that's actually a strong position. You can afford to wait for the right fit.`;
  }

  const v3 = `Hi ${first},

${momentumHook}

I've been keeping an eye on ${city} since you submitted your profile. Specifically the${must1 ? ` "${must1.toLowerCase()}"` : " " + feeling} options in your range. Want to get on a quick call this week and talk through what's worth seeing?

Here whenever you are,
${realtorName}`;

  return [
    { label: "Warm", subject, body: v1 },
    { label: "Curious", subject, body: v2 },
    { label: "Momentum", subject, body: v3 },
  ];
}

function day7Variants(a: QuestionnaireAnswers, realtorName: string): Variant[] {
  const first   = a.firstName;
  const city    = a.preferredCity;
  const hoods   = a.preferredNeighbourhoods;
  const budget  = fmtBudget(a.budgetMin, a.budgetMax);
  const must1   = a.mustHaves?.[0];
  const notes   = a.additionalNotes?.trim();
  const subject = `Still thinking about ${city}, ${first}?`;

  // Variant 1 - Easy (lowest pressure, just present)
  const v1 = `Hi ${first},

Just a quick note. No pressure at all. Still here whenever you're ready.

Buying a home is a big decision, and sometimes life gets busy or you just need more time to sit with it. That's completely normal.

If you ever want to talk through your search, I'm just a reply away.

${realtorName}`;

  // Variant 2 - Market (city-specific, shows active attention)
  const v2 = `Hi ${first},

I've been watching the ${city} market in your range (${budget}) this week${hoods ? `. Especially around ${hoods.split(",")[0].trim()}` : ""}.

There are a few things worth talking through. Nothing urgent, but the kind of context that's useful when you're ready to move.

Happy to do a quick 15-minute call whenever it suits you.

${realtorName}`;

  // Variant 3 - Personal (references something very specific from their quiz)
  let personalHook = "";
  if (notes && notes.length > 15) {
    personalHook = `I keep coming back to what you wrote: "${notes.split(".")[0].toLowerCase()}." That's really what we're solving for, and I want to make sure I do it right.`;
  } else if (must1) {
    personalHook = `The ${must1.toLowerCase()} you're after is a specific ask, and I've had a few ideas in the back of my mind I'd love to run by you.`;
  } else {
    personalHook = `Your search has stayed at the top of my mind. You know exactly what you want, and I want to help you find it.`;
  }

  const v3 = `Hi ${first},

${personalHook}

Whenever you're ready to pick this up, even just for a conversation, I'd love to reconnect. I'll follow your lead completely.

${realtorName}`;

  return [
    { label: "Easy", subject, body: v1 },
    { label: "Market", subject, body: v2 },
    { label: "Personal", subject, body: v3 },
  ];
}

// ─── Day config ───────────────────────────────────────────────────────────────

const DAY_CONFIG: Record<AutomationType, { label: string; tagBg: string; tagColor: string }> = {
  day1: { label: "Day 1",  tagBg: "#dcfce7", tagColor: "#166534" },
  day3: { label: "Day 3",  tagBg: "#fef3c7", tagColor: "#92400e" },
  day7: { label: "Day 7",  tagBg: "#ede9fe", tagColor: "#4c1d95" },
};

// ─── Queue builder ────────────────────────────────────────────────────────────

function buildQueue(leads: Lead[], logs: AutomationLog[], realtorName: string): QueueItem[] {
  const items: QueueItem[] = [];
  for (const lead of leads) {
    const sentTypes = new Set(logs.filter((l) => l.lead_id === lead.id).map((l) => l.automation_type));
    const age = daysSince(lead.submittedAt);
    const name = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim() || "Unnamed buyer";
    const isActive = ["New Lead", "Qualified", "Showing Booked"].includes(lead.status);
    if (!isActive) continue;

    let type: AutomationType | null = null;
    if (!sentTypes.has("day1")) {
      type = "day1";
    } else if (!sentTypes.has("day3") && age >= 3 && ["New Lead", "Qualified"].includes(lead.status)) {
      type = "day3";
    } else if (!sentTypes.has("day7") && age >= 7 && ["New Lead", "Qualified"].includes(lead.status)) {
      type = "day7";
    }

    if (!type) continue;
    const cfg = DAY_CONFIG[type];
    const variants =
      type === "day1" ? day1Variants(lead.answers, realtorName) :
      type === "day3" ? day3Variants(lead.answers, realtorName) :
      day7Variants(lead.answers, realtorName);

    items.push({ lead, name, type, dayLabel: cfg.label, tagBg: cfg.tagBg, tagColor: cfg.tagColor, variants });
  }
  return items;
}

function buildMockQueue(leads: Lead[], realtorName: string): QueueItem[] {
  const mockLogs: AutomationLog[] = [
    { id: "m1", lead_id: "lead-001", automation_type: "day1", sent_at: new Date(Date.now() - 4 * 86400000).toISOString(), subject: "" },
    { id: "m2", lead_id: "lead-001", automation_type: "day3", sent_at: new Date(Date.now() - 1 * 86400000).toISOString(), subject: "" },
    { id: "m3", lead_id: "lead-002", automation_type: "day1", sent_at: new Date(Date.now() - 2 * 86400000).toISOString(), subject: "" },
  ];
  return buildQueue(leads, mockLogs, realtorName);
}

// ─── Queue row (with inline composer) ────────────────────────────────────────

function QueueRow({
  item,
  onSent,
}: {
  item: QueueItem;
  onSent: (leadId: string, type: AutomationType) => void;
}) {
  const [open, setOpen]           = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);
  const [body, setBody]           = useState(item.variants[0].body);
  const [sending, setSending]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // When user switches variant, replace body unless they've already edited it
  const currentVariantBody = item.variants[variantIdx].body;
  function switchVariant(idx: number) {
    // If current body matches any variant exactly, treat as "unedited" and switch
    const isUnedited = item.variants.some((v) => v.body === body);
    setVariantIdx(idx);
    if (isUnedited) setBody(item.variants[idx].body);
  }

  const scoreIcon =
    item.lead.score === "Hot"  ? <Flame size={10} style={{ color: "#ef4444" }} /> :
    item.lead.score === "Warm" ? <Zap size={10} style={{ color: "#f97316" }} /> : null;

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/automations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: item.lead.id,
          type: item.type,
          subject: item.variants[variantIdx].subject,
          customText: body,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => onSent(item.lead.id, item.type), 700);
      } else {
        setError(data.error ?? "Send failed");
        setSending(false);
      }
    } catch {
      setError("Network error");
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="px-4 py-3 flex items-center gap-2">
        <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
        <span className="text-[11px] text-[#8c8580]">Sent to {item.name}</span>
      </div>
    );
  }

  return (
    <div className="border-b border-[#f5f3f0] last:border-none">
      {/* Header row - click to expand/collapse */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#faf9f7] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: item.tagBg, color: item.tagColor }}>
            {item.dayLabel}
          </span>
          <div className="flex items-center gap-1 min-w-0">
            {scoreIcon}
            <span className="text-[11px] font-semibold text-[#2c2825] truncate">{item.name}</span>
          </div>
          <span className="text-[10px] text-[#b8a88a] shrink-0 hidden sm:inline">
            {item.type === "day1" ? "welcome" : item.type === "day3" ? "check-in" : "follow-up"}
          </span>
        </div>
        {open
          ? <ChevronUp size={13} className="text-[#b8a88a] shrink-0" />
          : <span className="text-[10px] font-semibold text-[#2c2825] border border-[#e8e4de] px-2.5 py-1 rounded-full shrink-0 hover:bg-[#f0ece6] transition-colors">Edit & send</span>
        }
      </button>

      {/* Composer - inline when open */}
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3" style={{ background: "#faf9f7" }}>
          {/* Variant tabs */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#b8a88a] mr-1">Tone:</span>
            {item.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => switchVariant(i)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                style={variantIdx === i
                  ? { background: "#2c2825", color: "#ffffff" }
                  : { background: "#ffffff", color: "#8c8580", border: "1px solid #e8e4de" }
                }
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Editable textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full text-[12px] text-[#2c2825] leading-relaxed rounded-xl border border-[#e8e4de] px-3.5 py-3 resize-none outline-none focus:border-[#b8a88a] transition-colors"
            style={{ background: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}
          />

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-[#b8a88a] truncate">
              To: {item.lead.answers.email || "no email on file"}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] text-[#8c8580] px-2.5 py-1 rounded-full border border-[#e8e4de] hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !item.lead.answers.email}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                style={{ background: "#2c2825", color: "#ffffff" }}
              >
                <Send size={9} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
          {error && <p className="text-[10px] text-center" style={{ color: "#ef4444" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Template preview card ────────────────────────────────────────────────────

interface TemplatePreview {
  day: string; trigger: string; subject: string; body: string;
  tagBg: string; tagColor: string; color: string;
}
const TEMPLATE_PREVIEWS: TemplatePreview[] = [
  { day: "Day 1", trigger: "Sent to buyer as soon as you click Send", subject: "Your home search is officially on 🏡",
    body: `Hi [First name],\n\nI just finished reading through your profile and I love what you're looking for. A peaceful retreat that also feels like a family nest. Someone whose ideal Sunday starts with total quiet. You're not just looking for a house. You have a feeling in mind.\n\nI've noted everything: the Rosedale, Forest Hill, Lawrence Park neighbourhoods, the chef's kitchen at the top of your list, the private backyard. I'll be in touch this week.\n\nWarm regards,\n[Your name]`,
    tagBg: "#dcfce7", tagColor: "#166534", color: "#059669" },
  { day: "Day 3", trigger: "Appears after 3 days if uncontacted",
    subject: "Just checking in 👋",
    body: `Hi [First name],\n\nJust wanted to check in. No agenda here. Genuinely just curious how you're feeling about the search. Have any questions come up?\n\nI'm here whenever you're ready.\n\nWarmly,\n[Your name]`,
    tagBg: "#fef3c7", tagColor: "#92400e", color: "#d97706" },
  { day: "Day 7", trigger: "Appears after 7 days if still uncontacted",
    subject: "Still thinking about [City]?",
    body: `Hi [First name],\n\nJust a quick note. No pressure at all. Still here whenever you're ready.\n\nIf you ever want to talk through your search, I'm just a reply away.\n\n[Your name]`,
    tagBg: "#ede9fe", tagColor: "#4c1d95", color: "#7c3aed" },
  { day: "Realtor alert", trigger: "Auto-sent to you when a Hot/Warm lead goes quiet for 5+ days",
    subject: "🔥 Inactivity alert: [Name] ([X] days)",
    body: `Hi [Realtor],\n\nYour Hot lead [Name] hasn't had any recorded contact in [X] days.\n\nHot leads cool fast. A quick check-in today keeps the relationship alive.\n\n→ View [Name]'s Profile`,
    tagBg: "#ffedd5", tagColor: "#9a3412", color: "#ea580c" },
];

function TemplateCard({ t }: { t: TemplatePreview }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #e8e4de", borderRadius: "12px", overflow: "hidden", background: "#ffffff" }}>
      <button onClick={() => setOpen((p) => !p)} className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-[#faf9f7] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: t.tagBg, color: t.tagColor }}>{t.day}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#2c2825] truncate">{t.subject}</p>
            <p className="text-[10px] text-[#b8a88a] mt-0.5">{t.trigger}</p>
          </div>
        </div>
        <ChevronDown size={12} className="text-[#b8a88a] shrink-0 ml-2 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #f0ece6", background: "#f5f4f2", padding: "12px" }}>
          <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e8e4de", overflow: "hidden" }}>
            <div style={{ background: "#2c2825", padding: "11px 14px 10px" }}>
              <p style={{ color: "#b8a88a", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>HomeMatch</p>
              <p style={{ color: "#ffffff", fontSize: "12px", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{t.subject}</p>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <p style={{ fontSize: "11px", color: "#5c5550", lineHeight: 1.75, whiteSpace: "pre-line", margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>{t.body}</p>
            </div>
          </div>
          <p className="text-[10px] flex items-center gap-1 mt-2" style={{ color: "#8c8580" }}>
            <Send size={8} style={{ color: t.color }} />
            {t.day === "Realtor alert" ? "Sent to you - not visible to buyer" : "Sent to client · 3 tone options to choose from"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function AutomationsWidget({ leads, realtorName = "Your name" }: { leads: Lead[]; realtorName?: string }) {
  const [logs, setLogs]                 = useState<AutomationLog[] | null>(null);
  const [isLive, setIsLive]             = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sentThisSession, setSentThisSession] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/automations/status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.logs)) { setLogs(data.logs); setIsLive(true); }
        else { setLogs([]); setIsLive(false); }
      })
      .catch(() => { setLogs([]); setIsLive(false); });
  }, []);

  const activeLeads = leads.filter((l) => l.status !== "Closed");
  const isMockMode  = !isLive && activeLeads.some((l) => l.id.startsWith("lead-"));

  const allQueue: QueueItem[] = isMockMode
    ? buildMockQueue(activeLeads, realtorName)
    : logs !== null
    ? buildQueue(activeLeads, logs, realtorName)
    : [];

  const queue = allQueue.filter((item) => !sentThisSession.has(`${item.lead.id}:${item.type}`));

  function handleSent(leadId: string, type: AutomationType) {
    setSentThisSession((prev) => new Set([...prev, `${leadId}:${type}`]));
  }

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#f0ece6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#fef3c7" }}>
            <Zap size={13} style={{ color: "#d97706" }} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2c2825]">Automations</p>
            <p className="text-[10px] text-[#8c8580]">Client email queue</p>
          </div>
        </div>
        {logs !== null && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={queue.length > 0
              ? { background: "#fef3c7", color: "#92400e" }
              : { background: "#f0fdf4", color: "#166534" }}>
            {queue.length > 0 ? `${queue.length} queued` : "All sent"}
          </span>
        )}
      </div>

      {/* Queue */}
      <div>
        {logs === null ? (
          <div className="px-4 py-6 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#e8e4de] border-t-[#b8a88a] animate-spin" />
          </div>
        ) : queue.length === 0 ? (
          <div className="px-4 py-5 flex items-center gap-2.5">
            <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
            <div>
              <p className="text-[11px] font-semibold text-[#2c2825]">All caught up</p>
              <p className="text-[10px] text-[#8c8580]">No emails queued right now</p>
            </div>
          </div>
        ) : (
          queue.map((item) => (
            <QueueRow key={`${item.lead.id}:${item.type}`} item={item} onSent={handleSent} />
          ))
        )}
      </div>

      {/* Templates section */}
      <div className="border-t border-[#f0ece6]">
        <button
          onClick={() => setShowTemplates((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#faf9f7] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-[#b8a88a]" />
            <span className="text-[11px] font-semibold text-[#2c2825]">View email templates</span>
            <span className="text-[10px] text-[#b8a88a]">· 3 tone options per email</span>
          </div>
          <ChevronDown size={12} className="text-[#b8a88a] transition-transform" style={{ transform: showTemplates ? "rotate(180deg)" : "none" }} />
        </button>

        {showTemplates && (
          <div className="px-3 pb-3 pt-2 space-y-2 border-t border-[#f0ece6]" style={{ background: "#faf9f7" }}>
            <p className="text-[10px] text-[#8c8580] leading-relaxed px-1 mb-2">
              Day 1 / 3 / 7 go to your <strong>client</strong> - personalised from their quiz answers, 3 tone options to pick from. Inactivity alert comes to <strong>you</strong>.
            </p>
            {TEMPLATE_PREVIEWS.map((t, i) => <TemplateCard key={i} t={t} />)}
          </div>
        )}
      </div>

      {isMockMode && (
        <div className="px-4 py-2.5 border-t border-[#f0ece6]" style={{ background: "#fafaf9" }}>
          <p className="text-[10px] text-[#b8a88a] text-center">
            Preview mode · Emails personalised once real leads submit
          </p>
        </div>
      )}
    </div>
  );
}
