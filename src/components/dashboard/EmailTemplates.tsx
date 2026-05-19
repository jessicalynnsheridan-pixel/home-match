"use client";

import { useState } from "react";
import { Lead, QuestionnaireAnswers } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Copy, CheckCheck, Zap, Mail, MessageSquare, Phone, Clock, ExternalLink, Calendar, Settings, Send } from "lucide-react";
import Link from "next/link";

// ─── Budget helper ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}k`;
}
function fmtBudget(min?: number, max?: number) {
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  if (max) return `up to ${fmt(max)}`;
  return "budget TBD";
}

// ─── Day 1/3/7 personalised variants ─────────────────────────────────────────

interface Variant { label: string; subject: string; body: string; }

function day1Variants(a: QuestionnaireAnswers, realtorName: string): Variant[] {
  const first = a.firstName, city = a.preferredCity;
  const feeling = a.homeFeeling?.[0] ?? "", feeling2 = a.homeFeeling?.[1];
  const vibe = a.sundayMorning, hoods = a.preferredNeighbourhoods;
  const style = a.modernVsCozy, must1 = a.mustHaves?.[0];
  const notes = a.additionalNotes?.trim(), frustration = a.currentFrustration?.[0];
  const budget = fmtBudget(a.budgetMin, a.budgetMax);
  const subject = `Your home search is officially on, ${first} 🏡`;

  const v1 = `Hi ${first},\n\nI just went through your profile and I love what you're looking for.\n\n${feeling ? `A ${feeling.toLowerCase()}${feeling2 ? ` that doubles as a ${feeling2.toLowerCase()}` : ""}${vibe ? `. Someone whose ideal Sunday starts with ${vibe.toLowerCase()}` : ""}. You're not just looking for a house. You have a feeling in mind, and that's exactly how the best searches start.` : `You're not just looking for a house. You have a feeling in mind.`}\n\nI've noted everything: ${hoods ? `the ${hoods} neighbourhoods` : `the ${city} pockets`} you're drawn to, ${must1 ? `the ${must1.toLowerCase()} at the top of your list` : "the features that matter most"}, and the things you're leaving behind. I'll be in touch this week.\n\nWarm regards,\n${realtorName}`;

  const v2 = `Hi ${first},\n\nYour profile is in. I've gone through every detail.\n\nCity: ${city}${hoods ? ` (${hoods})` : ""}\nProperty: ${a.propertyType || "Any"}, ${a.bedrooms}bd / ${a.bathrooms}ba\nBudget: ${budget}\nTimeline: ${a.timeline || "Flexible"}\nStyle: ${style || "Open"}\nTop must-haves: ${a.mustHaves?.slice(0, 3).join(", ") || "see full profile"}\n\nI'll have a shortlist ready when we connect.\n\nLooking forward to it,\n${realtorName}`;

  let hook = notes && notes.length > 15
    ? `I caught what you wrote: "${notes.split(".")[0]}." That context is exactly what helps me move faster for you.`
    : frustration
    ? `The "${frustration.toLowerCase()}" situation you mentioned really stood out. The right home genuinely changes it.`
    : `You clearly know what you want, and that already puts you ahead.`;

  const v3 = `Hi ${first},\n\nYour profile came through. Thank you for being so thorough.\n\n${hook}\n\nI'll reach out this week to introduce myself. No pressure, just a proper conversation.\n\nTalk soon,\n${realtorName}`;

  return [
    { label: "Lifestyle", subject, body: v1 },
    { label: "Practical", subject, body: v2 },
    { label: "Their story", subject, body: v3 },
  ];
}

function day3Variants(a: QuestionnaireAnswers, realtorName: string): Variant[] {
  const first = a.firstName, city = a.preferredCity, timeline = a.timeline;
  const vibe = a.neighbourhoodVibe?.[0], must1 = a.mustHaves?.[0];
  const feeling = a.homeFeeling?.[0]?.toLowerCase() ?? "home";
  const subject = `Just checking in, ${first} 👋`;

  const v1 = `Hi ${first},\n\nJust wanted to check in and make sure everything landed okay.\n\nNo agenda here. Genuinely just curious how you're feeling about the search. Have any questions come up?\n\nI'm here whenever you're ready.\n\nWarmly,\n${realtorName}`;

  const v2 = `Hi ${first},\n\nQuick question. When you picture ${city}, is there a specific neighbourhood feel you keep coming back to?${vibe ? ` You mentioned "${vibe.toLowerCase()}" and that's exactly the kind of detail that helps me tighten the search.` : " That kind of thing helps me tighten the search significantly."}\n\nNo pressure at all. Just thinking ahead for you.\n\n${realtorName}`;

  const momentumHook = timeline === "ASAP"
    ? `You're on an ASAP timeline, so I want to make sure we're moving at the pace that works for you.`
    : timeline === "1-3 months"
    ? `With a 1 to 3 month window, now is a good time to lock in a few viewings. The right ones go fast.`
    : `There's no rush on your end, and that's actually a strong position.`;

  const v3 = `Hi ${first},\n\n${momentumHook}\n\nI've been keeping an eye on ${city} since you submitted. Specifically the${must1 ? ` "${must1.toLowerCase()}"` : " " + feeling} options in your range. Want to get on a quick call this week?\n\nHere whenever you are,\n${realtorName}`;

  return [
    { label: "Warm", subject, body: v1 },
    { label: "Curious", subject, body: v2 },
    { label: "Momentum", subject, body: v3 },
  ];
}

