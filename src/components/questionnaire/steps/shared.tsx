// Shared types and small UI atoms, light questionnaire environment
import { QuestionnaireAnswers } from "@/types";
import { ArrowRight } from "lucide-react";

export interface StepProps {
  answers: QuestionnaireAnswers;
  update: <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-4xl sm:text-5xl font-bold text-[#2c2825] leading-tight mb-3">{title}</h2>
      <p className="text-[#8c8580] text-base leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function NavButtons({
  onBack: _onBack, onNext, onSubmit, isFirst: _isFirst, isLast, nextLabel = "Continue",
  isSubmitting = false, submitError,
}: {
  onBack: () => void; onNext?: () => void; onSubmit?: () => void;
  isFirst: boolean; isLast: boolean; nextLabel?: string;
  isSubmitting?: boolean; submitError?: string | null;
}) {
  return (
    <div className="mt-10">
      {isLast ? (
        <>
          {submitError && (
            <p className="text-sm text-rose-600 text-center mb-4 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 text-[#1a1512] font-semibold text-sm py-4 rounded-2xl transition-all btn-press disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 32px rgba(201,168,112,0.30), 0 2px 8px rgba(201,168,112,0.18)" }}
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-[#1a1512]/30 border-t-[#1a1512] rounded-full animate-spin" /> Submitting...</>
            ) : (
              <>Submit my profile ✨</>
            )}
          </button>
        </>
      ) : (
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 text-[#1a1512] font-semibold text-sm py-4 rounded-2xl transition-all btn-press"
          style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 32px rgba(201,168,112,0.30), 0 2px 8px rgba(201,168,112,0.18)" }}
        >
          {nextLabel} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

export function ToggleChip({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl text-sm transition-all btn-press"
      style={{
        background: selected ? "#b8a88a" : "#ffffff",
        border: selected ? "1.5px solid #b8a88a" : "1.5px solid #e0dbd4",
        color: selected ? "#1a1512" : "#6b6560",
        fontWeight: selected ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#6b6560] mb-2">{children}</label>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-[#e0dbd4] rounded-xl px-4 py-3.5 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a] focus:bg-white transition-all"
    />
  );
}
