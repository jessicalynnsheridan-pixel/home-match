import { PropertyType } from "@/types";
import { StepProps, StepHeader, NavButtons, FieldLabel, ToggleChip } from "./shared";

const PROPERTY_TYPES: PropertyType[] = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
  "Land",
  "Luxury Estate",
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6];
const BATHROOM_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5];

export default function StepProperty({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="What kind of property?"
        subtitle="Select the property type and size that fits your needs."
      />

      <div className="space-y-7">
        {/* Property type */}
        <div>
          <FieldLabel>Property type</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {PROPERTY_TYPES.map((pt) => (
              <ToggleChip
                key={pt}
                label={pt}
                selected={answers.propertyType === pt}
                onClick={() => update("propertyType", pt)}
              />
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <FieldLabel>Minimum bedrooms</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {BEDROOM_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update("bedrooms", n)}
                className={`w-12 h-12 rounded-xl border text-sm font-medium transition-all ${
                  answers.bedrooms === n
                    ? "bg-[#2c2825] text-white border-[#2c2825]"
                    : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
                }`}
              >
                {n}+
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <FieldLabel>Minimum bathrooms</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {BATHROOM_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update("bathrooms", n)}
                className={`w-14 h-12 rounded-xl border text-sm font-medium transition-all ${
                  answers.bathrooms === n
                    ? "bg-[#2c2825] text-white border-[#2c2825]"
                    : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
                }`}
              >
                {n}+
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
