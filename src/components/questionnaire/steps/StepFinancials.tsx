import { PreApprovalStatus, HomeOwnershipStatus } from "@/types";
import { StepProps, StepHeader, NavButtons, FieldLabel, ToggleChip } from "./shared";

const PRE_APPROVAL_OPTIONS: PreApprovalStatus[] = [
  "Yes, fully approved",
  "In progress",
  "Not yet",
  "Paying cash",
];

const OWNERSHIP_OPTIONS: HomeOwnershipStatus[] = [
  "Renting",
  "Own (need to sell first)",
  "Own (can buy independently)",
  "First-time buyer",
];

const INTENT_OPTIONS = ["Personal use", "Investment", "Both"] as const;
type Intent = (typeof INTENT_OPTIONS)[number];

export default function StepFinancials({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Let's talk financial readiness."
        subtitle="No judgment, no pressure. This helps us show you what's genuinely within reach."
      />

      <div className="space-y-7">
        {/* Pre-approval */}
        <div>
          <FieldLabel>Mortgage pre-approval status</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {PRE_APPROVAL_OPTIONS.map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={answers.preApprovalStatus === opt}
                onClick={() => update("preApprovalStatus", opt)}
              />
            ))}
          </div>
        </div>

        {/* Current ownership */}
        <div>
          <FieldLabel>Current home ownership status</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {OWNERSHIP_OPTIONS.map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={answers.ownershipStatus === opt}
                onClick={() => update("ownershipStatus", opt)}
              />
            ))}
          </div>
        </div>

        {/* Investment vs personal */}
        <div>
          <FieldLabel>Is this for personal use or investment?</FieldLabel>
          <div className="flex flex-wrap gap-3 mt-1">
            {INTENT_OPTIONS.map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={answers.investmentOrPersonal === opt}
                onClick={() => update("investmentOrPersonal", opt as Intent)}
              />
            ))}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
