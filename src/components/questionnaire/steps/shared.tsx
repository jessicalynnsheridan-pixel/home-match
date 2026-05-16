// Shared types and small UI atoms used across questionnaire steps
import { QuestionnaireAnswers } from "@/types";

export interface StepProps {
  answers: QuestionnaireAnswers;
  update: <K extends keyof QuestionnaireAnswers>(
    key: K,
    value: QuestionnaireAnswers[K]
  ) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-[#2c2825] mb-2">{title}</h2>
      <p className="text-[#8c8580] text-base">{subtitle}</p>
    </div>
  );
}

export function NavButtons({
  onBack,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  nextLabel = "Continue",
}: {
  onBack: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirst: boolean;
  isLast: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex justify-between items-center mt-10 pt-8 border-t border-[#e8e4de]">
      {!isFirst ? (
        <button
          onClick={onBack}
          className="text-[#8c8580] text-sm hover:text-[#2c2825] transition-colors"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      {isLast ? (
        <button
          onClick={onSubmit}
          className="bg-[#2c2825] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#1a1714] transition-colors"
        >
          Submit My Profile
        </button>
      ) : (
        <button
          onClick={onNext}
          className="bg-[#2c2825] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#1a1714] transition-colors"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm border transition-all ${
        selected
          ? "bg-[#2c2825] text-white border-[#2c2825]"
          : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
      }`}
    >
      {label}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#2c2825] mb-2">
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] transition-colors bg-white"
    />
  );
}
