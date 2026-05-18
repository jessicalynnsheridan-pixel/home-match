"use client";

import { useState, useCallback } from "react";
import { StepProps } from "./shared";
import { QuestionnaireAnswers } from "@/types";
import { ArrowRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TradeoffKey = keyof Pick<
  QuestionnaireAnswers,
  | "tradeoffSpaceVsLocation"
  | "tradeoffPrivacyVsWalkability"
  | "tradeoffOutdoorVsInterior"
  | "tradeoffQuietVsEnergy"
  | "tradeoffNewVsCharacter"
>;

type TradeoffValue<K extends TradeoffKey> = Exclude<QuestionnaireAnswers[K], "">;

interface TradeoffDef {
  key: TradeoffKey;
  question: string;
  optionA: { value: string; emoji: string; label: string };
  optionB: { value: string; emoji: string; label: string };
}

const TRADEOFFS: TradeoffDef[] = [
  {
    key: "tradeoffSpaceVsLocation",
    question: "When you have to choose:",
    optionA: { value: "More space", emoji: "🏠", label: "More space" },
    optionB: { value: "Better location", emoji: "📍", label: "Better location" },
  },
  {
    key: "tradeoffPrivacyVsWalkability",
    question: "Your ideal neighbourhood feels:",
    optionA: { value: "Privacy", emoji: "🌲", label: "Tucked away" },
    optionB: { value: "Walkability", emoji: "☕", label: "Walk to everything" },
  },
  {
    key: "tradeoffOutdoorVsInterior",
    question: "If the budget forces it:",
    optionA: { value: "Outdoor space", emoji: "🌿", label: "Outdoor space" },
    optionB: { value: "Interior finishes", emoji: "✨", label: "Interior finishes" },
  },
  {
    key: "tradeoffQuietVsEnergy",
    question: "What kind of energy feeds you:",
    optionA: { value: "Quiet & calm", emoji: "🌅", label: "Quiet & calm" },
    optionB: { value: "Buzz & energy", emoji: "⚡", label: "Buzz & energy" },
  },
  {
    key: "tradeoffNewVsCharacter",
    question: "The home itself:",
    optionA: { value: "New build", emoji: "🔑", label: "New build" },
    optionB: { value: "Character home", emoji: "🏛️", label: "Character home" },
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function StepTradeoffs({ answers, update, onNext, onBack }: StepProps) {
  const [current, setCurrent] = useState(() => {
    // Start from first unanswered tradeoff
    const firstUnanswered = TRADEOFFS.findIndex((t) => answers[t.key] === "");
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });
  const [selecting, setSelecting] = useState<string | null>(null);

  const allAnswered = TRADEOFFS.every((t) => answers[t.key] !== "");
  const tradeoff = TRADEOFFS[current];
  const currentValue = answers[tradeoff.key] as string;

  const handlePick = useCallback(
    <K extends TradeoffKey>(key: K, value: TradeoffValue<K> | "") => {
      update(key, value as QuestionnaireAnswers[K]);
      setSelecting(value as string);

      setTimeout(() => {
        setSelecting(null);
        if (current < TRADEOFFS.length - 1) {
          setCurrent((c) => c + 1);
        }
      }, 420);
    },
    [current, update]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-2">
          <span className="text-white">Quick instincts.</span><br />
          <span className="text-gradient-gold">No wrong answers.</span>
        </h2>
        <p className="text-white/45 text-sm">
          {current + 1} of {TRADEOFFS.length}. Just go with your gut.
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {TRADEOFFS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-[#b8a88a] w-6"
                : answers[t.key] !== ""
                ? "bg-[#b8a88a]/50 w-3"
                : "bg-white/15 w-3"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <p className="text-white/50 text-sm mb-6 animate-step-enter" key={`q-${current}`}>
        {tradeoff.question}
      </p>

      {/* Two-option tiles */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-step-enter" key={`t-${current}`}>
        {[tradeoff.optionA, tradeoff.optionB].map((opt) => {
          const isSelected = currentValue === opt.value;
          const isSelecting = selecting === opt.value;
          const active = isSelected || isSelecting;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePick(tradeoff.key, opt.value as TradeoffValue<typeof tradeoff.key>)}
              className="relative rounded-2xl p-5 text-left flex flex-col gap-3 transition-all duration-200 btn-press"
              style={{
                minHeight: 170,
                background: active
                  ? "linear-gradient(145deg, #b8956a 0%, #8a6840 100%)"
                  : "rgba(255,255,255,0.06)",
                border: active
                  ? "2px solid rgba(184,168,138,0.8)"
                  : "2px solid rgba(255,255,255,0.10)",
                boxShadow: active
                  ? "0 8px 32px rgba(184,168,138,0.30), 0 2px 8px rgba(0,0,0,0.4)"
                  : "0 2px 12px rgba(0,0,0,0.25)",
                transform: active ? "scale(1.02)" : "scale(1)",
              }}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <p className="font-semibold text-base text-white">{opt.label}</p>

              {isSelected && !selecting && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-scale-in">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* All done → Continue */}
      {allAnswered && (
        <div className="animate-fade-up">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 text-[#1a1512] font-semibold text-sm py-4 rounded-2xl transition-all btn-press"
            style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 32px rgba(201,168,112,0.30), 0 2px 8px rgba(201,168,112,0.18)" }}
          >
            All done. Continue
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {!allAnswered && (
        <button
          onClick={onNext}
          className="w-full text-center text-white/20 text-xs hover:text-white/40 transition-colors py-2"
        >
          Skip for now →
        </button>
      )}
    </div>
  );
}
