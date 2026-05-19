"use client";

import { useState } from "react";
import { StepProps, StepHeader, NavButtons } from "./shared";

const PROMPTS = [
  { emoji: "📦", text: "I'm relocating from out of town" },
  { emoji: "👶", text: "I have kids and need good schools nearby" },
  { emoji: "🐾", text: "I have pets and need a yard" },
  { emoji: "🏠", text: "I need to sell my current home first" },
  { emoji: "⏰", text: "I have a specific move-in deadline" },
  { emoji: "🔨", text: "I'd prefer move-in ready, no renovations" },
  { emoji: "🔍", text: "I've been searching for a while with no luck" },
  { emoji: "💼", text: "This is partly an investment decision" },
];

export default function StepNotes({ answers, update, onNext, onBack, onSubmit, isSubmitting, submitError }: StepProps) {
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());

  function applyPrompt(text: string) {
    if (usedPrompts.has(text)) return;
    setUsedPrompts((prev) => new Set([...prev, text]));
    const current = answers.additionalNotes.trim();
    update("additionalNotes", current ? `${current}\n${text}` : text);
  }

  return (
    <div>
      <StepHeader
        title="Anything else we should know?"
        subtitle="The stuff that doesn't fit a checkbox. Tap anything that applies, or write it in your own words."
      />

      <div className="space-y-5">
        {/* Prompt chips */}
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((p) => {
            const used = usedPrompts.has(p.text);
            return (
              <button
                key={p.text}
                type="button"
                onClick={() => applyPrompt(p.text)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all btn-press"
                style={{
                  background: used ? "#b8a88a" : "#ffffff",
                  border: used ? "1.5px solid #b8a88a" : "1.5px solid #e0dbd4",
                  color: used ? "#1a1512" : "#6b6560",
                  fontWeight: used ? 600 : 400,
                  opacity: used ? 0.7 : 1,
                }}
              >
                <span>{p.emoji}</span>
                <span>{p.text}</span>
              </button>
            );
          })}
        </div>

        {/* Freeform textarea */}
        <textarea
          value={answers.additionalNotes}
          onChange={(e) => update("additionalNotes", e.target.value)}
          placeholder="Or write anything here: your situation, your timeline, what you've tried, what matters most..."
          rows={4}
          className="w-full bg-white border border-[#e0dbd4] rounded-xl px-4 py-3.5 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a] transition-all resize-none leading-relaxed"
        />

        {/* Review summary card */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#ffffff", border: "1px solid #e0dbd4", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p className="text-[#2c2825] font-semibold text-sm">Your profile at a glance ✓</p>
          {[
            { label: "Name",        value: `${answers.firstName} ${answers.lastName}`.trim() || "-" },
            { label: "Timeline",    value: answers.timeline || "-" },
            { label: "Location",    value: answers.preferredCity || "-" },
            { label: "Property",    value: answers.propertyType || "-" },
            { label: "Bedrooms",    value: answers.bedrooms ? `${answers.bedrooms}+` : "-" },
            { label: "Pre-approval",value: answers.preApprovalStatus || "-" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-[#8c8580]">{row.label}</span>
              <span className="text-[#2c2825] font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast isSubmitting={isSubmitting} submitError={submitError} />
    </div>
  );
}
