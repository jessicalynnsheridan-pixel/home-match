"use client";

import { useEffect, useState } from "react";
import { Lead, QuestionnaireAnswers } from "@/types";
import { Zap, Mail, CheckCircle2, Send, Flame, Eye, ChevronDown } from "lucide-react";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

  const v1 = `Hi ${first},

I just went through your profile and I love what you're looking for.

${feeling ? `A ${feeling.toLowerCase()}${feeling2 ? ` that doubles as a ${feeling2.toLowerCase()}` : ""}${vibe ? `. Someone whose ideal Sunday starts with ${vibe.toLowerCase()}` : ""}. You're not just looking for a house. You have a feeling in mind, and that's exactly how the best searches start.` : `You're not just looking for a house. You have a feeling in mind, and that's exactly how the best searches start.`}

I've noted everything: ${hoods ? `the ${hoods} neighbourhoods` : `the ${city} pockets`} you're drawn to, ${must1 ? `the ${must1.toLowerCase()} at the top of your list` : "the features that matter most"}, and the things you're leaving behind. I'll be in touch this week to say hello properly and share some early thoughts.

Reply here any time. I read every message personally.

Warm regards,
${realtorName}`;

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

  const v1 = `Hi ${first},

Just wanted to check in and make sure everything landed okay.

No agenda here. Genuinely just curious how you're feeling about the search. Have any questions come up since you submitted your profile?

I'm here whenever you're ready. A quick reply is more than enough.

Warmly,
${realtorName}`;

  const v2 = `Hi ${first},

Quick question. When you picture ${city}, is there a specific neighbourhood feel you keep coming back to?${vibe ? ` You mentioned "${vibe.toLowerCase()}" and that's exactly the kind of detail that helps me tighten the search before we look at a single listing.` : " That kind of thing helps me tighten the search significantly before we look at a single listing."}

No pressure at all. Just thinking ahead for you.

${realtorName}`;

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

  const v1 = `Hi ${first},

Just a quick note. No pressure at all. Still here whenever you're ready.

Buying a home is a big decision, and sometimes life gets busy or you just need more time to sit with it. That's completely normal.

If you ever want to talk through your search, I'm just a reply away.

${realtorName}`;

  const v2 = `Hi ${first},

I've been watching the ${city} market in your range (${budget}) this week${hoods ? `. Especially around ${hoods.split(",")[0].trim()}` : ""}.

There are a few things worth talking through. Nothing urgent, but the kind of context that's useful when you're ready to move.

Happy to do a quick 15-minute call whenever it suits you.

${realtorName}`;

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

// ─── Template type definitions (always-visible cards) ─────────────────────────

interface TemplateType {
  key: string;
  day: string;
  emoji: string;
  subject: string;
  trigger: string;
  tagBg: string;
  tagColor: string;
  accentColor: string;
  tones: string[];
  preview: string;
  forClient: boolean;
}

const TEMPLATE_TYPES: TemplateType[] = [
  {
    key: "day1",
    day: "Day 1",
    emoji: "🏡",
    subject: "Your home search is officially on",
    trigger: "Sent immediately after a buyer submits their profile",
    tagBg: "#dcfce7",
    tagColor: "#166534",
    accentColor: "#059669",
    tones: ["Lifestyle", "Practical", "Their story"],
    preview: `Hi [First name],\n\nI just went through your profile and I love what you're looking for. You're not just looking for a house — you have a feeling in mind, and that's exactly how the best searches start.\n\nWarm regards,\n[Your name]`,
    forClient: true,
  },
  {
    key: "day3",
    day: "Day 3",
    emoji: "👋",
    subject: "Just checking in",
    trigger: "Appears after 3 days if no contact recorded",
    tagBg: "#fef3c7",
    tagColor: "#92400e",
    accentColor: "#d97706",
    tones: ["Warm", "Curious", "Momentum"],
    preview: `Hi [First name],\n\nJust wanted to check in and make sure everything landed okay. No agenda here — genuinely just curious how you're feeling about the search.\n\n[Your name]`,
    forClient: true,
  },
  {
    key: "day7",
    day: "Day 7",
    emoji: "📍",
    subject: "Still thinking about [City]?",
    trigger: "Appears after 7 days if still uncontacted",
    tagBg: "#ede9fe",
    tagColor: "#4c1d95",
    accentColor: "#7c3aed",
    tones: ["Easy", "Market", "Personal"],
    preview: `Hi [First name],\n\nJust a quick note. No pressure at all. Still here whenever you're ready. Buying a home is a big decision, and sometimes life gets busy.\n\n[Your name]`,
    forClient: true,
  },
  {
    key: "alert",
    day: "Inactivity alert",
    emoji: "🔥",
    subject: "Hot lead going quiet — [Name]",
    trigger: "Sent to you when a Hot/Warm lead goes quiet 5+ days",
    tagBg: "#ffedd5",
    tagColor: "#9a3412",
    accentColor: "#ea580c",
    tones: ["Sent to you, not the buyer"],
    preview: `Hi [Realtor],\n\nYour Hot lead [Name] hasn't had any recorded contact in [X] days.\n\nHot leads cool fast. A quick check-in today keeps the relationship alive.\n\n→ View [Name]'s Profile`,
    forClient: false,
  },
];

