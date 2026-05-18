"use client";

import { useState } from "react";
import { StepProps } from "./shared";
import { ArrowRight } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const HOME_FEELINGS = [
  { label: "Peaceful",   bg: "#4a7c59", text: "#ffffff" },
  { label: "Social",     bg: "#c87941", text: "#ffffff" },
  { label: "Creative",   bg: "#4a6f9c", text: "#ffffff" },
  { label: "Family",     bg: "#b89040", text: "#ffffff" },
  { label: "Modern",     bg: "#4a4540", text: "#ffffff" },
  { label: "Adventure",  bg: "#3d6b4a", text: "#ffffff" },
];

const SUNDAY_MOODS = [
  "Coffee in a sunny kitchen",
  "Hosting brunch in the backyard",
  "Reading by a fireplace",
  "Quiet morning, no neighbours",
  "Kids playing while I cook",
];

type StyleValue = "" | "Modern & minimal" | "Warm & cozy" | "Classic elegance" | "Bold & unique";

const STYLE_OPTIONS: { value: StyleValue; bg: string }[] = [
  { value: "Modern & minimal",  bg: "#5a6268" },
  { value: "Warm & cozy",       bg: "#b88040" },
  { value: "Classic elegance",  bg: "#7a6858" },
  { value: "Bold & unique",     bg: "#8c4a3c" },
];

// ─── Step ────────────────────────────────────────────────────────────────────

export default function StepVibe({ answers, update, onNext }: StepProps) {
  const [slide, setSlide] = useState(0);

  function toggleFeeling(label: string) {
    const current = answers.homeFeeling;
    const next = current.includes(label)
      ? current.filter((f) => f !== label)
      : [...current, label];
    update("homeFeeling", next);
  }

  function pickSunday(label: string) {
    update("sundayMorning", label);
    setTimeout(() => setSlide(2), 200);
  }

  function pickStyle(value: StyleValue) {
    update("modernVsCozy", value);
  }

  // ── Slide 0: Core feeling ─────────────────────────────────────────────────
  if (slide === 0) return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-[#1a1512]">How should home</span><br />
          <span className="text-gradient-gold">make you feel?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">Tap all that resonate.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-8">
        {HOME_FEELINGS.map((item) => {
          const selected = answers.homeFeeling.includes(item.label);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => toggleFeeling(item.label)}
              className="relative rounded-2xl text-left transition-all duration-150 btn-press"
              style={{
                background: item.bg,
                minHeight: 110,
                outline: selected ? "2.5px solid #1a1512" : "2.5px solid transparent",
                outlineOffset: "2px",
              }}
            >
              <div className="p-4 flex flex-col justify-end h-full" style={{ minHeight: 110 }}>
                <p className="font-semibold text-sm text-white">{item.label}</p>
              </div>
              {selected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3 5.5L8 1" stroke="#1a1512" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {answers.homeFeeling.length > 0 && (
        <button
          onClick={() => setSlide(1)}
          className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm py-4 rounded-2xl transition-all btn-press"
          style={{ background: "#1a1512" }}
        >
          Continue <ArrowRight size={15} />
        </button>
      )}
    </div>
  );

  // ── Slide 1: Sunday morning ───────────────────────────────────────────────
  if (slide === 1) return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-[#1a1512]">Your ideal</span><br />
          <span className="text-gradient-gold">Sunday morning?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">Tap one.</p>
      </div>

      <div className="space-y-2.5">
        {SUNDAY_MOODS.map((label) => {
          const selected = answers.sundayMorning === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => pickSunday(label)}
              className="w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all duration-150 btn-press"
              style={{
                background: selected ? "#1a1512" : "#ffffff",
                border: selected ? "1.5px solid #1a1512" : "1.5px solid #e0dbd4",
                color: selected ? "#ffffff" : "#2c2825",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Slide 2: Aesthetic ────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-[#1a1512]">Your home&apos;s</span><br />
          <span className="text-gradient-gold">aesthetic?</span>
        </h2>
        <p className="text-[#8c8580] text-sm">Tap one to continue.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-8">
        {STYLE_OPTIONS.map((opt) => {
          const selected = answers.modernVsCozy === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pickStyle(opt.value as StyleValue)}
              className="relative rounded-2xl text-left transition-all duration-150 btn-press"
              style={{
                background: opt.bg,
                minHeight: 110,
                outline: selected ? "2.5px solid #1a1512" : "2.5px solid transparent",
                outlineOffset: "2px",
              }}
            >
              <div className="p-4 flex flex-col justify-end" style={{ minHeight: 110 }}>
                <p className="font-semibold text-sm text-white leading-snug">{opt.value}</p>
              </div>
              {selected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3 5.5L8 1" stroke="#1a1512" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {answers.modernVsCozy && (
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm py-4 rounded-2xl transition-all btn-press"
          style={{ background: "#1a1512" }}
        >
          Continue <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
