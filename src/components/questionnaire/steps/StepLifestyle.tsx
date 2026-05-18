import { StepProps, StepHeader, NavButtons, FieldLabel } from "./shared";
import { X } from "lucide-react";
import { useState } from "react";

// Predefined suggestions the buyer can toggle on, or type their own
const MUST_HAVE_SUGGESTIONS = [
  "Updated kitchen",
  "Home office",
  "Private backyard",
  "Double garage",
  "Primary ensuite",
  "Open concept",
  "Finished basement",
  "Pool",
  "Large lot",
  "Wine cellar",
  "In-law suite",
  "High ceilings",
  "Main floor laundry",
  "Walk-in closet",
  "Fireplace",
];

const DEAL_BREAKER_SUGGESTIONS = [
  "Busy arterial road",
  "No parking",
  "High condo fees",
  "Leasehold",
  "Under power lines",
  "Backing onto highway",
  "No backyard",
  "Dated building",
];

const LIFESTYLE_SUGGESTIONS = [
  "Walkability",
  "Good schools",
  "Green space nearby",
  "Quiet street",
  "Waterfront access",
  "Dog-friendly area",
  "Restaurants & cafes",
  "Wine country lifestyle",
  "Family-friendly",
  "Privacy",
  "Investment potential",
  "Commuter-friendly",
];

function MultiChipField({
  label,
  hint,
  selected,
  suggestions,
  onToggle,
}: {
  label: string;
  hint: string;
  selected: string[];
  suggestions: string[];
  onToggle: (item: string) => void;
}) {
  const [custom, setCustom] = useState("");

  function addCustom() {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onToggle(trimmed);
    }
    setCustom("");
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="text-white/40 text-xs mb-3">{hint}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => {
          const active = selected.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className="px-4 py-2 rounded-full text-sm transition-all btn-press"
              style={{
                background: active ? "rgba(184,168,138,0.90)" : "rgba(255,255,255,0.07)",
                border: active ? "1.5px solid rgba(184,168,138,0.8)" : "1.5px solid rgba(255,255,255,0.10)",
                color: active ? "#1a1512" : "rgba(255,255,255,0.70)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {active ? <span className="flex items-center gap-1.5">{s} <X size={11} /></span> : s}
            </button>
          );
        })}
      </div>

      {/* Custom entry */}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Add your own..."
          className="flex-1 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#b8a88a] focus:bg-white/12 transition-all"
        />
        <button
          type="button"
          onClick={addCustom}
          className="bg-white/8 border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:border-[#b8a88a] hover:text-white transition-all"
        >
          Add
        </button>
      </div>

      {/* Custom-added items not in suggestions */}
      {selected.filter((s) => !suggestions.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected
            .filter((s) => !suggestions.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onToggle(s)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(184,168,138,0.90)",
                  border: "1.5px solid rgba(184,168,138,0.8)",
                  color: "#1a1512",
                  fontWeight: 600,
                }}
              >
                {s} <X size={11} />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function StepLifestyle({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  function toggle(key: "mustHaves" | "dealBreakers" | "lifestylePriorities", item: string) {
    const current = answers[key] as string[];
    const next = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    update(key, next);
  }

  return (
    <div>
      <StepHeader
        title="What makes a home feel like yours?"
        subtitle="Your must-haves and deal-breakers are how we find homes that deserve your time, not just homes that are available."
      />

      <div className="space-y-8">
        <MultiChipField
          label="Must-haves"
          hint="Things a home absolutely needs to have for you to consider it."
          selected={answers.mustHaves}
          suggestions={MUST_HAVE_SUGGESTIONS}
          onToggle={(item) => toggle("mustHaves", item)}
        />

        <MultiChipField
          label="Deal breakers"
          hint="Things that would disqualify a property immediately."
          selected={answers.dealBreakers}
          suggestions={DEAL_BREAKER_SUGGESTIONS}
          onToggle={(item) => toggle("dealBreakers", item)}
        />

        <MultiChipField
          label="Lifestyle priorities"
          hint="What matters most about the neighbourhood and day-to-day life?"
          selected={answers.lifestylePriorities}
          suggestions={LIFESTYLE_SUGGESTIONS}
          onToggle={(item) => toggle("lifestylePriorities", item)}
        />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