// ─── Template card (always visible) ──────────────────────────────────────────

function TemplateTypeCard({
  t,
  isSelected,
  onClick,
}: {
  t: TemplateType;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-2xl border transition-all"
      style={{
        borderColor: isSelected ? t.accentColor : "#e8e4de",
        background: isSelected ? "#ffffff" : "#faf9f7",
        boxShadow: isSelected ? `0 0 0 2px ${t.accentColor}22` : "none",
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: t.tagBg, color: t.tagColor }}
          >
            {t.day}
          </span>
          <span className="text-base leading-none">{t.emoji}</span>
        </div>
        <p className="text-[12px] font-semibold text-[#2c2825] leading-snug mb-1">
          &ldquo;{t.subject}&rdquo;
        </p>
        <p className="text-[10px] text-[#8c8580] leading-snug mb-3">{t.trigger}</p>

        {/* Tone pills */}
        <div className="flex flex-wrap gap-1">
          {t.tones.map((tone) => (
            <span
              key={tone}
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: t.tagBg, color: t.tagColor }}
            >
              {tone}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="px-4 py-2 flex items-center justify-between rounded-b-2xl"
        style={{ background: isSelected ? `${t.accentColor}0f` : "#f0ece6" }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: t.accentColor }}>
          {t.forClient ? "Sent to client" : "Sent to you"}
        </span>
        <Eye size={10} style={{ color: t.accentColor }} />
      </div>
    </button>
  );
}

// ─── Email preview panel (shown when a template type is selected) ─────────────

