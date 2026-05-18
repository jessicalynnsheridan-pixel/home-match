"use client";

import { useState, useEffect } from "react";
import { StepProps } from "./shared";

type StyleValue = "" | "Modern & minimal" | "Warm & cozy" | "Classic elegance" | "Bold & unique";

const HOME_FEELINGS = [
  "Peaceful",
  "Social",
  "Creative",
  "Family-first",
  "Modern",
  "Adventurous",
];

const SUNDAY_MOODS = [
  "Total quiet",
  "Hosting people",
  "Outside with kids",
  "Solo, no plans",
  "Getting out",
  "Slow & cozy",
];

const STYLE_OPTIONS: StyleValue[] = [
  "Modern & minimal",
  "Warm & cozy",
  "Classic elegance",
  "Bold & unique",
];

// ─── Shared chip component ────────────────────────────────────────────────────

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-5 py-4 rounded-2xl text-left text-sm font-medium transition-all duration-150 btn-press"
      style={{
        background: selected ? "#1a1512" : "#ffffff",
        border: selected ? "1.5px solid #1a1512" : "1.5px solid #e0dbd4",
        color: selected ? "#ffffff" : "#2c2825",
        boxShadow: selected ? "0 2px 12px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <span className="flex items-center justify-between">
        {label}
        {selected && (
          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </span>
    </button>
  );
}

// ─── Step ────────────────────────────────────────────────────────────────────

export default function StepVibe({ answers, update, onNext }: StepProps) {
  const [slide, setSlide] = useState(0);

  // ── Slide 0: auto-advance 850ms after last chip tap (debounce) ────────────
  useEffect(() => {
    if (slide !== 0 || answers.homeFeeling.length === 0) return;
    const timer = setTimeout(() => setSlide(1), 850);
    return () => clearTimeout(timer);
  }, [answers.homeFeeling.length, slide]);

  function toggleFeeling(label: string) {
    const current = answers.homeFeeling;
    const next = current.includes(label)
      ? current.filter((f) => f !== label)
      : [...current, label];
    update("homeFeeling", next);
  }

  function pickSunday(label: string) {
    update("sundayMorning", label);
    setTimeout(() => setSlide(2), 280);
  }

  // ── Slide 2: auto-advance 300ms after pick ────────────────────────────────
  function pickStyle(value: StyleValue) {
    update("modernVsCozy", value);
    setTimeout(() => onNext(), 300);
  }

  // ── Slide progress dots ───────────────────────────────────────────────────
  const dots = (
    <div className="flex gap-1.5 mb-10">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === slide ? 24 : 8,
            background: i === slide ? "#1a1512" : "#d8d4ce",
          }}
        />
      ))}
    </div>
  );

  // ── Slide 0: Core feeling ─────────────────────────────────────────────────
  if (slide === 0) return (
    <div>
      {dots}
      <div className="mb-8">
        <h2 className="text-4xl font-bold leading-tight mb-2 text-[#1a1512]">
          How do you want<br />
          <span className="text-gradient-gold">to feel at home?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">Pick everything that feels right.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {HOME_FEELINGS.map((label) => (
          <Chip
            key={label}
            label={label}
            selected={answers.homeFeeling.includes(label)}
            onClick={() => toggleFeeling(label)}
          />
        ))}
      </div>

      <div className="h-5 flex items-center justify-center">
        {answers.homeFeeling.length > 0 && (
          <p className="text-[#b8b4b0] text-xs animate-fade-in">Moving on in a moment...</p>
        )}
      </div>
    </div>
  );

  // ── Slide 1: Sunday morning ───────────────────────────────────────────────
  if (slide === 1) return (
    <div>
      {dots}
      <div className="mb-8">
        <h2 className="text-4xl font-bold leading-tight mb-2 text-[#1a1512]">
          Your ideal<br />
          <span className="text-gradient-gold">Sunday morning?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">Tap one - it moves to the next automatically.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SUNDAY_MOODS.map((label) => (
          <Chip
            key={label}
            label={label}
            selected={answers.sundayMorning === label}
            onClick={() => pickSunday(label)}
          />
        ))}
      </div>
    </div>
  );

  // ── Slide 2: Aesthetic ────────────────────────────────────────────────────
  return (
    <div>
      {dots}
      <div className="mb-8">
        <h2 className="text-4xl font-bold leading-tight mb-2 text-[#1a1512]">
          Your home&apos;s<br />
          <span className="text-gradient-gold">aesthetic?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">One pick, gut instinct.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {STYLE_OPTIONS.map((value) => (
          <Chip
            key={value}
            label={value}
            selected={answers.modernVsCozy === value}
            onClick={() => pickStyle(value)}
          />
        ))}
      </div>

      <div className="h-5 flex items-center justify-center">
        {answers.modernVsCozy && (
          <p className="text-[#b8b4b0] text-xs animate-fade-in">Moving on...</p>
        )}
      </div>
    </div>
  );
}
