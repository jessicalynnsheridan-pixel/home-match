"use client";

import { BuyingTimeline } from "@/types";
import { StepProps } from "./shared";

const BUDGET_RANGES = [
  { label: "Under $500K",    sub: "Starter or condo",         min: 200000,  max: 500000  },
  { label: "$500K – $750K",  sub: "Solid starter homes",      min: 500000,  max: 750000  },
  { label: "$750K – $1M",    sub: "Mid-range detached",       min: 750000,  max: 1000000 },
  { label: "$1M – $1.5M",    sub: "Premium neighbourhoods",   min: 1000000, max: 1500000 },
  { label: "$1.5M – $2.5M",  sub: "Luxury segment",          min: 1500000, max: 2500000 },
  { label: "$2.5M+",         sub: "Ultra-premium",            min: 2500000, max: 5000000 },
];

const TIMELINES: { value: BuyingTimeline; emoji: string; sub: string }[] = [
  { value: "ASAP",           emoji: "🔥", sub: "I'm actively searching now" },
  { value: "1-3 months",     emoji: "⚡", sub: "Getting serious soon" },
  { value: "3-6 months",     emoji: "📅", sub: "Doing my research" },
  { value: "6-12 months",    emoji: "🌱", sub: "Planning ahead" },
  { value: "Just exploring", emoji: "🧭", sub: "No pressure, just curious" },
];

export default function StepTimeline({ answers, update, onNext }: StepProps) {
  function pickTimeline(value: BuyingTimeline) {
    update("timeline", value);
    setTimeout(onNext, 1400);
  }

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-[#2c2825]">When does this happen</span><br />
          <span className="text-gradient-gold">for you?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">This shapes which homes we surface for you.</p>
      </div>

      {/* Timeline tiles */}
      <div className="space-y-2.5 mb-10">
        {TIMELINES.map((t) => {
          const selected = answers.timeline === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => pickTimeline(t.value)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-150 btn-press"
              style={{
                background: selected
                  ? "linear-gradient(135deg, #b8956a 0%, #8a6840 100%)"
                  : "#ffffff",
                border: selected
                  ? "2px solid rgba(184,168,138,0.7)"
                  : "2px solid #e0dbd4",
                boxShadow: selected ? "0 6px 24px rgba(184,168,138,0.20)" : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <span className="text-2xl shrink-0">{t.emoji}</span>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${selected ? "text-white" : "text-[#2c2825]"}`}>{t.value}</p>
                <p className={`text-xs mt-0.5 ${selected ? "text-white/75" : "text-[#8c8580]"}`}>{t.sub}</p>
              </div>
              {selected && (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-scale-in">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Budget */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "#ffffff", border: "1px solid #e0dbd4", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p className="text-sm font-semibold text-[#2c2825] mb-1">What&apos;s your budget range?</p>
        <p className="text-[#8c8580] text-xs mb-5">Pick the range that feels right. No need to have the exact number.</p>
        <div className="grid grid-cols-2 gap-2.5">
          {BUDGET_RANGES.map((b) => {
            const selected = answers.budgetMin === b.min && answers.budgetMax === b.max;
            return (
              <button
                key={b.label}
                type="button"
                onClick={() => { update("budgetMin", b.min); update("budgetMax", b.max); }}
                className="flex flex-col items-start px-4 py-3.5 rounded-xl text-left transition-all btn-press"
                style={{
                  background: selected ? "linear-gradient(135deg, #b8956a 0%, #8a6840 100%)" : "#faf9f7",
                  border: selected ? "2px solid rgba(184,168,138,0.7)" : "2px solid #e0dbd4",
                }}
              >
                <span className="text-base font-bold" style={{ color: selected ? "#fff" : "#2c2825" }}>{b.label}</span>
                <span className="text-xs mt-0.5" style={{ color: selected ? "rgba(255,255,255,0.75)" : "#8c8580" }}>{b.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-6 flex items-center justify-center">
        {answers.timeline && (
          <p className="text-[#b8b4b0] text-xs animate-fade-in">Moving on in a moment...</p>
        )}
      </div>
    </div>
  );
}