function TemplatePreviewPanel({ t }: { t: TemplateType }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${t.accentColor}44`, background: "#ffffff" }}
    >
      {/* Email header */}
      <div className="px-5 py-4" style={{ background: "#2c2825" }}>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#b8a88a" }}>
            HomeMatch · Preview
          </p>
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: t.tagBg, color: t.tagColor }}
          >
            {t.day}
          </span>
        </div>
        <p className="text-white text-sm font-semibold leading-snug">{t.subject} {t.emoji}</p>
      </div>

      {/* Tone selector label */}
      <div
        className="px-5 py-2.5 border-b flex items-center gap-2"
        style={{ background: `${t.accentColor}08`, borderColor: `${t.accentColor}22` }}
      >
        <span className="text-[10px] font-semibold text-[#8c8580]">3 tone options:</span>
        {t.tones.map((tone) => (
          <span
            key={tone}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: t.tagBg, color: t.tagColor }}
          >
            {tone}
          </span>
        ))}
      </div>

      {/* Email body preview */}
      <div className="px-5 py-4">
        <p
          className="text-[11px] text-[#5c5550] leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {t.preview}
        </p>
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t" style={{ borderColor: "#f0ece6", background: "#faf9f7" }}>
        <p className="text-[10px]" style={{ color: "#8c8580" }}>
          {t.forClient
            ? "Each email is auto-personalised from the buyer's quiz answers. You review, pick a tone, and send."
            : "This alert is sent directly to you — not visible to the buyer."}
        </p>
      </div>
    </div>
  );
}

// ─── Queue send row ───────────────────────────────────────────────────────────

function QueueRow({
  item,
  onSent,
}: {
  item: QueueItem;
  onSent: (leadId: string, type: AutomationType) => void;
}) {
  const [open, setOpen]             = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);
  const [body, setBody]             = useState(item.variants[0].body);
  const [sending, setSending]       = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function switchVariant(idx: number) {
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
      <div className="flex items-center gap-2 px-4 py-3">
        <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
        <span className="text-[11px] text-[#8c8580]">Sent to {item.name}</span>
      </div>
    );
  }

  return (
    <div className="border-b border-[#f5f3f0] last:border-none">
      {/* Collapsed row */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Day badge */}
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: item.tagBg, color: item.tagColor }}
        >
          {item.dayLabel}
        </span>

        {/* Name + score */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {scoreIcon}
          <span className="text-[12px] font-semibold text-[#2c2825] truncate">{item.name}</span>
          <span className="text-[10px] text-[#b8a88a] shrink-0 hidden sm:inline">
            · {item.type === "day1" ? "welcome" : item.type === "day3" ? "check-in" : "follow-up"}
          </span>
        </div>

        {/* Edit & send button */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="shrink-0 flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors border"
          style={open
            ? { background: "#2c2825", color: "#ffffff", borderColor: "#2c2825" }
            : { background: "#ffffff", color: "#2c2825", borderColor: "#e8e4de" }
          }
        >
          <Send size={9} />
          {open ? "Close" : "Edit & send"}
        </button>
      </div>

      {/* Inline composer */}
      {open && (
        <div className="px-4 pb-5 pt-1 space-y-3" style={{ background: "#faf9f7" }}>
          {/* Tone tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-[#b8a88a] font-medium mr-0.5">Tone:</span>
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

          {/* Textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full text-[12px] text-[#2c2825] leading-relaxed rounded-xl border border-[#e8e4de] px-3.5 py-3 resize-none outline-none focus:border-[#b8a88a] transition-colors bg-white"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}
          />

          {/* Send row */}
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
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-all disabled:opacity-50"
                style={{ background: "#2c2825", color: "#ffffff" }}
              >
                <Send size={9} />
                {sending ? "Sending…" : "Send email"}
              </button>
            </div>
          </div>
          {error && <p className="text-[10px] text-center text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function AutomationsWidget({ leads, realtorName = "Your name" }: { leads: Lead[]; realtorName?: string }) {
  const [logs, setLogs]                   = useState<AutomationLog[] | null>(null);
  const [isLive, setIsLive]               = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [sentThisSession, setSentThisSession]   = useState<Set<string>>(new Set());

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

  const selectedTemplateData = TEMPLATE_TYPES.find((t) => t.key === selectedTemplate);

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-[#f0ece6]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef3c7" }}>
              <Mail size={16} style={{ color: "#d97706" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2c2825] leading-tight">Email Automations</p>
              <p className="text-[11px] text-[#8c8580] mt-0.5">
                Personalised templates — pick a tone, review, and send
              </p>
            </div>
          </div>
          {queue.length > 0 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: "#fef3c7", color: "#92400e" }}>
              {queue.length} queued
            </span>
          )}
        </div>
      </div>

      {/* ── Template type cards (always visible) ──────────────────────────── */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-[#8c8580] uppercase tracking-wider mb-3">
          Choose a template
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {TEMPLATE_TYPES.map((t) => (
            <TemplateTypeCard
              key={t.key}
              t={t}
              isSelected={selectedTemplate === t.key}
              onClick={() => setSelectedTemplate(selectedTemplate === t.key ? null : t.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Preview panel (shown when a template is selected) ─────────────── */}
      {selectedTemplateData && (
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <ChevronDown size={11} className="text-[#b8a88a]" style={{ transform: "rotate(180deg)" }} />
            <p className="text-[10px] font-semibold text-[#8c8580]">Template preview</p>
          </div>
          <TemplatePreviewPanel t={selectedTemplateData} />
        </div>
      )}

      {/* ── Send queue ────────────────────────────────────────────────────── */}
      <div className="border-t border-[#f0ece6]">
        <div className="px-5 py-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#2c2825]">
            {logs === null
              ? "Checking your queue…"
              : queue.length > 0
              ? `${queue.length} ready to send`
              : "All caught up"}
          </p>
          {queue.length > 0 && (
            <p className="text-[10px] text-[#b8a88a]">Review, pick a tone, send</p>
          )}
        </div>

        {logs === null ? (
          <div className="px-5 py-6 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#e8e4de] border-t-[#b8a88a] animate-spin" />
          </div>
        ) : queue.length === 0 ? (
          <div className="px-5 pb-4 flex items-center gap-2.5">
            <CheckCircle2 size={15} style={{ color: "#22c55e" }} />
            <div>
              <p className="text-[11px] font-semibold text-[#2c2825]">All caught up</p>
              <p className="text-[10px] text-[#8c8580]">No emails queued right now</p>
            </div>
          </div>
        ) : (
          <div className="border-t border-[#f5f3f0]">
            {queue.map((item) => (
              <QueueRow key={`${item.lead.id}:${item.type}`} item={item} onSent={handleSent} />
            ))}
          </div>
        )}
      </div>

      {/* ── Mock mode notice ──────────────────────────────────────────────── */}
      {isMockMode && (
        <div className="px-5 py-2.5 border-t border-[#f0ece6]" style={{ background: "#fafaf9" }}>
          <p className="text-[10px] text-[#b8a88a] text-center">
            Preview mode · Emails are personalised once real leads submit
          </p>
        </div>
      )}
    </div>
  );
}