function day7Variants(a: QuestionnaireAnswers, realtorName: string): Variant[] {
  const first = a.firstName, city = a.preferredCity, hoods = a.preferredNeighbourhoods;
  const budget = fmtBudget(a.budgetMin, a.budgetMax), must1 = a.mustHaves?.[0];
  const notes = a.additionalNotes?.trim();
  const subject = `Still thinking about ${city}, ${first}?`;

  const v1 = `Hi ${first},\n\nJust a quick note. No pressure at all. Still here whenever you're ready.\n\nBuying a home is a big decision, and sometimes life gets busy. That's completely normal.\n\nIf you ever want to talk through your search, I'm just a reply away.\n\n${realtorName}`;

  const v2 = `Hi ${first},\n\nI've been watching the ${city} market in your range (${budget}) this week${hoods ? `. Especially around ${hoods.split(",")[0].trim()}` : ""}.\n\nThere are a few things worth talking through. Nothing urgent, but the kind of context that's useful when you're ready to move.\n\nHappy to do a quick 15-minute call whenever it suits you.\n\n${realtorName}`;

  const personalHook = notes && notes.length > 15
    ? `I keep coming back to what you wrote: "${notes.split(".")[0].toLowerCase()}." That's really what we're solving for.`
    : must1
    ? `The ${must1.toLowerCase()} you're after is a specific ask, and I've had a few ideas in the back of my mind I'd love to run by you.`
    : `Your search has stayed at the top of my mind. You know exactly what you want, and I want to help you find it.`;

  const v3 = `Hi ${first},\n\n${personalHook}\n\nWhenever you're ready to pick this up, even just for a conversation, I'd love to reconnect.\n\n${realtorName}`;

  return [
    { label: "Easy", subject, body: v1 },
    { label: "Market", subject, body: v2 },
    { label: "Personal", subject, body: v3 },
  ];
}

// ─── Template day config ──────────────────────────────────────────────────────

const DAY_TEMPLATES = [
  { key: "day1", day: "Day 1", emoji: "🏡", trigger: "Send right away — welcome them", tagBg: "#dcfce7", tagColor: "#166534", accentColor: "#059669", toneLabels: ["Lifestyle", "Practical", "Their story"] },
  { key: "day3", day: "Day 3", emoji: "👋", trigger: "Check in after 3 days of no reply", tagBg: "#fef3c7", tagColor: "#92400e", accentColor: "#d97706", toneLabels: ["Warm", "Curious", "Momentum"] },
  { key: "day7", day: "Day 7", emoji: "📍", trigger: "Final nudge after a week of silence", tagBg: "#ede9fe", tagColor: "#4c1d95", accentColor: "#7c3aed", toneLabels: ["Easy", "Market", "Personal"] },
];

// ─── Personalised template card section ───────────────────────────────────────

