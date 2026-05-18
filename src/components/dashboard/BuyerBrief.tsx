"use client";

import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

// ─── Conversation starters ────────────────────────────────────────────────────

function getConversationStarters(lead: Lead): { hook: string; why: string }[] {
  const { answers } = lead;
  const starters: { hook: string; why: string }[] = [];

  if (answers.sundayMorning) {
    const map: Record<string, { hook: string; why: string }> = {
      "Hosting people":    { hook: `"I pulled a few homes with open-plan living you'd love to host in - want me to send them over?"`, why: "Sunday morning = hosting. Lead with that." },
      "Total quiet":       { hook: `"You mentioned wanting quiet - I've got a couple of dead-end streets with zero through-traffic. Interested?"`, why: "They value calm over convenience. Don't pitch busy areas." },
      "Outside with kids": { hook: `"There's a place in [neighbourhood] with a huge yard and a park two doors down - thinking of you immediately."`, why: "Family & outdoor space is their anchor priority." },
      "Solo, no plans":    { hook: `"One of these homes has a private patio that's basically made for a slow morning and good coffee."`, why: "They value personal retreat space - paint that picture." },
      "Getting out":       { hook: `"How important is walkability to you? A couple of these are five minutes from everything."`, why: "They want to be embedded in the neighbourhood, not just in it." },
      "Slow & cozy":       { hook: `"I have a listing with the coziest reading nook - genuinely thought of you when I saw it."`, why: "Emotional, comfort-driven buyer. Sell feeling, not square footage." },
    };
    const match = map[answers.sundayMorning];
    if (match) starters.push(match);
  }

  if (answers.tradeoffQuietVsEnergy === "Quiet & calm") {
    starters.push({
      hook: `"I'm ruling out anything near a main road for you - even if the price looks good, it won't feel right."`,
      why: "They explicitly chose quiet over energy. Proactively filtering builds massive trust.",
    });
  } else if (answers.tradeoffQuietVsEnergy === "Buzz & energy") {
    starters.push({
      hook: `"Are you open to [urban area]? It's got a lot happening - walkable, busy, great vibe."`,
      why: "Energy seekers respond to lifestyle descriptions, not just location stats.",
    });
  }

  if (answers.tradeoffNewVsCharacter === "Character home") {
    starters.push({
      hook: `"Any interest in older homes with original details? Hardwood, crown moulding, that kind of character?"`,
      why: "Character buyers often don't find what they want on MLS - position yourself as the one who knows where to look.",
    });
  } else if (answers.tradeoffNewVsCharacter === "New build") {
    starters.push({
      hook: `"Are you open to new builds or pre-construction? A few solid options are coming up soon."`,
      why: "New build buyers often want to customise. Get ahead of inventory.",
    });
  }

  if (answers.tradeoffPrivacyVsWalkability === "Privacy") {
    starters.push({
      hook: `"You mentioned privacy matters - I'm looking at homes with good setbacks and tree cover. Anything in particular that matters most?"`,
      why: "Privacy buyers often have a specific need (backyard, no overlooking neighbours). Draw it out.",
    });
  }

  if (answers.preApprovalStatus === "Not yet" || answers.preApprovalStatus === "In progress") {
    starters.push({
      hook: `"Have you had a chance to connect with a mortgage broker? Happy to make an intro - it makes your offer much stronger."`,
      why: "Helping with financing = becoming indispensable before they even see a home.",
    });
  }

  if (answers.mustHaves && answers.mustHaves.length > 0) {
    starters.push({
      hook: `"You flagged [${answers.mustHaves.slice(0, 2).join(", ")}] as non-negotiables - I'm holding firm on those. Sound right?"`,
      why: "Repeating their must-haves back shows you actually read their profile. Rare. Memorable.",
    });
  }

  if (answers.additionalNotes) {
    starters.push({
      hook: `"You mentioned: '${answers.additionalNotes.slice(0, 80)}${answers.additionalNotes.length > 80 ? "..." : ""}' - tell me more about that."`,
      why: "They took time to write this. Referencing it signals you paid attention.",
    });
  }

  return starters.slice(0, 3);
}

// ─── Tradeoff bar ─────────────────────────────────────────────────────────────

function TradeoffBar({ left, right, value }: { left: string; right: string; value: string }) {
  const position = value === left ? 0 : value === right ? 100 : 50;
  const isLeft = position === 0;
  const isRight = position === 100;
  const isSplit = position === 50;

  return (
    <div className="flex items-center gap-3">
      <p className={`text-xs w-24 text-right shrink-0 leading-tight ${isLeft ? "text-[#2c2825] font-semibold" : "text-[#c8c4c0]"}`}>{left}</p>
      <div className="flex-1 h-1 bg-[#f0ece6] rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow"
          style={{ left: `calc(${position}% - 7px)`, background: isSplit ? "#b8a88a" : "#2c2825" }}
        />
      </div>
      <p className={`text-xs w-24 shrink-0 leading-tight ${isRight ? "text-[#2c2825] font-semibold" : "text-[#c8c4c0]"}`}>{right}</p>
    </div>
  );
}

// ─── Pre-approval config ──────────────────────────────────────────────────────

