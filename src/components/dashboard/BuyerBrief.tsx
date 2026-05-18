"use client";

import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  Copy, Check, Home, DollarSign, Clock, MapPin,
  Heart, Zap, ShieldCheck, MessageSquare, Star, X as XIcon,
} from "lucide-react";

// ─── Starter types ────────────────────────────────────────────────────────────

type StarterType = "lifestyle" | "financing" | "preference" | "musthave" | "notes";

interface Starter {
  hook: string;
  why: string;
  type: StarterType;
  tag: string;
}

const TYPE_STYLES: Record<StarterType, {
  bg: string; border: string; tag: string; tagText: string; accent: string; icon: React.ReactNode;
}> = {
  lifestyle:  { bg: "bg-violet-50",  border: "border-violet-200", tag: "bg-violet-100",  tagText: "text-violet-700",  accent: "bg-violet-400",  icon: <Heart size={11} />    },
  financing:  { bg: "bg-amber-50",   border: "border-amber-200",  tag: "bg-amber-100",   tagText: "text-amber-700",   accent: "bg-amber-400",   icon: <DollarSign size={11} /> },
  preference: { bg: "bg-sky-50",     border: "border-sky-200",    tag: "bg-sky-100",     tagText: "text-sky-700",     accent: "bg-sky-400",     icon: <Home size={11} />     },
  musthave:   { bg: "bg-emerald-50", border: "border-emerald-200",tag: "bg-emerald-100", tagText: "text-emerald-700", accent: "bg-emerald-400", icon: <Star size={11} />     },
  notes:      { bg: "bg-rose-50",    border: "border-rose-200",   tag: "bg-rose-100",    tagText: "text-rose-700",    accent: "bg-rose-400",    icon: <MessageSquare size={11} /> },
};

// ─── Conversation starters ────────────────────────────────────────────────────

function getConversationStarters(lead: Lead): Starter[] {
  const { answers } = lead;
  const starters: Starter[] = [];

  if (answers.sundayMorning) {
    const map: Record<string, Starter> = {
      "Hosting people":    { hook: `"I pulled a few homes with open-plan living you'd love to host in — want me to send them over?"`, why: "Sunday morning = hosting. Lead with lifestyle, not square footage.", type: "lifestyle", tag: "Lifestyle" },
      "Total quiet":       { hook: `"You mentioned wanting quiet — I've got a couple of dead-end streets with zero through-traffic. Interested?"`, why: "They value calm over convenience. Don't pitch busy areas.", type: "lifestyle", tag: "Lifestyle" },
      "Outside with kids": { hook: `"There's a place in [neighbourhood] with a huge yard and a park two doors down — thought of you immediately."`, why: "Family & outdoor space is their anchor priority.", type: "lifestyle", tag: "Lifestyle" },
      "Solo, no plans":    { hook: `"One of these homes has a private patio that's basically made for a slow morning and good coffee."`, why: "They value personal retreat space — paint that picture.", type: "lifestyle", tag: "Lifestyle" },
      "Getting out":       { hook: `"How important is walkability to you? A couple of these are five minutes from everything."`, why: "They want to be embedded in the neighbourhood, not just in it.", type: "preference", tag: "Location" },
      "Slow & cozy":       { hook: `"I have a listing with the coziest reading nook — genuinely thought of you when I saw it."`, why: "Emotional, comfort-driven buyer. Sell feeling, not specs.", type: "lifestyle", tag: "Lifestyle" },
    };
    const match = map[answers.sundayMorning];
    if (match) starters.push(match);
  }

  if (answers.tradeoffQuietVsEnergy === "Quiet & calm") {
    starters.push({ hook: `"I'm ruling out anything near a main road for you — even if the price looks good, it won't feel right."`, why: "Proactively filtering for them builds massive trust.", type: "preference", tag: "Neighbourhood" });
  } else if (answers.tradeoffQuietVsEnergy === "Buzz & energy") {
    starters.push({ hook: `"Are you open to [urban area]? Walkable, busy, great vibe — sounds like your speed."`, why: "Energy seekers respond to lifestyle descriptions, not location stats.", type: "preference", tag: "Neighbourhood" });
  }

  if (answers.tradeoffNewVsCharacter === "Character home") {
    starters.push({ hook: `"Any interest in older homes with original details? Hardwood, crown moulding, that kind of character?"`, why: "Character buyers often can't find what they want on MLS — be the one who knows where to look.", type: "preference", tag: "Property Type" });
  } else if (answers.tradeoffNewVsCharacter === "New build") {
    starters.push({ hook: `"Are you open to new builds or pre-construction? A few solid options are coming up soon."`, why: "New build buyers often want to customise. Get ahead of inventory.", type: "preference", tag: "Property Type" });
  }

  if (answers.tradeoffPrivacyVsWalkability === "Privacy") {
    starters.push({ hook: `"You mentioned privacy matters — I'm looking at homes with good setbacks and tree cover. Anything specific that matters most?"`, why: "Privacy buyers often have a specific need. Draw it out early.", type: "preference", tag: "Must-Have" });
  }

  if (answers.preApprovalStatus === "Not yet" || answers.preApprovalStatus === "In progress") {
    starters.push({ hook: `"Have you connected with a mortgage broker yet? Happy to make an intro — it makes your offer much stronger."`, why: "Helping with financing = becoming indispensable before they even see a home.", type: "financing", tag: "Financing" });
  }

  if (answers.mustHaves && answers.mustHaves.length > 0) {
    starters.push({ hook: `"You flagged ${answers.mustHaves.slice(0, 2).join(" and ")} as non-negotiables — I'm holding firm on those. Sound right?"`, why: "Repeating their must-haves back shows you read their profile. Rare. Memorable.", type: "musthave", tag: "Must-Haves" });
  }

  if (answers.additionalNotes) {
    starters.push({ hook: `"You mentioned: '${answers.additionalNotes.slice(0, 80)}${answers.additionalNotes.length > 80 ? "…" : ""}' — tell me more about that."`, why: "They took time to write this. Referencing it signals you paid attention.", type: "notes", tag: "Their Words" });
  }

  return starters.slice(0, 4);
}