function PersonalisedTemplates({ lead, realtorName, realtorPhone }: { lead: Lead; realtorName: string; realtorPhone: string }) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const rName = realtorName || "[Your Name]";
  const rPhone = realtorPhone || "[Your phone]";

  const variantsByDay: Record<string, Variant[]> = {
    day1: day1Variants(lead.answers, rName),
    day3: day3Variants(lead.answers, rName),
    day7: day7Variants(lead.answers, rName),
  };

  const selected = DAY_TEMPLATES.find((t) => t.key === selectedDay);
  const variants = selectedDay ? variantsByDay[selectedDay] : [];
  const currentVariant = variants[variantIdx];

  function selectDay(key: string) {
    if (selectedDay === key) { setSelectedDay(null); return; }
    setSelectedDay(key);
    setVariantIdx(0);
  }

  function copyBody() {
    const text = `${currentVariant.body}\n\n${rPhone}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { setCopied("body"); setTimeout(() => setCopied(null), 2000); });
    }
  }

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e8e4de]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef3c7" }}>
            <Mail size={14} style={{ color: "#d97706" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2c2825]">Personalised Email Templates</p>
            <p className="text-[11px] text-[#8c8580] mt-0.5">Each one is written from {lead.answers.firstName}&apos;s quiz answers — pick a day and tone</p>
          </div>
        </div>
      </div>

      {/* Day cards */}
      <div className="p-4 grid grid-cols-3 gap-2.5">
        {DAY_TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => selectDay(t.key)}
            className="text-left rounded-xl border transition-all p-3"
            style={{
              borderColor: selectedDay === t.key ? t.accentColor : "#e8e4de",
              background: selectedDay === t.key ? "#ffffff" : "#faf9f7",
              boxShadow: selectedDay === t.key ? `0 0 0 2px ${t.accentColor}22` : "none",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.tagBg, color: t.tagColor }}>{t.day}</span>
              <span className="text-sm">{t.emoji}</span>
            </div>
            <p className="text-[11px] text-[#2c2825] font-semibold leading-snug mb-1.5">{t.trigger}</p>
            <div className="flex flex-wrap gap-1">
              {t.toneLabels.map((tone) => (
                <span key={tone} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: t.tagBg, color: t.tagColor }}>{tone}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Expanded: tone + body */}
      {selected && currentVariant && (
        <div className="border-t border-[#f0ece6]">
          {/* Tone selector */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-[#f5f3f0]" style={{ background: "#faf9f7" }}>
            <span className="text-[10px] font-semibold text-[#8c8580]">Tone:</span>
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setVariantIdx(i)}
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

          {/* Subject */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] text-[#8c8580] uppercase tracking-wider mb-1.5">Subject</p>
            <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-3.5 py-2.5 text-xs text-[#2c2825] font-medium">
              {currentVariant.subject}
            </div>
          </div>

          {/* Body */}
          <div className="px-4 pt-1 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-[#8c8580] uppercase tracking-wider">Body</p>
              <button onClick={copyBody} className="flex items-center gap-1 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors">
                {copied === "body" ? <CheckCheck size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copied === "body" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-3.5 py-3 text-[11px] text-[#2c2825] leading-relaxed whitespace-pre-wrap font-sans">
              {currentVariant.body}
            </pre>
          </div>

          {/* Send buttons */}
          <div className="px-4 pb-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => openGmail(lead.answers.email, currentVariant.subject, `${currentVariant.body}\n\n${rPhone}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2c2825] text-white text-xs font-semibold hover:bg-[#1a1512] transition-colors"
            >
              <Send size={12} /> Open in Gmail <ExternalLink size={10} className="opacity-60" />
            </button>
            <a
              href={outlookUrl(lead.answers.email, currentVariant.subject, `${currentVariant.body}\n\n${rPhone}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#2c2825] text-[#2c2825] text-xs font-semibold hover:bg-[#f5f3f0] transition-colors"
            >
              <Send size={12} /> Outlook <ExternalLink size={10} className="opacity-40" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Send helpers ─────────────────────────────────────────────────────────────

function gmailUrl(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function openGmail(to: string, subject: string, body: string) {
  window.open(gmailUrl(to, subject, body), "gmail_compose", "width=960,height=720,left=200,top=100");
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
      <button
        onClick={() => openGmail(to, subject, full)}
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
      >
        <Mail size={11} /> Open in Gmail <ExternalLink size={10} />
      </button>
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
    ? `You also told us you'd choose ${insights.slice(0, 2).join(" and ")}. That helps me filter out a lot of the noise before I even show you anything.`
    : "";

  // Must-haves line
  const mustLine = answers.mustHaves?.length
    ? `The things you said are non-negotiable (${answers.mustHaves.slice(0, 3).join(", ")}) are front of mind as I search.`
    : "";

  // Notes callback
  const notesLine = answers.additionalNotes
    ? `I also read your note: "${answers.additionalNotes.slice(0, 120)}${answers.additionalNotes.length > 120 ? "..." : ""}". That context was genuinely helpful.`
    : "";

  // Finance line
  const financeLine = preApproved
    ? `With your financing already in place, we're not waiting on anything. We can move when the right home shows up.`
    : answers.preApprovalStatus === "In progress"
    ? `Once your pre-approval comes through, we'll be in a great position to move quickly.`
    : "";

  const body = `Hi ${name},

I've gone through your HomeMatch profile and wanted to reach out personally rather than send you a generic search link.

${lifestyleHook}

${insightLine}

${mustLine}

${notesLine}

I'm looking specifically in ${location}, within your ${budget} range. ${financeLine}

I have a couple of properties already in mind that I think are worth a conversation. Nothing that will waste your time. I've already filtered based on what you told us matters most.

Would you be open to a 15-minute call this week? I can walk you through what I've found and we can go from there.

No pressure either way. Just wanted to reach out as a real person, not an automated email.

Warmly,`
    .split("\n")
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();

  return {
    subject: `${name}, I've reviewed your profile and have a few homes in mind`,
    body,
  };
}

function buildTextMessage(lead: Lead): string {
  const { answers } = lead;
  const name = answers.firstName;
  const location = answers.preferredCity || "the area";
  const feeling = answers.homeFeeling?.[0]?.toLowerCase();

  if (answers.timeline === "ASAP" || answers.timeline === "1-3 months") {
    return `Hi ${name}, it's YOUR_NAME from HomeMatch. I've reviewed your profile. ${feeling ? `Love that you want something ${feeling}` : "Great taste"}. I have 2 properties in ${location} I think fit what you described. Worth a quick call this week?`;
  }

  return `Hi ${name}, it's YOUR_NAME. I came across your HomeMatch profile. Sounds like you know exactly what you're looking for in ${location}. Happy to share what I'm seeing in the market when you're ready. No rush.`;
}

function buildCallScript(lead: Lead): string {
  const { answers } = lead;
  const name = answers.firstName;
  const feeling = answers.homeFeeling?.[0]?.toLowerCase() || "the right fit";
  const location = answers.preferredNeighbourhoods || answers.preferredCity || "your area";
  const sunday = answers.sundayMorning;

  return `OPENING (first 20 seconds)
"Hi ${name}, it's YOUR_NAME. I'm a realtor connected through HomeMatch. You filled out a profile recently and I wanted to reach out personally. Is now an okay time for 5 minutes?"

IF YES - PERSONALISE IMMEDIATELY
"I read through your answers and I have to say, you were really specific, which I appreciate. You mentioned wanting something ${feeling}${sunday ? `, and ${sunday.toLowerCase()} as your ideal Sunday vibe` : ""}. That tells me exactly what to look for."

THE PIVOT
"I've actually already flagged a couple of properties in ${location} that I think fit what you described - not just on paper, but for the lifestyle you're after. Can I send you a quick overview today?"

IF THEY PUSH BACK
"Totally understand. I'll send you an email with what I have in mind. No commitment, just a starting point. Does [email] still work?"

CLOSING
"Perfect. I'll send that over by [time]. And if you want to just reply with any feedback, I'll refine from there. Look forward to working with you."`;
}

function buildFollowUpEmail(lead: Lead): { subject: string; body: string } {
  const { answers } = lead;
  const name = answers.firstName;
  const location = answers.preferredCity || "your target area";

  return {
    subject: `Following up, ${name}. Still thinking about you`,
    body: `Hi ${name},

Just following up on my note from earlier this week. I wanted to make sure it didn't get lost.

I've been keeping a close eye on ${location} and a couple of things have come up that match what you described in your profile.

If now isn't the right time, that's completely fine. I'll keep your profile active and reach out when something genuinely strong comes through.

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

      {/* ── Personalised Day 1 / 3 / 7 templates ──────────────────────────── */}
      <PersonalisedTemplates lead={lead} realtorName={rName} realtorPhone={rPhone} />

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
                <button
                  onClick={() => openGmail(lead.answers.email, email.subject, fillRealtor(`${email.body}\n\n${rName}\n${rPhone}`))}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2c2825] text-white text-sm font-semibold hover:bg-[#1a1512] transition-colors"
                >
                  <Mail size={15} />
                  Open in Gmail
                  <ExternalLink size={12} className="opacity-60" />
                </button>
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
                    `Buyer profile: ${profileUrl}\nBudget: ${lead.answers.budgetMin ? `$${(lead.answers.budgetMin/1000).toFixed(0)}k` : ""} to ${lead.answers.budgetMax ? `$${(lead.answers.budgetMax/1000).toFixed(0)}k` : ""}\nTimeline: ${lead.answers.timeline}`
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
                <button
                  onClick={() => openGmail(lead.answers.email, followup.subject, fillRealtor(`${followup.body}\n\n${rName}\n${rPhone}`))}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2c2825] text-white text-sm font-semibold hover:bg-[#1a1512] transition-colors"
                >
                  <Mail size={15} />
                  Open in Gmail
                  <ExternalLink size={12} className="opacity-60" />
                </button>
                <a
                  href={outlookUrl(lead.answers.email, followup.subject, fillRealtor(`${followup.body}\n\n${rName}\n${rPhone}`))}
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
                  <CopyBtn id="fu-body" value={fillRealtor(`${followup.body}\n\n${rName}\n${rPhone}`)} copied={copied} onCopy={copy} />
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