const APPROVAL_CONFIG: Record<string, { label: string; dot: string; color: string; bg: string; border: string }> = {
  "Yes, fully approved": { label: "Pre-approved",           dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  "Paying cash":         { label: "Cash buyer",             dot: "#eab308", color: "#a16207", bg: "#fefce8", border: "#fef08a" },
  "In progress":         { label: "Pre-approval in progress", dot: "#f97316", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  "Not yet":             { label: "No pre-approval yet",    dot: "#d1cdc8", color: "#8c8580", bg: "#faf9f7", border: "#e8e4de" },
};

// ─── Component ────────────────────────────────────────────────────────────────

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

  return (
    <div className="space-y-4">

      {/* ── Essentials strip ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-3">The Essentials</p>

        {/* Key facts as a flowing sentence */}
        <p className="text-sm text-[#2c2825] leading-relaxed">
          {answers.propertyType && (
            <span className="font-semibold">{answers.bedrooms ? `${answers.bedrooms}-bed ${answers.propertyType}` : answers.propertyType}</span>
          )}
          {answers.preferredCity && (
            <span> in <span className="font-semibold">{answers.preferredCity}</span></span>
          )}
          {(answers.budgetMin > 0 || answers.budgetMax > 0) && (
            <span className="text-[#5c5550]">, {formatCurrency(answers.budgetMin)}<span className="mx-0.5 text-[#b8a88a]">–</span>{formatCurrency(answers.budgetMax)}</span>
          )}
          {answers.timeline && (
            <span className="text-[#5c5550]">, {answers.timeline}</span>
          )}
        </p>

        {/* Pre-approval pill */}
        {approval && (
          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border"
            style={{ background: approval.bg, borderColor: approval.border }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: approval.dot }} />
            <span className="text-xs font-medium" style={{ color: approval.color }}>{approval.label}</span>
          </div>
        )}
      </div>

      {/* ── Their World - personality hero card ──────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden border border-[#e0dbd4]"
        style={{ background: "linear-gradient(145deg, #faf8f5 0%, #f2ede5 100%)" }}
      >
        <div className="px-5 pt-5 pb-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-4">Their World</p>

          {/* Home feeling chips - prominent */}
          {answers.homeFeeling.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {answers.homeFeeling.map((f) => (
                <span
                  key={f}
                  className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-white text-[#2c2825] shadow-sm border border-white/60"
                  style={{ boxShadow: "0 1px 4px rgba(44,40,37,0.08)" }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Sunday morning - the hero quote */}
          {answers.sundayMorning && (
            <div className="mb-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-2">Their Sunday morning looks like</p>
              <p className="text-[1.35rem] font-semibold text-[#2c2825] leading-snug tracking-tight">
                &ldquo;{answers.sundayMorning}&rdquo;
              </p>
            </div>
          )}

          {/* Aesthetic - quiet line */}
          {answers.modernVsCozy && (
            <p className="text-xs text-[#8c8580] mt-3">
              Aesthetic preference: <span className="text-[#2c2825] font-semibold">{answers.modernVsCozy}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Open with this - conversation starters ───────────────────────────── */}
      {starters.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-2.5 px-0.5">Open with this</p>
          <div className="space-y-2">
            {starters.map((s, i) => (
              <div
                key={i}
                className="group bg-white border border-[#e8e4de] rounded-2xl px-4 py-3.5 hover:border-[#2c2825] hover:shadow-md transition-all duration-200 cursor-default"
                style={{ transitionProperty: "border-color, box-shadow, transform" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[#2c2825] font-medium leading-snug flex-1">{s.hook}</p>
                  <ArrowRight
                    size={14}
                    className="text-[#d8d4ce] group-hover:text-[#2c2825] group-hover:translate-x-0.5 shrink-0 mt-0.5 transition-all duration-200"
                  />
                </div>
                <p className="text-[11px] text-[#8c8580] mt-1.5 leading-relaxed">{s.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── How They Think - tradeoffs ───────────────────────────────────────── */}
      {hasTradeoffs && (
        <div className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-4">How They Think</p>
          <div className="space-y-4">
            {answers.tradeoffQuietVsEnergy && (
              <TradeoffBar left="Quiet & calm" right="Buzz & energy" value={answers.tradeoffQuietVsEnergy} />
            )}
            {answers.tradeoffPrivacyVsWalkability && (
              <TradeoffBar left="Privacy" right="Walkability" value={answers.tradeoffPrivacyVsWalkability} />
            )}
            {answers.tradeoffSpaceVsLocation && (
              <TradeoffBar left="More space" right="Better location" value={answers.tradeoffSpaceVsLocation} />
            )}
            {answers.tradeoffOutdoorVsInterior && (
              <TradeoffBar left="Outdoor space" right="Interior finishes" value={answers.tradeoffOutdoorVsInterior} />
            )}
            {answers.tradeoffNewVsCharacter && (
              <TradeoffBar left="New build" right="Character home" value={answers.tradeoffNewVsCharacter} />
            )}
          </div>
        </div>
      )}

      {/* ── Non-negotiables & deal-breakers ─────────────────────────────────── */}
      {(answers.mustHaves?.length > 0 || answers.dealBreakers?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {answers.mustHaves?.length > 0 && (
            <div className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600 mb-3">Must Have</p>
              <div className="flex flex-wrap gap-1.5">
                {answers.mustHaves.map((item) => (
                  <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {answers.dealBreakers?.length > 0 && (
            <div className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rose-500 mb-3">Deal Breakers</p>
              <div className="flex flex-wrap gap-1.5">
                {answers.dealBreakers.map((item) => (
                  <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── In their own words ───────────────────────────────────────────────── */}
      {answers.additionalNotes && (
        <div
          className="rounded-2xl px-5 py-4 border border-[#e0dbd4]"
          style={{ background: "linear-gradient(145deg, #faf8f5 0%, #f2ede5 100%)" }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8a88a] mb-2">In Their Own Words</p>
          <p className="text-sm text-[#2c2825] leading-relaxed italic">
            &ldquo;{answers.additionalNotes}&rdquo;
          </p>
        </div>
      )}

    </div>
  );
}
