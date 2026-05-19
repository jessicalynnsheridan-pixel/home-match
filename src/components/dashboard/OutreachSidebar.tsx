"use client";

import { useState } from "react";
import { Lead, QuestionnaireAnswers } from "@/types";
import { Mail, Send, Copy, CheckCheck, ExternalLink, Pencil, X } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}k`;
}
function fmtBudget(min?: number, max?: number) {
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  if (max) return `up to ${fmt(max)}`;
  return "budget TBD";
}
function openGmail(to: string, subject: string, body: string) {
  const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "gmail_compose", "width=960,height=720,left=200,top=100");
}
function outlookUrl(to: string, subject: string, body: string) {
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function isValidPhone(p: string) { return p.replace(/\D/g, "").length >= 7; }

// ─── Personalised variants ────────────────────────────────────────────────────

interface Variant { label: string; subject: string; body: string; }

function day1Variants(a: QuestionnaireAnswers, rName: string): Variant[] {
  const first = a.firstName, city = a.preferredCity;
  const feeling = a.homeFeeling?.[0] ?? "", feeling2 = a.homeFeeling?.[1];
  const vibe = a.sundayMorning, hoods = a.preferredNeighbourhoods;
  const style = a.modernVsCozy, must1 = a.mustHaves?.[0];
  const notes = a.additionalNotes?.trim(), frustration = a.currentFrustration?.[0];
  const budget = fmtBudget(a.budgetMin, a.budgetMax);
  const subject = `Your home search is officially on, ${first} 🏡`;

  const v1 = `Hi ${first},\n\nI just went through your profile and I love what you're looking for.\n\n${feeling ? `A ${feeling.toLowerCase()}${feeling2 ? ` that doubles as a ${feeling2.toLowerCase()}` : ""}${vibe ? `. Someone whose ideal Sunday starts with ${vibe.toLowerCase()}` : ""}. You're not just looking for a house. You have a feeling in mind, and that's exactly how the best searches start.` : "You're not just looking for a house. You have a feeling in mind."}\n\nI've noted everything: ${hoods ? `the ${hoods} neighbourhoods` : `the ${city} pockets`} you're drawn to, ${must1 ? `the ${must1.toLowerCase()} at the top of your list` : "the features that matter most"}, and the things you're leaving behind. I'll be in touch this week.\n\nWarm regards,\n${rName}`;

  const v2 = `Hi ${first},\n\nYour profile is in. I've gone through every detail.\n\nCity: ${city}${hoods ? ` (${hoods})` : ""}\nProperty: ${a.propertyType || "Any"}, ${a.bedrooms}bd / ${a.bathrooms}ba\nBudget: ${budget}\nTimeline: ${a.timeline || "Flexible"}\nStyle: ${style || "Open"}\nMust-haves: ${a.mustHaves?.slice(0, 3).join(", ") || "see profile"}\n\nI'll have initial thoughts ready when we connect.\n\nLooking forward to it,\n${rName}`;

  const hook = notes && notes.length > 15
    ? `I caught what you wrote: "${notes.split(".")[0]}." That context helps me move faster for you.`
    : frustration
    ? `The "${frustration.toLowerCase()}" situation you mentioned really stood out. The right home genuinely changes it.`
    : "You clearly know what you want, and that already puts you ahead.";

  const v3 = `Hi ${first},\n\nYour profile came through. Thank you for being so thorough.\n\n${hook}\n\nI'll reach out this week. No pressure, just a proper conversation.\n\nTalk soon,\n${rName}`;

  return [
    { label: "Lifestyle", subject, body: v1 },
    { label: "Practical", subject, body: v2 },
    { label: "Their story", subject, body: v3 },
  ];
}

