import { StepProps, StepHeader, NavButtons, FieldLabel, TextInput, ToggleChip } from "./shared";

const SCHOOL_OPTIONS = ["Not important", "Somewhat", "Very important"] as const;
type SchoolImportance = (typeof SCHOOL_OPTIONS)[number];

const VIBE_OPTIONS = [
  "Quiet & residential",
  "Walkable & urban",
  "Tree-lined streets",
  "Near waterfront",
  "Family-friendly",
  "Wine country character",
  "Peaceful & private",
  "Established neighbourhood",
];

const PROXIMITY_OPTIONS = [
  "Near top schools",
  "Near transit",
  "Close to parks",
  "Walkable to shops",
  "Near restaurants",
  "Dog-friendly parks",
  "Coffee shops & cafes",
  "Wineries & tasting rooms",
  "Ample parking",
  "Large lot size",
];

export default function StepLocation({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  function toggleVibe(item: string) {
    const curr = answers.neighbourhoodVibe || [];
    update("neighbourhoodVibe", curr.includes(item) ? curr.filter((v) => v !== item) : [...curr, item]);
  }

  function toggleProximity(item: string) {
    const curr = answers.proximityPriorities || [];
    update("proximityPriorities", curr.includes(item) ? curr.filter((v) => v !== item) : [...curr, item]);
  }

  return (
    <div>
      <StepHeader
        title="Where do you want to live?"
        subtitle="Tell us about the city, neighbourhoods, and lifestyle factors that matter most to you."
      />

      <div className="space-y-6">
        <div>
          <FieldLabel>Preferred city or region</FieldLabel>
          <TextInput
            value={answers.preferredCity}
            onChange={(v) => update("preferredCity", v)}
            placeholder="e.g. St. Catharines, Niagara-on-the-Lake, Grimsby..."
          />
        </div>

        <div>
          <FieldLabel>Preferred neighbourhoods</FieldLabel>
          <TextInput
            value={answers.preferredNeighbourhoods}
            onChange={(v) => update("preferredNeighbourhoods", v)}
            placeholder="e.g. Port Dalhousie, Old Town NOTL, Lakeshore..."
          />
          <p className="text-[#8c8580] text-xs mt-1.5">Separate multiple neighbourhoods with a comma.</p>
        </div>

        {/* Neighbourhood vibe */}
        <div>
          <FieldLabel>What kind of neighbourhood vibe are you looking for?</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {VIBE_OPTIONS.map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={(answers.neighbourhoodVibe || []).includes(opt)}
                onClick={() => toggleVibe(opt)}
              />
            ))}
          </div>
        </div>

        {/* Proximity priorities */}
        <div>
          <FieldLabel>What should be nearby?</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {PROXIMITY_OPTIONS.map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={(answers.proximityPriorities || []).includes(opt)}
                onClick={() => toggleProximity(opt)}
              />
            ))}
          </div>
        </div>

        {/* School district */}
        <div>
          <FieldLabel>How important is the school district?</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {SCHOOL_OPTIONS.map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={answers.schoolDistrictImportance === opt}
                onClick={() => update("schoolDistrictImportance", opt as SchoolImportance)}
              />
            ))}
          </div>
        </div>

        {/* Commute */}
        <div>
          <FieldLabel>Commute preferences</FieldLabel>
          <textarea
            value={answers.commutePreferences}
            onChange={(e) => update("commutePreferences", e.target.value)}
            placeholder="e.g. Max 30 min to downtown, prefer GO Train access, fully remote..."
            rows={3}
            className="w-full border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] transition-colors bg-white resize-none"
          />
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
