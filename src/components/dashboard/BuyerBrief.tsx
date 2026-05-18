"use client";

import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Phone, Mail, MessageSquare, Clock, Zap, Home, MapPin, DollarSign, Calendar } from "lucide-react";

// ─── Playbook ─────────────────────────────────────────────────────────────────

type Playbook = { icon: React.ReactNode; action: string; color: string; bg: string; border: string; detail: string };

function getPlaybook(lead: Lead): Playbook {
  const { answers, score } = lead;
  const isFinanced = answers.preApprovalStatus === "Yes, fully approved" || answers.preApprovalStatus === "Paying cash";
  const isASAP = answers.timeline === "ASAP" || answers.timeline === "1–3 months";

  if (score === "Hot" && isASAP && isFinanced) return {
    icon: <Phone size={13} />,
    action: "Call within 2 hours",
    color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
    detail: "Pre-approved, buying ASAP — window is narrow.",
  };
  if (score === "Hot") return {
    icon: <Mail size={13} />,
    action: "Email today, call tomorrow",
    color: "#d97706", bg: "#fffbeb", border: "#fde68a",
    detail: "High intent. First response sets the relationship.",
  };
  if (score === "Warm") return {
    icon: <MessageSquare size={13} />,
    action: "Email now, follow up in 5 days",
    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
    detail: "Engaged but not urgent. Build the relationship.",
  };
  return {
    icon: <Clock size={13} />,
    action: "Monthly touch — no rush",
    color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb",
    detail: "Early stage. Stay top of mind, don't push.",
  };
}

// ─── Conversation starters ────────────────────────────────────────────────────

