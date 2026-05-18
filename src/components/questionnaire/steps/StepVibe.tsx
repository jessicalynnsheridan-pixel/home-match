"use client";

import { useState } from "react";
import { StepProps } from "./shared";
import { ArrowRight } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const HOME_FEELINGS = [
  { label: "Peaceful retreat",      emoji: "🌿", bg: "#4a7c59" },
  { label: "Social hub",            emoji: "🥂", bg: "#c87941" },
  { label: "Creative sanctuary",    emoji: "🎨", bg: "#4a6f9c" },
  { label: "Family nest",           emoji: "🏡", bg: "#b89040" },
  { label: "Modern haven",          emoji: "✨", bg: "#4a4540" },
  { label: "Adventure base",        emoji: "🌲", bg: "#3d6b4a" },
];

const SUNDAY_MOODS = [
  { label: "Coffee in a sunny kitchen",           emoji: "☕" },
  { label: "Hosting brunch in the backyard",      emoji: "🌸" },
  { label: "Reading by a fireplace",              emoji: "📖" },
  { label: "Quiet morning, no neighbours",        emoji: "🌅" },
  { label: "Kids playing while I cook",           emoji: "👨‍👩‍👧" },
];

const STYLE_OPTIONS = [
  { value: "Modern & minimal",  emoji: "🪟", bg: "#5a6268" },
  { value: "Warm & cozy",       emoji: "🕯️", bg: "#b88040" },
  { value: "Classic elegance",  emoji: "🏛️", bg: "#7a6858" },
  { value: "Bold & unique",     emoji: "🎭", bg: "#8c4a3c" },
] as const;

// ─── Sub-components ──────────────────────────────────────────────────────────

function VibeCard({
  emoji, label, bg, selected, onToggle, delay,
}: {
  emoji: string; label: string; bg: string;
  selected: boolean; onToggle: () => void; delay: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative rounded-2xl text-left transition-all duration-200 btn-press animate-fade-up overflow-hidden"
      style={{
        background: bg,
        animationDelay: `${delay}s`,
        minHeight: 192,
        boxShadow: selected
          ? "0 0 0 2.5px rgba(184,168,138,1)"
          : "none",
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div className="relative z-10 p-5 h-full flex flex-col justify-between" style={{ minHeight: 160 }}>
        <span className="text-4xl block">{emoji}</span>
        <p className="font-bold text-base text-white leading-snug mt-4">{label}</p>
      </div>

      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#b8a88a] flex items-center justify-center shadow animate-scale-in">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  );
}

function SundayChip({ emoji, label, selected, onClick }: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-left transition-all duration-150 btn-press ${
        selected
          ? "bg-[#b8a88a] border-[#b8a88a] text-[#1e1a17]"
          : "bg-white border-[#e0dbd4] text-[#2c2825] hover:bg-[#f5f3f0] hover:border-[#d0cbc4]"
      }`}
    >
      <span className="text-xl shrink-0">{emoji}</span>
      <span className="text-sm leading-snug">{label}</span>
    </button>
  );
}

function StyleTile({ value, emoji, bg, selected, onClick, delay }: {
  value: string; emoji: string; bg: string;
  selected: boolean; onClick: () => void; delay: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-xl overflow-hidden text-left transition-all duration-200 btn-press animate-fade-up"
      style={{
        background: bg,
        animationDelay: `${delay}s`,
        minHeight: 110,
        boxShadow: selected
          ? "0 0 0 2.5px rgba(184,168,138,1)"
          : "none",
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div className="relative z-10 p-4 flex flex-col justify-between" style={{ minHeight: 110 }}>
        <span className="text-2xl">{emoji}</span>
        <p className="text-white font-semibold text-xs leading-snug mt-3">{value}</p>
      </div>
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#b8a88a] flex items-center justify-center animate-scale-in">
          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
            <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Step ────────────────────────────────────────────────────────────────────

export default function StepVibe({ answers, update, onNext }: StepProps) {
  const [phase, setPhase] = useState<"feeling" | "sunday" | "style">("feeling");

  function toggleFeeling(label: string) {
    const current = answers.homeFeeling;
    const alreadyHad = current.includes(label);
    const next = alreadyHad ? current.filter((f) => f !== label) : [...current, label];
    update("homeFeeling", next);
    if (!alreadyHad && phase === "feeling") {
      setTimeout(() => setPhase("sunday"), 250);
    }
  }

  const hasFeelings = answers.homeFeeling.length > 0;

  return (
    <div>
      {/* ── Question 1: Core feeling ────────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-[#2c2825]">How should home</span><br />
          <span className="text-gradient-gold">make you feel?</span>
        </h2>
        <p className="text-[#8c8580] text-sm mb-8">
          Tap everything that resonates.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {HOME_FEELINGS.map((item, i) => (
            <VibeCard
              key={item.label}
              {...item}
              selected={answers.homeFeeling.includes(item.label)}
              onToggle={() => toggleFeeling(item.label)}
              delay={i * 0.05}
            />
          ))}
        </div>
      </div>

      {/* ── Question 2: Sunday morning ───────────────────────────────────────── */}
      {phase !== "feeling" && (
        <div className="mb-10 animate-slide-up">
          <h3 className="text-xl font-semibold text-[#2c2825] mb-2">
            Your ideal Sunday morning?
          </h3>
          <p className="text-[#8c8580] text-xs mb-5">Pick the one that&apos;s most you.</p>
          <div className="space-y-2">
            {SUNDAY_MOODS.map((item) => (
              <SundayChip
                key={item.label}
                emoji={item.emoji}
                label={item.label}
                selected={answers.sundayMorning === item.label}
                onClick={() => {
                  const picking = answers.sundayMorning !== item.label;
                  update("sundayMorning", picking ? item.label : "");
                  if (picking && phase === "sunday") {
                    setTimeout(() => setPhase("style"), 250);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Question 3: Aesthetic ────────────────────────────────────────────── */}
      {phase === "style" && (
        <div className="mb-10 animate-slide-up">
          <h3 className="text-xl font-semibold text-[#2c2825] mb-2">
            Your home&apos;s aesthetic?
          </h3>
          <p className="text-[#8c8580] text-xs mb-5">Where does your eye naturally land?</p>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((opt, i) => (
              <StyleTile
                key={opt.value}
                {...opt}
                selected={answers.modernVsCozy === opt.value}
                onClick={() => update("modernVsCozy", opt.value)}
                delay={i * 0.05}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Continue ─────────────────────────────────────────────────────────── */}
      {hasFeelings && (
        <div className="animate-fade-up">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 text-[#1a1512] font-semibold text-sm py-4 rounded-2xl transition-all btn-press"
            style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 32px rgba(201,168,112,0.30), 0 2px 8px rgba(201,168,112,0.18)" }}
          >
            {answers.modernVsCozy ? "Looks good, continue" : answers.sundayMorning ? "Keep going →" : "That's my vibe"}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
