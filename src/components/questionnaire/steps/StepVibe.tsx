"use client";

import { StepProps, StepHeader, NavButtons } from "./shared";

// ─── Feeling cards ─────────────────────────────────────────────────────────

const HOME_FEELINGS = [
  { label: "Peaceful retreat", emoji: "🌿", description: "Calm, private, a place to exhale" },
  { label: "Social hub", emoji: "🥂", description: "Built for gathering, hosting, connection" },
  { label: "Creative sanctuary", emoji: "🎨", description: "Inspired, unique, full of personality" },
  { label: "Family nest", emoji: "🏡", description: "Safe, warm, room to grow together" },
  { label: "Modern haven", emoji: "✨", description: "Clean lines, smart design, elevated living" },
  { label: "Adventure base", emoji: "🌲", description: "Close to nature, trails, and the outdoors" },
];

const SUNDAY_MOODS = [
  { label: "Coffee in a sunny kitchen", emoji: "☕" },
  { label: "Hosting brunch in the backyard", emoji: "🌸" },
  { label: "Reading by a fireplace", emoji: "📖" },
  { label: "Long walk to a local cafe", emoji: "🚶" },
  { label: "Quiet morning, no neighbours in sight", emoji: "🌅" },
  { label: "Kids playing while I cook", emoji: "👨‍👩‍👧" },
];

const FRUSTRATIONS = [
  { label: "No outdoor space", emoji: "🌳" },
  { label: "Too much noise", emoji: "🔊" },
  { label: "Not enough room to breathe", emoji: "📦" },
  { label: "No character or warmth", emoji: "🧱" },
  { label: "Bad location for my lifestyle", emoji: "📍" },
  { label: "Can't host the way I want", emoji: "🚫" },
  { label: "Too far from what matters", emoji: "🛣️" },
  { label: "No place to work from home", emoji: "💻" },
];

const HOSTING_OPTIONS = [
  { value: "Hosting haven", label: "Hosting haven", emoji: "🥂", desc: "I love having people over — space for entertaining matters" },
  { value: "Private sanctuary", label: "Private sanctuary", emoji: "🛋️", desc: "My home is my escape — I value quiet and privacy" },
  { value: "Balance of both", label: "Balance of both", emoji: "⚖️", desc: "I like the option to host, but need my peace too" },
] as const;

const STYLE_OPTIONS = [
  { value: "Modern & minimal", label: "Modern & minimal", emoji: "🪟", desc: "Clean, airy, everything in its place" },
  { value: "Warm & cozy", label: "Warm & cozy", emoji: "🕯️", desc: "Natural materials, soft textures, lived-in comfort" },
  { value: "Classic elegance", label: "Classic elegance", emoji: "🏛️", desc: "Timeless architecture, craftsmanship, traditional details" },
  { value: "Bold & unique", label: "Bold & unique", emoji: "🎭", desc: "Character, personality, nothing cookie-cutter" },
] as const;

// ─── Sub-components ─────────────────────────────────────────────────────────

function FeelingCard({
  item,
  selected,
  onToggle,
}: {
  item: typeof HOME_FEELINGS[number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        selected
          ? "border-[#2c2825] bg-[#2c2825] text-white shadow-md"
          : "border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#b8a88a]"
      }`}
    >
      <span className="text-2xl mb-2 block">{item.emoji}</span>
      <p className={`font-semibold text-sm mb-1 ${selected ? "text-white" : "text-[#2c2825]"}`}>
        {item.label}
      </p>
      <p className={`text-xs leading-relaxed ${selected ? "text-white/70" : "text-[#8c8580]"}`}>
        {item.description}
      </p>
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#b8a88a] flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

function MoodChip({
  item,
  selected,
  onToggle,
}: {
  item: typeof SUNDAY_MOODS[number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all duration-150 ${
        selected
          ? "bg-[#2c2825] text-white border-[#2c2825] shadow-sm"
          : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#b8a88a]"
      }`}
    >
      <span>{item.emoji}</span>
      {item.label}
    </button>
  );
}

