"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionnaireAnswers } from "@/types";
import StepContact from "./steps/StepContact";
import StepTimeline from "./steps/StepTimeline";
import StepLocation from "./steps/StepLocation";
import StepProperty from "./steps/StepProperty";
import StepLifestyle from "./steps/StepLifestyle";
import StepFinancials from "./steps/StepFinancials";
import StepNotes from "./steps/StepNotes";

// Initial empty state for the form
const INITIAL: QuestionnaireAnswers = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  timeline: "",
  budgetMin: 400000,
  budgetMax: 1500000,
  preferredCity: "",
  preferredNeighbourhoods: "",
  neighbourhoodVibe: [],
  proximityPriorities: [],
  schoolDistrictImportance: "",
  commutePreferences: "",
  propertyType: "",
  bedrooms: 3,
  bathrooms: 2,
  mustHaves: [],
  dealBreakers: [],
  lifestylePriorities: [],
  investmentOrPersonal: "",
  preApprovalStatus: "",
  ownershipStatus: "",
  mortgageChecklist: [],
  additionalNotes: "",
};

const STEP_LABELS = [
  "Contact",
  "Timeline",
  "Location",
  "Property",
  "Lifestyle",
  "Financials",
  "Notes",
];

export default function QuestionnaireForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL);

  const totalSteps = STEP_LABELS.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function update<K extends keyof QuestionnaireAnswers>(
    key: K,
    value: QuestionnaireAnswers[K]
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function submit() {
    try {
      sessionStorage.setItem("homematch_answers", JSON.stringify(answers));
    } catch { /* ignore quota/private-mode errors */ }
    router.push("/results");
  }

  const stepProps = { answers, update, onNext: next, onBack: back, onSubmit: submit };

  const StepComponent = [
    StepContact,
    StepTimeline,
    StepLocation,
    StepProperty,
    StepLifestyle,
    StepFinancials,
    StepNotes,
  ][step];

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[#8c8580] text-sm">
            Step {step + 1} of {totalSteps} &mdash; {STEP_LABELS[step]}
          </p>
          <p className="text-[#8c8580] text-sm">{progress}%</p>
        </div>
        <div className="h-1.5 bg-[#e8e4de] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2c2825] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-between mt-4">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? "bg-[#2c2825]" : "bg-[#e8e4de]"
                }`}
              />
              <p
                className={`text-[10px] hidden sm:block transition-colors ${
                  i === step ? "text-[#2c2825] font-medium" : "text-[#8c8580]"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Animated step content */}
      <div key={step} className="animate-fade-up">
        <StepComponent {...stepProps} />
      </div>
    </div>
  );
}
