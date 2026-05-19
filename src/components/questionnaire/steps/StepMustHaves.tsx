"use client";

import { StepProps, NavButtons } from "./shared";

const MUST_HAVES = [
  "Chef's kitchen", "Home office", "Private backyard", "Garage",
  "Open floor plan", "Natural light", "Primary on main floor", "Basement suite",
  "EV charging", "Pool", "Fireplace", "High ceilings",
  "New build", "Quiet street", "Walking distance to shops", "Good school district",
];

const DEAL_BREAKERS = [
  "Busy arterial road", "Power lines nearby", "No parking", "Small kitchen",
  "Needs full renovation", "No outdoor space", "Shared wall (semi/townhouse)", "Basement bedroom",
  "Far from transit", "No laundry in unit", "HOA fees", "Flood zone",
];

export default function StepMustHaves({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  function toggleMust(item: string) {
    const current = answers.mustHaves ?? [];
    update("mustHaves", current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item]
    );
  }

  function toggleBreaker(item: string) {
    const current = answers.dealBreakers ?? [];
    update("dealBreakers", current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item]
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-[#2c2825]">What&apos;s non-negotiable</span><br />
          <span className="text-gradient-gold">for you?</span>
        </h2>
        <p className="text-[#8c8580] text-base leading-relaxed">
          Tap everything that applies. This is what your realtor will filter by first.
        </p>
      </div>

      <div className="space-y-8">
        {/* Must-haves */}
        <div>
          <p className="text-sm font-semibold text-[#2c2825] mb-1 flex items-center gap-2">
            <span className="text-lg">✅</span> Must have
          </p>
          <p className="text-xs text-[#8c8580] mb-4">These are deal-makers. You won&apos;t consider a home without them.</p>
          <div className="flex flex-wrap gap-2.5">
            {MUST_HAVES.map((item) => {
              const sel = (answers.mustHaves ?? []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleMust(item)}
                  className="px-4 py-2.5 rounded-xl text-sm transition-all btn-press"
                  style={{
                    background: sel ? "linear-gradient(135deg, #b8956a 0%, #8a6840 100%)" : "#ffffff",
                    border: sel ? "1.5px solid rgba(184,168,138,0.7)" : "1.5px solid #e0dbd4",
                    color: sel ? "#ffffff" : "#6b6560",
                    fontWeight: sel ? 600 : 400,
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deal-breakers */}
        <div>
          <p className="text-sm font-semibold text-[#2c2825] mb-1 flex items-center gap-2">
            <span className="text-lg">🚫</span> Deal-breakers
          </p>
          <p className="text-xs text-[#8c8580] mb-4">These are hard nos. Homes with these will be filtered out.</p>
          <div className="flex flex-wrap gap-2.5">
            {DEAL_BREAKERS.map((item) => {
              const sel = (answers.dealBreakers ?? []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleBreaker(item)}
                  className="px-4 py-2.5 rounded-xl text-sm transition-all btn-press"
                  style={{
                    background: sel ? "#fef2f2" : "#ffffff",
                    border: sel ? "1.5px solid #fca5a5" : "1.5px solid #e0dbd4",
                    color: sel ? "#dc2626" : "#6b6560",
                    fontWeight: sel ? 600 : 400,
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