function SelectCard({
  emoji,
  label,
  desc,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
        selected
          ? "border-[#2c2825] bg-[#2c2825] text-white"
          : "border-[#e8e4de] bg-white hover:border-[#b8a88a]"
      }`}
    >
      <span className="text-xl block mb-1">{emoji}</span>
      <p className={`font-medium text-sm mb-0.5 ${selected ? "text-white" : "text-[#2c2825]"}`}>
        {label}
      </p>
      <p className={`text-xs ${selected ? "text-white/70" : "text-[#8c8580]"}`}>{desc}</p>
    </button>
  );
}

// ─── Step Component ─────────────────────────────────────────────────────────

export default function StepVibe({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  function toggleFeeling(label: string) {
    const current = answers.homeFeeling;
    const next = current.includes(label)
      ? current.filter((f) => f !== label)
      : [...current, label];
    update("homeFeeling", next);
  }

  function toggleFrustration(label: string) {
    const current = answers.currentFrustration;
    const next = current.includes(label)
      ? current.filter((f) => f !== label)
      : [...current, label];
    update("currentFrustration", next);
  }

  return (
    <div>
      <StepHeader
        title="Let's start with the feeling."
        subtitle="Not the square footage. Not the price. How do you want your future home to make you feel?"
      />

      {/* Feeling cards */}
      <div className="mb-10">
        <p className="text-sm font-medium text-[#2c2825] mb-1">
          What feeling should your home give you?
        </p>
        <p className="text-xs text-[#8c8580] mb-4">Choose all that resonate. There&apos;s no wrong answer.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {HOME_FEELINGS.map((item) => (
            <FeelingCard
              key={item.label}
              item={item}
              selected={answers.homeFeeling.includes(item.label)}
              onToggle={() => toggleFeeling(item.label)}
            />
          ))}
        </div>
      </div>

      {/* Sunday morning */}
      <div className="mb-10">
        <p className="text-sm font-medium text-[#2c2825] mb-1">
          What does your dream Sunday morning look like?
        </p>
        <p className="text-xs text-[#8c8580] mb-4">Pick the one that feels most like you.</p>
        <div className="flex flex-wrap gap-2">
          {SUNDAY_MOODS.map((item) => (
            <MoodChip
              key={item.label}
              item={item}
              selected={answers.sundayMorning === item.label}
              onToggle={() =>
                update("sundayMorning", answers.sundayMorning === item.label ? "" : item.label)
              }
            />
          ))}
        </div>
      </div>

      {/* Hosting vs privacy */}
      <div className="mb-10">
        <p className="text-sm font-medium text-[#2c2825] mb-1">
          Hosting space or private sanctuary?
        </p>
        <p className="text-xs text-[#8c8580] mb-4">Your home should fit how you actually live.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HOSTING_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              emoji={opt.emoji}
              label={opt.label}
              desc={opt.desc}
              selected={answers.hostingVsPrivacy === opt.value}
              onClick={() => update("hostingVsPrivacy", opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="mb-10">
        <p className="text-sm font-medium text-[#2c2825] mb-1">
          What style feels like home to you?
        </p>
        <p className="text-xs text-[#8c8580] mb-4">Modern & minimal or warm & cozy? Both are perfect.</p>
        <div className="grid grid-cols-2 gap-3">
          {STYLE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              emoji={opt.emoji}
              label={opt.label}
              desc={opt.desc}
              selected={answers.modernVsCozy === opt.value}
              onClick={() => update("modernVsCozy", opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Current frustration */}
      <div className="mb-2">
        <p className="text-sm font-medium text-[#2c2825] mb-1">
          What frustrates you most about where you live now?
        </p>
        <p className="text-xs text-[#8c8580] mb-4">
          This helps us filter out what you&apos;re trying to leave behind.
        </p>
        <div className="flex flex-wrap gap-2">
          {FRUSTRATIONS.map((item) => (
            <MoodChip
              key={item.label}
              item={item}
              selected={answers.currentFrustration.includes(item.label)}
              onToggle={() => toggleFrustration(item.label)}
            />
          ))}
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirst={true}
        isLast={false}
        nextLabel="Continue →"
      />
    </div>
  );
}