// ─── Copyable Starter Card ────────────────────────────────────────────────────

function StarterCard({ starter }: { starter: Starter }) {
  const [copied, setCopied] = useState(false);
  const style = TYPE_STYLES[starter.type];

  function copy() {
    const raw = starter.hook.replace(/^"|"$/g, "");
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      onClick={copy}
      className={`group relative border rounded-2xl p-4 cursor-pointer transition-all duration-150 hover:shadow-md active:scale-[0.99] ${style.bg} ${style.border}`}
    >
      {/* Colored left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${style.accent} opacity-60`} />

      <div className="pl-3">
        {/* Type tag */}
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2.5 ${style.tag} ${style.tagText}`}>
          {style.icon}
          {starter.tag}
        </span>

        {/* The hook */}
        <p className="text-sm font-semibold text-[#2c2825] leading-snug mb-2">{starter.hook}</p>

        {/* Why it works */}
        <p className="text-[11px] text-[#8c8580] leading-relaxed">{starter.why}</p>

        {/* Copy button */}
        <div className="flex justify-end mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); copy(); }}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all ${
              copied
                ? "bg-emerald-500 text-white"
                : `${style.tag} ${style.tagText} opacity-80 group-hover:opacity-100`
            }`}
          >
            {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy message</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tradeoff row ─────────────────────────────────────────────────────────────

function TradeoffRow({ left, right, value }: { left: string; right: string; value: string }) {
  const isLeft = value === left;
  const isRight = value === right;
  const position = isLeft ? 0 : isRight ? 100 : 50;

  return (
    <div className="flex items-center gap-3 py-1">
      <span className={`text-xs w-28 text-right shrink-0 leading-tight ${isLeft ? "text-[#2c2825] font-semibold" : "text-[#c8c4c0]"}`}>{left}</span>
      <div className="flex-1 h-1.5 bg-[#f0ece6] rounded-full relative">
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all ${isLeft || isRight ? "bg-[#2c2825]" : "bg-[#b8a88a]"}`}
          style={{ left: `calc(${position}% - 8px)` }}
        />
      </div>
      <span className={`text-xs w-28 shrink-0 leading-tight ${isRight ? "text-[#2c2825] font-semibold" : "text-[#c8c4c0]"}`}>{right}</span>
    </div>
  );
}

// ─── Pre-approval config ──────────────────────────────────────────────────────

const APPROVAL_CONFIG: Record<string, { label: string; dot: string; color: string; bg: string; border: string }> = {
  "Yes, fully approved": { label: "Pre-approved ✓",            dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  "Paying cash":         { label: "Cash buyer",                dot: "#eab308", color: "#a16207", bg: "#fefce8", border: "#fef08a" },
  "In progress":         { label: "Pre-approval in progress",  dot: "#f97316", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  "Not yet":             { label: "No pre-approval yet",       dot: "#d1cdc8", color: "#8c8580", bg: "#faf9f7", border: "#e8e4de" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BuyerBrief({ lead }: { lead: Lead }) {
  const { answers } = lead;
  const starters = getConversationStarters(lead);
  const approval = answers.preApprovalStatus ? APPROVAL_CONFIG[answers.preApprovalStatus] : null;

  const hasTradeoffs =
    answers.tradeoffSpaceVsLocation ||
    answers.tradeoffPrivacyVsWalkability ||
    answers.tradeoffOutdoorVsInterior ||
    answers.tradeoffQuietVsEnergy ||
    answers.tradeoffNewVsCharacter;

  // Derive availability hints from questionnaire answers
  const availabilityHints: string[] = [];
  if (answers.sundayMorning === "Total quiet" || answers.sundayMorning === "Slow & cozy") {
    availabilityHints.push("Prefers weekday showings");
  } else if (answers.sundayMorning === "Getting out" || answers.sundayMorning === "Outside with kids") {
    availabilityHints.push("Flexible — weekends work");
  } else if (answers.sundayMorning === "Hosting people" || answers.sundayMorning === "Solo, no plans") {
    availabilityHints.push("Weekends likely busy — book ahead");
  }
  if (answers.timeline === "ASAP" || answers.timeline === "1–3 months") {
    availabilityHints.push("Urgently available");
  } else if (answers.timeline === "3–6 months") {
    availabilityHints.push("Flexible timeline");
  } else if (answers.timeline === "6–12 months" || answers.timeline === "Just exploring") {
    availabilityHints.push("No rush — schedule when ready");
  }
  if (availabilityHints.length === 0) availabilityHints.push("Contact to confirm availability");

  return (
    <div className="space-y-4">

      {/* ── Buyer snapshot grid — neutral ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <Home size={12} className="text-[#b8a88a]" />, label: "Property", value: answers.propertyType ? `${answers.bedrooms ? `${answers.bedrooms}-bed ` : ""}${answers.propertyType}` : null },
          { icon: <MapPin size={12} className="text-[#b8a88a]" />, label: "Location", value: answers.preferredCity || null },
          { icon: <DollarSign size={12} className="text-[#b8a88a]" />, label: "Budget", value: (answers.budgetMin > 0 || answers.budgetMax > 0) ? `${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}` : null },
          { icon: <Clock size={12} className="text-[#b8a88a]" />, label: "Timeline", value: answers.timeline || null },
        ].filter(s => s.value).map((s) => (
          <div key={s.label} className="bg-white border border-[#e8e4de] rounded-xl p-3 flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">{s.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#b8a88a] mb-0.5">{s.label}</p>
              <p className="text-xs font-semibold text-[#2c2825] leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pre-approval pill */}
      {approval && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ background: approval.bg, borderColor: approval.border }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: approval.dot }} />
          <span className="text-xs font-medium" style={{ color: approval.color }}>{approval.label}</span>
        </div>
      )}

      {/* ── Showing Availability ──────────────────────────────────────────────── */}
      <div style={{ background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: "12px", padding: "14px 16px" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <Star size={12} style={{ color: "#7c3aed" }} />
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6d28d9" }}>Showing Availability</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availabilityHints.map((h) => (
            <span key={h} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#c4b5fd", color: "#3b0764" }}>{h}</span>
          ))}
          {["Morning", "Afternoon", "Evening"].map((slot) => (
            <span key={slot} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "white", color: "#7c3aed", border: "1px solid #c4b5fd" }}>{slot}</span>
          ))}
        </div>
      </div>

      {/* ── Must-haves + Deal-breakers ────────────────────────────────────────── */}
      {(answers.mustHaves?.length > 0 || answers.dealBreakers?.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {answers.mustHaves?.length > 0 && (
            <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "16px", padding: "16px" }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <ShieldCheck size={12} style={{ color: "#059669" }} />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#065f46" }}>Must Have</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {answers.mustHaves.map((item) => (
                  <span key={item} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#6ee7b7", color: "#064e3b" }}>
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {answers.dealBreakers?.length > 0 && (
            <div style={{ background: "#ffe4e6", border: "1px solid #fda4af", borderRadius: "16px", padding: "16px" }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <XIcon size={12} style={{ color: "#e11d48" }} />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9f1239" }}>Deal Breakers</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {answers.dealBreakers.map((item) => (
                  <span key={item} className="text-[11px] font-semibold px-2.5 py-1 rounded-full line-through" style={{ background: "#fda4af", color: "#881337", textDecorationColor: "#e11d48" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Their World - personality ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#e0dbd4] overflow-hidden" style={{ background: "linear-gradient(145deg,#faf8f5 0%,#f2ede5 100%)" }}>
        <div className="px-5 pt-4 pb-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-3">Their World</p>
          {answers.homeFeeling.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {answers.homeFeeling.map((f) => (
                <span key={f} className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-white text-[#2c2825] shadow-sm border border-white/60">
                  {f}
                </span>
              ))}
            </div>
          )}
          {answers.sundayMorning && (
            <div className="mb-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-1.5">Sunday morning</p>
              <p className="text-lg font-semibold text-[#2c2825] leading-snug">&ldquo;{answers.sundayMorning}&rdquo;</p>
            </div>
          )}
          {answers.modernVsCozy && (
            <p className="text-xs text-[#8c8580] mt-2">Aesthetic: <span className="text-[#2c2825] font-semibold">{answers.modernVsCozy}</span></p>
          )}
        </div>
      </div>

      {/* ── Open with this - interactive starters ─────────────────────────────── */}
      {starters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-[#b8a88a]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8a88a]">Open With This</p>
            <span className="text-[10px] text-[#b8b4b0] font-normal">· tap any card to copy</span>
          </div>
          <div className="space-y-2.5">
            {starters.map((s, i) => <StarterCard key={i} starter={s} />)}
          </div>
        </div>
      )}

      {/* ── How They Think - tradeoffs ────────────────────────────────────────── */}
      {hasTradeoffs && (
        <div className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-4">How They Think</p>
          <div className="space-y-3">
            {answers.tradeoffQuietVsEnergy      && <TradeoffRow left="Quiet & calm"    right="Buzz & energy"      value={answers.tradeoffQuietVsEnergy} />}
            {answers.tradeoffPrivacyVsWalkability && <TradeoffRow left="Privacy"          right="Walkability"         value={answers.tradeoffPrivacyVsWalkability} />}
            {answers.tradeoffSpaceVsLocation    && <TradeoffRow left="More space"       right="Better location"    value={answers.tradeoffSpaceVsLocation} />}
            {answers.tradeoffOutdoorVsInterior  && <TradeoffRow left="Outdoor space"    right="Interior finishes"  value={answers.tradeoffOutdoorVsInterior} />}
            {answers.tradeoffNewVsCharacter     && <TradeoffRow left="New build"        right="Character home"     value={answers.tradeoffNewVsCharacter} />}
          </div>
        </div>
      )}

      {/* ── In their own words ───────────────────────────────────────────────── */}
      {answers.additionalNotes && (
        <div className="rounded-2xl px-5 py-4 border border-[#e0dbd4]" style={{ background: "linear-gradient(145deg,#faf8f5 0%,#f2ede5 100%)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare size={12} className="text-[#b8a88a]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a]">In Their Own Words</p>
          </div>
          <p className="text-sm text-[#2c2825] leading-relaxed italic">&ldquo;{answers.additionalNotes}&rdquo;</p>
        </div>
      )}

    </div>
  );
}