function day3Variants(a: QuestionnaireAnswers, rName: string): Variant[] {
  const first = a.firstName, city = a.preferredCity, timeline = a.timeline;
  const vibe = a.neighbourhoodVibe?.[0], must1 = a.mustHaves?.[0];
  const feeling = a.homeFeeling?.[0]?.toLowerCase() ?? "home";
  const subject = `Just checking in, ${first} 👋`;

  const v1 = `Hi ${first},\n\nJust wanted to check in and make sure everything landed okay.\n\nNo agenda here. Genuinely just curious how you're feeling about the search.\n\nI'm here whenever you're ready.\n\nWarmly,\n${rName}`;

  const v2 = `Hi ${first},\n\nQuick question — when you picture ${city}, is there a specific neighbourhood feel you keep coming back to?${vibe ? ` You mentioned "${vibe.toLowerCase()}" and that's exactly the kind of detail that helps me tighten the search.` : " That helps me tighten the search significantly."}\n\nNo pressure at all. Just thinking ahead for you.\n\n${rName}`;

  const momentumHook = timeline === "ASAP"
    ? "You're on an ASAP timeline, so I want to make sure we're moving at the pace that works for you."
    : timeline === "1-3 months"
    ? "With a 1–3 month window, now is a good time to lock in a few viewings. The right ones go fast."
    : "There's no rush on your end, and that's actually a strong position.";

  const v3 = `Hi ${first},\n\n${momentumHook}\n\nI've been keeping an eye on ${city} since you submitted. Specifically the${must1 ? ` "${must1.toLowerCase()}"` : " " + feeling} options in your range. Want to get on a quick call this week?\n\nHere whenever you are,\n${rName}`;

  return [
    { label: "Warm", subject, body: v1 },
    { label: "Curious", subject, body: v2 },
    { label: "Momentum", subject, body: v3 },
  ];
}

