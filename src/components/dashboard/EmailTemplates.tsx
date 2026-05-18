"use client";

import { useState } from "react";
import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Copy, CheckCheck, Zap, Mail, MessageSquare, Phone, Clock, ExternalLink, Calendar, Settings } from "lucide-react";
import Link from "next/link";

// ─── Send helpers ─────────────────────────────────────────────────────────────

function mailtoUrl(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function outlookUrl(to: string, subject: string, body: string) {
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function smsUrl(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

function googleCalendarUrl(title: string, detail: string, date?: Date) {
  const start = date ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(detail)}`;
}

function outlookCalendarUrl(title: string, detail: string, date?: Date) {
  const start = date ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(detail)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}`;
}

// ─── SendBar component ────────────────────────────────────────────────────────

function EmailSendBar({ to, subject, body, realtorName, realtorPhone }: { to: string; subject: string; body: string; realtorName?: string; realtorPhone?: string }) {
  const signature = [realtorName || "[Your name]", realtorPhone || "[Your phone]"].join("\n");
  const full = `${body}\n\n${signature}`;
  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#e8e4de]">
      <a
        href={mailtoUrl(to, subject, full)}
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
      >
        <Mail size={11} /> Open Draft <ExternalLink size={10} />
      </a>
      <a
        href={outlookUrl(to, subject, full)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
      >
        <span className="text-[11px]">O</span> Outlook <ExternalLink size={10} />
      </a>
    </div>
  );
}

function SmsSendBar({ phone, body }: { phone: string; body: string }) {
  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#e8e4de]">
      <a
        href={smsUrl(phone, body)}
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
      >
        <MessageSquare size={11} /> Open in Messages
      </a>
      <p className="text-[10px] text-[#8c8580] self-center">Works on mobile. On desktop, copy and paste into your SMS app.</p>
    </div>
  );
}

function CalendarBar({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#e8e4de]">
      <p className="text-[10px] text-[#8c8580] w-full mb-1">Schedule a follow-up:</p>
      <a
        href={googleCalendarUrl(title, detail)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
      >
        <Calendar size={11} /> Google Calendar <ExternalLink size={10} />
      </a>
      <a
        href={outlookCalendarUrl(title, detail)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
      >
        <Calendar size={11} /> Outlook Calendar <ExternalLink size={10} />
      </a>
    </div>
  );
}

// ─── Message generators ───────────────────────────────────────────────────────

function buildPersonalizedEmail(lead: Lead): { subject: string; body: string } {
  const { answers } = lead;
  const name = answers.firstName;
  const budget = `${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`;
  const location = answers.preferredNeighbourhoods || answers.preferredCity || "your area";
  const feeling = answers.homeFeeling?.length ? answers.homeFeeling[0].toLowerCase() : null;
  const sunday = answers.sundayMorning || null;
  const quiet = answers.tradeoffQuietVsEnergy === "Quiet & calm";
  const privacy = answers.tradeoffPrivacyVsWalkability === "Privacy";
  const character = answers.tradeoffNewVsCharacter === "Character home";
  const outdoor = answers.tradeoffOutdoorVsInterior === "Outdoor space";
  const preApproved = answers.preApprovalStatus === "Yes, fully approved" || answers.preApprovalStatus === "Paying cash";

  // Build the lifestyle hook from emotional answers
  let lifestyleHook = "";
  if (sunday) {
    lifestyleHook = `You mentioned ${sunday.toLowerCase()} as your ideal Sunday - that tells me a lot about the kind of home that's actually going to feel right for you.`;
  } else if (feeling) {
    lifestyleHook = `You're looking for something ${feeling} - not just a property that checks boxes, but a home that actually fits the life you're building.`;
  }

  // Build the insight line from tradeoffs
  const insights: string[] = [];
  if (quiet) insights.push("a quiet street over a busy one");
  if (privacy) insights.push("privacy over walkability");
  if (character) insights.push("character over new build");
  if (outdoor) insights.push("outdoor space over interior finishes");

  const insightLine = insights.length
    ? `You also told us you'd choose ${insights.slice(0, 2).join(" and ")} - that helps me filter out a lot of the noise before I even show you anything.`
    : "";

  // Must-haves line
  const mustLine = answers.mustHaves?.length
    ? `The things you said are non-negotiable (${answers.mustHaves.slice(0, 3).join(", ")}) are front of mind as I search.`
    : "";

  // Notes callback
  const notesLine = answers.additionalNotes
    ? `I also read your note: "${answers.additionalNotes.slice(0, 120)}${answers.additionalNotes.length > 120 ? "..." : ""}" - that context is genuinely useful.`
    : "";

  // Finance line
  const financeLine = preApproved
    ? `With your financing already in place, we're not waiting on anything - we can move when the right home shows up.`
    : answers.preApprovalStatus === "In progress"
    ? `Once your pre-approval comes through, we'll be in a great position to move quickly.`
    : "";

  const body = `Hi ${name},

I've gone through your Home Match profile and wanted to reach out personally rather than send you a generic search link.

${lifestyleHook}

${insightLine}

${mustLine}

${notesLine}

I'm looking specifically in ${location}, within your ${budget} range. ${financeLine}

I have a couple of properties already in mind that I think are worth a conversation. Nothing that will waste your time - I've already filtered based on what you told us matters most.

Would you be open to a 15-minute call this week? I can walk you through what I've found and we can go from there.

No pressure either way - just wanted to reach out as a real person, not an automated email.

Warmly,`
    .split("\n")
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();

  return {
    subject: `${name} - I've reviewed your profile and have a few homes in mind`,
    body,
  };
}

function buildTextMessage(lead: Lead): string {
  const { answers } = lead;
  const name = answers.firstName;
  const location = answers.preferredCity || "the area";
  const feeling = answers.homeFeeling?.[0]?.toLowerCase();

  if (answers.timeline === "ASAP" || answers.timeline === "1–3 months") {
    return `Hi ${name}, it's YOUR_NAME from Home Match. I've reviewed your profile - ${feeling ? `love that you want something ${feeling}` : "great taste"}. I have 2 properties in ${location} I think fit what you described. Worth a quick call this week?`;
  }

  return `Hi ${name}, it's YOUR_NAME. I came across your Home Match profile - sounds like you know exactly what you're looking for in ${location}. Happy to share what I'm seeing in the market when you're ready. No rush.`;
}

function buildCallScript(lead: Lead): string {
  const { answers } = lead;
  const name = answers.firstName;
  const feeling = answers.homeFeeling?.[0]?.toLowerCase() || "the right fit";
  const location = answers.preferredNeighbourhoods || answers.preferredCity || "your area";
  const sunday = answers.sundayMorning;

  return `OPENING (first 20 seconds)
"Hi ${name}, it's YOUR_NAME - I'm a realtor connected through Home Match. You filled out a profile recently and I wanted to reach out personally. Is now an okay time for 5 minutes?"

IF YES - PERSONALISE IMMEDIATELY
"I read through your answers and I have to say - you were really specific, which I appreciate. You mentioned wanting something ${feeling}${sunday ? `, and ${sunday.toLowerCase()} as your ideal Sunday vibe` : ""}. That tells me exactly what to look for."

THE PIVOT
"I've actually already flagged a couple of properties in ${location} that I think fit what you described - not just on paper, but for the lifestyle you're after. Can I send you a quick overview today?"

IF THEY PUSH BACK
"Totally understand. I'll send you an email with what I have in mind - no commitment, just a starting point. Does [email] still work?"

CLOSING
"Perfect. I'll send that over by [time]. And if you want to just reply with any feedback, I'll refine from there. Look forward to working with you."`;
}

function buildFollowUpEmail(lead: Lead): { subject: string; body: string } {
  const { answers } = lead;
  const name = answers.firstName;
  const location = answers.preferredCity || "your target area";

  return {
    subject: `Following up - ${name}, still thinking about you`,
    body: `Hi ${name},

Just following up on my note from earlier this week. I wanted to make sure it didn't get lost.

I've been keeping a close eye on ${location} and a couple of things have come up that match what you described in your profile.

If now isn't the right time, that's completely fine - I'll keep your profile active and reach out when something genuinely strong comes through.

But if you did want to chat, I'm easy to reach. A 10-minute call is all it takes to know whether it's worth pursuing.

Warmly,`,
  };
}

// ─── CopyBtn (outside component to avoid remount on every render) ─────────────

function CopyBtn({
  id,
  value,
  copied,
  onCopy,
}: {
  id: string;
  value: string;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(id, value)}
      className="flex items-center gap-1 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
    >
      {copied === id ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

function copyToClipboard(
  key: string,
  text: string,
  setCopied: (k: string | null) => void,
) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => fallbackCopy(key, text, setCopied));
  } else {
    fallbackCopy(key, text, setCopied);
  }
}

function fallbackCopy(key: string, text: string, setCopied: (k: string | null) => void) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  } catch { /* silent */ }
}