function getConversationStarters(lead: Lead): { hook: string; why: string }[] {
  const { answers } = lead;
  const starters: { hook: string; why: string }[] = [];

  // Vibe-based openers
  if (answers.sundayMorning) {
    const map: Record<string, { hook: string; why: string }> = {
      "Hosting people":    { hook: `"I pulled a few homes with open-plan living you'd love to host in — want me to send them over?"`, why: "Sunday morning = hosting. Lead with that." },
      "Total quiet":       { hook: `"You mentioned wanting quiet — I've got a couple of dead-end streets with zero through-traffic. Interested?"`, why: "They value calm over convenience. Don't pitch busy areas." },
      "Outside with kids": { hook: `"There's a place in [neighbourhood] with a huge yard and a park two doors down — thinking of you immediately."`, why: "Family & outdoor space is their anchor priority." },
      "Solo, no plans":    { hook: `"One of these homes has a private patio that's basically made for a slow morning and good coffee."`, why: "They value personal retreat space — paint that picture." },
      "Getting out":       { hook: `"How important is walkability to you? A couple of these are five minutes from everything."`, why: "They want to be embedded in the neighbourhood, not just in it." },
      "Slow & cozy":       { hook: `"I have a listing with the coziest reading nook — genuinely thought of you when I saw it."`, why: "Emotional, comfort-driven buyer. Sell feeling, not square footage." },
    };
    const match = map[answers.sundayMorning];
    if (match) starters.push(match);
  }

  // Tradeoff-based insight
  if (answers.tradeoffQuietVsEnergy === "Quiet & calm") {
    starters.push({
      hook: `"I'm ruling out anything near a main road for you — even if the price looks good, it won't feel right."`,
      why: "They explicitly chose quiet over energy. Proactively filtering builds massive trust.",
    });
  } else if (answers.tradeoffQuietVsEnergy === "Buzz & energy") {
    starters.push({
      hook: `"Are you open to [urban area]? It's got a lot happening — walkable, busy, great vibe."`,
      why: "Energy seekers respond to lifestyle descriptions, not just location stats.",
    });
  }

  if (answers.tradeoffNewVsCharacter === "Character home") {
    starters.push({
      hook: `"Any interest in older homes with original details? Hardwood, crown moulding, that kind of character?"`,
      why: "Character buyers often don't find what they want on MLS — position yourself as the one who knows where to look.",
    });
  } else if (answers.tradeoffNewVsCharacter === "New build") {
    starters.push({
      hook: `"Are you open to new builds or pre-construction? A few solid options are coming up soon."`,
      why: "New build buyers often want to customise. Get ahead of inventory.",
    });
  }

  if (answers.tradeoffPrivacyVsWalkability === "Privacy") {
    starters.push({
      hook: `"You mentioned privacy matters — I'm looking at homes with good setbacks and tree cover. Anything in particular that matters most?"`,
      why: "Privacy buyers often have a specific need (backyard, no overlooking neighbours). Draw it out.",
    });
  }

  // Budget / pre-approval
  if (answers.preApprovalStatus === "Not yet" || answers.preApprovalStatus === "In progress") {
    starters.push({
      hook: `"Have you had a chance to connect with a mortgage broker? Happy to make an intro — it makes your offer much stronger."`,
      why: "Helping with financing = becoming indispensable before they even see a home.",
    });
  }

  // Must-haves hook
  if (answers.mustHaves && answers.mustHaves.length > 0) {
    starters.push({
      hook: `"You flagged [${answers.mustHaves.slice(0, 2).join(", ")}] as non-negotiables — I'm holding firm on those. Sound right?"`,
      why: "Repeating their must-haves back shows you actually read their profile. Rare. Memorable.",
    });
  }

  // Notes
  if (answers.additionalNotes) {
    starters.push({
      hook: `"You mentioned: '${answers.additionalNotes.slice(0, 80)}${answers.additionalNotes.length > 80 ? "…" : ""}' — tell me more about that."`,
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
      <p className={`text-xs w-28 text-right shrink-0 ${isLeft ? "text-[#2c2825] font-semibold" : "text-[#b8b4b0]"}`}>{left}</p>
      <div className="flex-1 h-1.5 bg-[#f0ece6] rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
          style={{
            left: `calc(${position}% - 6px)`,
            background: isSplit ? "#b8a88a" : "#2c2825",
          }}
        />
      </div>
      <p className={`text-xs w-28 shrink-0 ${isRight ? "text-[#2c2825] font-semibold" : "text-[#b8b4b0]"}`}>{right}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuyerBrief({ lead }: { lead: Lead }) {
  const { answers, score, matchScore } = lead;
  const pb = getPlaybook(lead);
  const starters = getConversationStarters(lead);

  const hasTradeoffs =
    answers.tradeoffSpaceVsLocation ||
    answers.tradeoffPrivacyVsWalkability ||
    answers.tradeoffOutdoorVsInterior ||
    answers.tradeoffQuietVsEnergy ||
    answers.tradeoffNewVsCharacter;

  return (
    <div className="space-y-4">

      {/* At a glance — 4 stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <DollarSign size={13} />, label: "Budget", value: `${formatCurrency(answers.budgetMin)}–${formatCurrency(answers.budgetMax)}` },
          { icon: <Calendar size={13} />, label: "Timeline", value: answers.timeline || "—" },
          { icon: <MapPin size={13} />, label: "Location", value: answers.preferredCity || "—" },
          { icon: <Home size={13} />, label: "Property", value: answers.propertyType ? `${answers.propertyType} · ${answers.bedrooms}bd` : "—" },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white border border-[#e8e4de] rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 text-[#8c8580] mb-1">
              {icon}
              <p className="text-[10px] uppercase tracking-wider font-medium">{label}</p>
            </div>
            <p className="text-sm font-semibold text-[#2c2825] leading-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Vibe snapshot */}
      <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
        <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium mb-4">Their Vibe</p>
        <div className="space-y-3">
          {answers.homeFeeling.length > 0 && (
            <div>
              <p className="text-[10px] text-[#b8b4b0] uppercase tracking-wider mb-2">Home should feel</p>
              <div className="flex flex-wrap gap-1.5">
                {answers.homeFeeling.map((f) => (
                  <span key={f} className="text-xs px-3 py-1 rounded-full bg-[#f5f3f0] text-[#2c2825] border border-[#e8e4de] font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {answers.sundayMorning && (
            <div className="flex items-center gap-2 pt-1">
              <p className="text-[10px] text-[#b8b4b0] uppercase tracking-wider w-28 shrink-0">Sunday morning</p>
              <span className="text-xs px-3 py-1 rounded-full bg-[#1a1512] text-white font-medium">
                {answers.sundayMorning}
              </span>
            </div>
          )}
          {answers.modernVsCozy && (
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-[#b8b4b0] uppercase tracking-wider w-28 shrink-0">Aesthetic</p>
              <span className="text-xs px-3 py-1 rounded-full bg-[#f5f3f0] text-[#2c2825] border border-[#e8e4de] font-medium">
                {answers.modernVsCozy}
              </span>
            </div>
          )}
          {answers.preApprovalStatus && (
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-[#b8b4b0] uppercase tracking-wider w-28 shrink-0">Pre-approval</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                answers.preApprovalStatus === "Yes, fully approved" || answers.preApprovalStatus === "Paying cash"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : answers.preApprovalStatus === "In progress"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-[#f5f3f0] text-[#8c8580] border-[#e8e4de]"
              }`}>
                {answers.preApprovalStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tradeoffs */}
      {hasTradeoffs && (
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
          <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium mb-4">How They Think</p>
          <div className="space-y-3">
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

      {/* Conversation starters */}
      {starters.length > 0 && (
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#b8a88a]" />
            <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium">Conversation Starters</p>
          </div>
          <div className="space-y-4">
            {starters.map((s, i) => (
              <div key={i} className="pl-4 border-l-2 border-[#e8e4de]">
                <p className="text-sm text-[#2c2825] font-medium leading-snug mb-1">{s.hook}</p>
                <p className="text-xs text-[#8c8580] leading-relaxed">{s.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Must-haves & deal-breakers */}
      {(answers.mustHaves?.length > 0 || answers.dealBreakers?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {answers.mustHaves?.length > 0 && (
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
              <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium mb-3">Non-Negotiables</p>
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
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
              <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium mb-3">Deal Breakers</p>
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

      {/* Buyer notes */}
      {answers.additionalNotes && (
        <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-2xl p-5">
          <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium mb-2">In Their Own Words</p>
          <p className="text-[#2c2825] text-sm leading-relaxed italic">&ldquo;{answers.additionalNotes}&rdquo;</p>
        </div>
      )}

    </div>
  );
}