function day7Variants(a: QuestionnaireAnswers, rName: string): Variant[] {
  const first = a.firstName, city = a.preferredCity, hoods = a.preferredNeighbourhoods;
  const budget = fmtBudget(a.budgetMin, a.budgetMax), must1 = a.mustHaves?.[0];
  const notes = a.additionalNotes?.trim();
  const subject = `Still thinking about ${city}, ${first}?`;

  const v1 = `Hi ${first},\n\nJust a quick note. No pressure at all. Still here whenever you're ready.\n\nBuying a home is a big decision — sometimes life gets busy. That's completely normal.\n\n${rName}`;

  const v2 = `Hi ${first},\n\nI've been watching the ${city} market in your range (${budget}) this week${hoods ? `. Especially around ${hoods.split(",")[0].trim()}` : ""}.\n\nThere are a few things worth talking through — nothing urgent, but useful context when you're ready.\n\nHappy to do a quick 15-minute call.\n\n${rName}`;

  const personalHook = notes && notes.length > 15
    ? `I keep coming back to what you wrote: "${notes.split(".")[0].toLowerCase()}." That's really what we're solving for.`
    : must1
    ? `The ${must1.toLowerCase()} you're after is a specific ask, and I've had a few ideas I'd love to run by you.`
    : "Your search has stayed at the top of my mind. You know exactly what you want.";

  const v3 = `Hi ${first},\n\n${personalHook}\n\nWhenever you're ready to pick this up — even just for a conversation — I'd love to reconnect.\n\n${rName}`;

  return [
    { label: "Easy", subject, body: v1 },
    { label: "Market", subject, body: v2 },
    { label: "Personal", subject, body: v3 },
  ];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DAY_CONFIG = [
  { key: "day1", day: "Day 1", emoji: "🏡", trigger: "Welcome — send right away", tagBg: "#dcfce7", tagColor: "#166534", accentColor: "#059669", tones: ["Lifestyle", "Practical", "Their story"] },
  { key: "day3", day: "Day 3", emoji: "👋", trigger: "Check-in after 3 days", tagBg: "#fef3c7", tagColor: "#92400e", accentColor: "#d97706", tones: ["Warm", "Curious", "Momentum"] },
  { key: "day7", day: "Day 7", emoji: "📍", trigger: "Final nudge after a week", tagBg: "#ede9fe", tagColor: "#4c1d95", accentColor: "#7c3aed", tones: ["Easy", "Market", "Personal"] },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OutreachSidebar({ lead, realtorName, realtorPhone }: { lead: Lead; realtorName?: string; realtorPhone?: string }) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedBody, setEditedBody] = useState("");

  const rName = realtorName || "[Your Name]";
  const rPhone = realtorPhone && isValidPhone(realtorPhone) ? realtorPhone : "";

  const variantsByDay: Record<string, Variant[]> = {
    day1: day1Variants(lead.answers, rName),
    day3: day3Variants(lead.answers, rName),
    day7: day7Variants(lead.answers, rName),
  };

  const selected = DAY_CONFIG.find((d) => d.key === selectedDay);
  const variants = selectedDay ? variantsByDay[selectedDay] : [];
  const current = variants[variantIdx];

  function selectDay(key: string) {
    if (selectedDay === key) { setSelectedDay(null); setEditing(false); return; }
    setSelectedDay(key);
    setVariantIdx(0);
    setEditing(false);
  }

  function switchVariant(i: number) {
    setVariantIdx(i);
    setEditing(false);
  }

  const displayBody = editing ? editedBody : current?.body ?? "";

  function startEditing() {
    setEditedBody(current?.body ?? "");
    setEditing(true);
  }

  function copyBody() {
    const text = `${displayBody}${rPhone ? `\n\n${rPhone}` : ""}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#e8e4de]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fef3c7" }}>
            <Mail size={13} style={{ color: "#d97706" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2c2825]">Personalised Outreach</p>
            <p className="text-[10px] text-[#8c8580]">Written from {lead.answers.firstName}&apos;s quiz answers</p>
          </div>
        </div>
      </div>

      {/* Day cards */}
      <div className="p-3 space-y-2">
        {DAY_CONFIG.map((d) => (
          <button
            key={d.key}
            onClick={() => selectDay(d.key)}
            className="w-full text-left rounded-xl border transition-all px-3 py-2.5"
            style={{
              borderColor: selectedDay === d.key ? d.accentColor : "#e8e4de",
              background: selectedDay === d.key ? "#ffffff" : "#faf9f7",
              boxShadow: selectedDay === d.key ? `0 0 0 2px ${d.accentColor}18` : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: d.tagBg, color: d.tagColor }}>{d.day}</span>
                <span className="text-[11px] text-[#2c2825] font-medium">{d.trigger}</span>
              </div>
              <span className="text-sm">{d.emoji}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {d.tones.map((t) => (
                <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: d.tagBg, color: d.tagColor }}>{t}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Expanded composer */}
      {selected && current && (
        <div className="border-t border-[#f0ece6]">
          {/* Tone selector */}
          <div className="px-3 py-2.5 flex items-center gap-1.5 border-b border-[#f5f3f0]" style={{ background: "#faf9f7" }}>
            <span className="text-[9px] font-semibold text-[#8c8580] mr-0.5">Tone:</span>
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => switchVariant(i)}
                className="text-[9px] font-bold px-2 py-1 rounded-full transition-colors"
                style={variantIdx === i
                  ? { background: "#2c2825", color: "#fff" }
                  : { background: "#fff", color: "#8c8580", border: "1px solid #e8e4de" }
                }
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Subject */}
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-[9px] text-[#8c8580] uppercase tracking-wider mb-1">Subject</p>
            <p className="text-[11px] text-[#2c2825] font-medium bg-[#f5f3f0] border border-[#e8e4de] rounded-lg px-2.5 py-2 leading-snug">
              {current.subject}
            </p>
          </div>

          {/* Body */}
          <div className="px-3 pt-1 pb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] text-[#8c8580] uppercase tracking-wider">Body</p>
              <div className="flex items-center gap-2">
                <button onClick={copyBody} className="flex items-center gap-1 text-[10px] text-[#8c8580] hover:text-[#2c2825] transition-colors">
                  {copied ? <CheckCheck size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => editing ? setEditing(false) : startEditing()}
                  className="flex items-center gap-1 text-[10px] font-semibold transition-colors"
                  style={{ color: editing ? "#8c8580" : "#b8a88a" }}
                >
                  {editing ? <X size={10} /> : <Pencil size={10} />}
                  {editing ? "Done" : "Edit"}
                </button>
              </div>
            </div>
            {editing ? (
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={10}
                className="w-full text-[10px] text-[#2c2825] leading-relaxed font-sans bg-white border border-[#b8a88a] rounded-lg px-2.5 py-2.5 resize-none outline-none focus:border-[#2c2825] transition-colors"
              />
            ) : (
              <pre className="text-[10px] text-[#2c2825] leading-relaxed whitespace-pre-wrap font-sans bg-[#f5f3f0] border border-[#e8e4de] rounded-lg px-2.5 py-2.5 max-h-52 overflow-y-auto">
                {displayBody}
              </pre>
            )}
          </div>

          {/* Send buttons */}
          <div className="px-3 pb-3 flex flex-col gap-1.5">
            <button
              onClick={() => openGmail(lead.answers.email, current.subject, `${displayBody}${rPhone ? `\n\n${rPhone}` : ""}`)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2c2825] text-white text-[11px] font-semibold hover:bg-[#1a1512] transition-colors"
            >
              <Send size={11} /> Open in Gmail <ExternalLink size={9} className="opacity-60" />
            </button>
            <a
              href={outlookUrl(lead.answers.email, current.subject, `${displayBody}${rPhone ? `\n\n${rPhone}` : ""}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8e4de] text-[#2c2825] text-[11px] font-semibold hover:bg-[#f5f3f0] transition-colors"
            >
              <Send size={11} /> Outlook <ExternalLink size={9} className="opacity-40" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