// ─── Component ───────────────────────────────────────────────────────────────

type Tab = "email" | "text" | "call" | "followup";

const TAB_META: { id: Tab; icon: React.ComponentType<{ size?: number; className?: string }>; label: string; badge?: string; description: string }[] = [
  { id: "email",   icon: Mail,          label: "First Email", badge: "Start here →", description: "Send within 2 hours for Hot leads" },
  { id: "text",    icon: MessageSquare, label: "Text / SMS",                          description: "5× higher open rate than email" },
  { id: "call",    icon: Phone,         label: "Call Script",                         description: "Best within 30 min of sign-up" },
  { id: "followup",icon: Clock,         label: "Follow-up",                           description: "Send 48–72 hrs after no reply" },
];

export default function EmailTemplates({ lead, realtorName, realtorPhone }: { lead: Lead; realtorName?: string; realtorPhone?: string }) {
  const [tab, setTab] = useState<Tab>("email");
  const [copied, setCopied] = useState<string | null>(null);
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [callExpanded, setCallExpanded] = useState(false);
  const [followupExpanded, setFollowupExpanded] = useState(false);

  const rName = realtorName || "[Your Name]";
  const rPhone = realtorPhone || "[Your phone]";

  const email = buildPersonalizedEmail(lead);
  const followup = buildFollowUpEmail(lead);

  // Replace placeholder tokens with real realtor info
  function fillRealtor(str: string) {
    return str
      .replace(/YOUR_NAME/g, rName)
      .replace(/\[Your Name\]/g, rName)
      .replace(/\[Your name\]/g, rName)
      .replace(/\[Your phone\]/g, rPhone);
  }

  const text = fillRealtor(buildTextMessage(lead));
  const call = fillRealtor(buildCallScript(lead));
  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

  function copy(key: string, value: string) {
    copyToClipboard(key, value, setCopied);
  }

  // Helper: first N lines of a string, for collapse preview
  function firstLines(str: string, n: number) {
    return str.split("\n").slice(0, n).join("\n");
  }

  const activeTab = TAB_META.find((t) => t.id === tab)!;

  return (
    <div className="space-y-3">

      {/* ── Lead contact bar ───────────────────────────────────────────────── */}
      <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-[#2c2825] font-medium">
          <Mail size={13} className="text-[#8c8580] shrink-0" />
          <span>{lead.answers.email}</span>
        </div>
        <span className="text-[#e8e4de] select-none hidden sm:inline">·</span>
        <div className="flex items-center gap-2 text-sm text-[#2c2825] font-medium">
          <Phone size={13} className="text-[#8c8580] shrink-0" />
          <span>{lead.answers.phone}</span>
        </div>
      </div>

      {/* ── Outreach card ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">

        {/* Pill tab bar */}
        <div className="flex gap-1.5 p-3 border-b border-[#e8e4de] bg-[#f5f3f0] flex-wrap">
          {TAB_META.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                tab === id
                  ? "bg-[#2c2825] text-white shadow-sm"
                  : "bg-white border border-[#e8e4de] text-[#8c8580] hover:text-[#2c2825] hover:border-[#2c2825]"
              }`}
            >
              <Icon size={11} />
              {label}
              {badge && (
                <span className={`ml-0.5 text-[9px] font-semibold tracking-tight ${tab === id ? "text-[#b8a88a]" : "text-[#b8a88a]"}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab header */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-[#e8e4de]">
          <activeTab.icon size={13} className="text-[#8c8580]" />
          <span className="text-xs font-semibold text-[#2c2825]">{activeTab.label}</span>
          <span className="text-[#e8e4de] select-none">·</span>
          <span className="text-xs text-[#8c8580]">{activeTab.description}</span>
        </div>

        <div className="p-5 space-y-4">

          {/* ── First Email ────────────────────────────────────────────────── */}
          {tab === "email" && (
            <>
              {/* BIG send buttons FIRST */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={mailtoUrl(lead.answers.email, email.subject, fillRealtor(`${email.body}\n\n${rName}\n${rPhone}`))}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2c2825] text-white text-sm font-semibold hover:bg-[#1a1512] transition-colors"
                >
                  <Mail size={15} />
                  Open Draft
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a
                  href={outlookUrl(lead.answers.email, email.subject, fillRealtor(`${email.body}\n\n${rName}\n${rPhone}`))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#2c2825] text-[#2c2825] text-sm font-semibold hover:bg-[#f5f3f0] transition-colors"
                >
                  <Mail size={15} />
                  Open in Outlook
                  <ExternalLink size={12} className="opacity-40" />
                </a>
              </div>

              {/* Zap tip */}
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-[#b8a88a] shrink-0" />
                <p className="text-xs text-[#8c8580]">
                  Personalised from {lead.answers.firstName}&apos;s lifestyle answers. Reads like you wrote it.
                </p>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8c8580] text-xs uppercase tracking-wider">Subject</p>
                  <CopyBtn id="email-subject" value={email.subject} copied={copied} onCopy={copy} />
                </div>
                <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] font-medium">
                  {email.subject}
                </div>
              </div>

              {/* Body - collapsed by default */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8c8580] text-xs uppercase tracking-wider">Body</p>
                  <CopyBtn id="email-body" value={fillRealtor(`${email.body}\n\n${rName}\n${rPhone}`)} copied={copied} onCopy={copy} />
                </div>
                <pre className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-4 text-xs text-[#2c2825] leading-relaxed whitespace-pre-wrap font-sans overflow-hidden">
                  {emailExpanded ? email.body : firstLines(email.body, 3)}
                </pre>
                <button
                  onClick={() => setEmailExpanded((v) => !v)}
                  className="mt-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
                >
                  {emailExpanded ? "Hide full template ↑" : "Show full template →"}
                </button>
              </div>
            </>
          )}

          {/* ── Text / SMS ─────────────────────────────────────────────────── */}
          {tab === "text" && (
            <>
              {/* BIG send button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={smsUrl(lead.answers.phone, text)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2c2825] text-white text-sm font-semibold hover:bg-[#1a1512] transition-colors"
                >
                  <MessageSquare size={15} />
                  Open in Messages
                </a>
                <div className="flex items-center justify-center sm:justify-start">
                  <CopyBtn id="text-msg" value={text} copied={copied} onCopy={copy} />
                </div>
              </div>

              {/* Zap tip */}
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-[#b8a88a] shrink-0" />
                <p className="text-xs text-[#8c8580]">Works on mobile. On desktop, use Copy and paste into your SMS app.</p>
              </div>

              {/* Message preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8c8580] text-xs uppercase tracking-wider">SMS / iMessage</p>
                </div>
                <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-4 text-sm text-[#2c2825] leading-relaxed">
                  {text}
                </div>
              </div>
            </>
          )}

          {/* ── Call Script ────────────────────────────────────────────────── */}
          {tab === "call" && (
            <>
              {/* BIG call button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`tel:${lead.answers.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2c2825] text-white text-sm font-semibold hover:bg-[#1a1512] transition-colors"
                >
                  <Phone size={15} />
                  Call {lead.answers.firstName} now
                </a>
                <a
                  href={googleCalendarUrl(
                    `Call with ${lead.answers.firstName} ${lead.answers.lastName}`,
                    `Buyer profile: ${profileUrl}\nBudget: ${lead.answers.budgetMin ? `$${(lead.answers.budgetMin/1000).toFixed(0)}k` : ""} – ${lead.answers.budgetMax ? `$${(lead.answers.budgetMax/1000).toFixed(0)}k` : ""}\nTimeline: ${lead.answers.timeline}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#2c2825] text-[#2c2825] text-sm font-semibold hover:bg-[#f5f3f0] transition-colors"
                >
                  <Calendar size={14} />
                  Schedule call
                </a>
              </div>

              {/* Zap tip */}
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-[#b8a88a] shrink-0" />
                <p className="text-xs text-[#8c8580]">Name their lifestyle answer in the first 30 seconds. It signals you actually read their profile.</p>
              </div>

              {/* Script - collapsed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8c8580] text-xs uppercase tracking-wider">Call Script</p>
                  <CopyBtn id="call-script" value={call} copied={copied} onCopy={copy} />
                </div>
                <pre className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-4 text-xs text-[#2c2825] leading-relaxed whitespace-pre-wrap font-sans overflow-hidden">
                  {callExpanded ? call : firstLines(call, 3)}
                </pre>
                <button
                  onClick={() => setCallExpanded((v) => !v)}
                  className="mt-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
                >
                  {callExpanded ? "Hide full script ↑" : "Show full script →"}
                </button>
              </div>
            </>
          )}

          {/* ── Follow-up ──────────────────────────────────────────────────── */}
          {tab === "followup" && (
            <>
              {/* BIG send buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={mailtoUrl(lead.answers.email, followup.subject, fillRealtor(`${followup.body}\n\n${rName}\n${rPhone}`))}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2c2825] text-white text-sm font-semibold hover:bg-[#1a1512] transition-colors"
                >
                  <Mail size={15} />
                  Open Draft
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a
                  href={outlookUrl(lead.answers.email, followup.subject, `${followup.body}\n\n[Your name]\n[Your phone]`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#2c2825] text-[#2c2825] text-sm font-semibold hover:bg-[#f5f3f0] transition-colors"
                >
                  <Mail size={15} />
                  Open in Outlook
                  <ExternalLink size={12} className="opacity-40" />
                </a>
              </div>

              {/* Zap tip */}
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-[#b8a88a] shrink-0" />
                <p className="text-xs text-[#8c8580]">Send 48-72 hrs after no reply. Short is better.</p>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8c8580] text-xs uppercase tracking-wider">Subject</p>
                  <CopyBtn id="fu-subject" value={followup.subject} copied={copied} onCopy={copy} />
                </div>
                <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] font-medium">
                  {followup.subject}
                </div>
              </div>

              {/* Body - collapsed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8c8580] text-xs uppercase tracking-wider">Body</p>
                  <CopyBtn id="fu-body" value={`${followup.body}\n\n[Your name]\n[Your phone]`} copied={copied} onCopy={copy} />
                </div>
                <pre className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-4 text-xs text-[#2c2825] leading-relaxed whitespace-pre-wrap font-sans overflow-hidden">
                  {followupExpanded ? followup.body : firstLines(followup.body, 3)}
                </pre>
                <button
                  onClick={() => setFollowupExpanded((v) => !v)}
                  className="mt-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
                >
                  {followupExpanded ? "Hide full template ↑" : "Show full template →"}
                </button>
              </div>

              {/* Calendar schedule */}
              <div className="flex gap-2 pt-1 flex-wrap">
                <a
                  href={googleCalendarUrl(
                    `Follow-up: ${lead.answers.firstName} ${lead.answers.lastName}`,
                    `Send follow-up email to ${lead.answers.email}\nSubject: ${followup.subject}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
                >
                  <Calendar size={11} /> Remind me (Google)
                </a>
                <a
                  href={outlookCalendarUrl(
                    `Follow-up: ${lead.answers.firstName} ${lead.answers.lastName}`,
                    `Send follow-up email to ${lead.answers.email}\nSubject: ${followup.subject}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
                >
                  <Calendar size={11} /> Remind me (Outlook)
                </a>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Integrations link */}
      <Link
        href="/integrations"
        className="flex items-center justify-between bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-3 hover:border-[#2c2825] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Settings size={13} className="text-[#8c8580]" />
          <p className="text-xs text-[#5c5550]">Connect Gmail, Outlook, or calendar to send directly without copy-paste</p>
        </div>
        <ExternalLink size={11} className="text-[#b8b4b0] group-hover:text-[#2c2825] transition-colors shrink-0" />
      </Link>
    </div>
  );
}
