import { PreApprovalStatus, HomeOwnershipStatus, MortgageChecklistItem } from "@/types";
import { StepProps, StepHeader, NavButtons, FieldLabel, ToggleChip } from "./shared";
import { CheckCircle, Circle } from "lucide-react";

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

const DEFAULT_CHECKLIST: MortgageChecklistItem[] = [
  { id: "c1", label: "Government-issued photo ID", completed: false },
  { id: "c2", label: "Proof of income (pay stubs / T4s)", completed: false },
  { id: "c3", label: "Employment letter", completed: false },
  { id: "c4", label: "Last 2 years of NOAs", completed: false },
  { id: "c5", label: "Last 3 months bank statements", completed: false },
  { id: "c6", label: "Down payment proof / gift letter", completed: false },
  { id: "c7", label: "Credit check authorization", completed: false },
  { id: "c8", label: "Pre-approval letter from lender", completed: false },
];

export default function StepFinancials({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  const checklist: MortgageChecklistItem[] =
    answers.mortgageChecklist?.length ? answers.mortgageChecklist : DEFAULT_CHECKLIST;

  function toggleChecklist(id: string) {
    update(
      "mortgageChecklist",
      checklist.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  }

  const completedCount = checklist.filter((i) => i.completed).length;

  return (
    <div>
      <StepHeader
        title="Financial picture."
        subtitle="This helps your realtor understand how ready you are and what kind of support you need."
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
          <FieldLabel>Is this purchase for personal use or investment?</FieldLabel>
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

        {/* Mortgage checklist */}
        <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <FieldLabel>Mortgage document checklist</FieldLabel>
            <span className="text-xs text-[#8c8580]">{completedCount}/{checklist.length} ready</span>
          </div>
          <div className="h-1.5 bg-[#e8e4de] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
          <p className="text-[#8c8580] text-xs mb-4">
            Check off the documents you already have ready. Your realtor will see this progress.
          </p>
          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklist(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  item.completed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-[#e8e4de] hover:border-[#2c2825]"
                }`}
              >
                {item.completed ? (
                  <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={15} className="text-[#c4bfb9] shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? "text-emerald-800 line-through" : "text-[#2c2825]"}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
