"use client";

import { useEffect } from "react";
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
  // Auto-advance 600ms after all 3 questions are answered
  useEffect(() => {
    if (!answers.preApprovalStatus || !answers.ownershipStatus || !answers.investmentOrPersonal) return;
    const timer = setTimeout(onNext, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.preApprovalStatus, answers.ownershipStatus, answers.investmentOrPersonal]);

  return (
    <div>
      <StepHeader
        title="Where are you in the process?"
        subtitle="No right or wrong answer here — this just helps your realtor know how to best support you."
      />

      <div className="space-y-7">
        {/* Pre-approval */}
        <div>
          <FieldLabel>Mortgage pre-approval</FieldLabel>
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
          <FieldLabel>Your current situation</FieldLabel>
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

      <div className="mt-8 h-5 flex items-center justify-center">
        {answers.preApprovalStatus && answers.ownershipStatus && answers.investmentOrPersonal && (
          <p className="text-[#b8b4b0] text-xs animate-fade-in">Moving on...</p>
        )}
      </div>

      {/* Fallback manual continue if needed */}
      {!(answers.preApprovalStatus && answers.ownershipStatus && answers.investmentOrPersonal) && (
        <div className="mt-4">
          <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
        </div>
      )}
    </div>
  );
}
