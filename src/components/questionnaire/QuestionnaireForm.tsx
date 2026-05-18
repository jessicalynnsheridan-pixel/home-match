"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionnaireAnswers, LeadScore } from "@/types";
import { createClient } from "@/lib/supabase/client";
import StepVibe from "./steps/StepVibe";
import StepContact from "./steps/StepContact";
import StepTradeoffs from "./steps/StepTradeoffs";
import StepTimeline from "./steps/StepTimeline";
import StepLocation from "./steps/StepLocation";
import StepProperty from "./steps/StepProperty";
import StepFinancials from "./steps/StepFinancials";
import StepNotes from "./steps/StepNotes";
import { ArrowLeft } from "lucide-react";

// ─── Motivational copy shown between steps ─────────────────────────────────────
const STEP_MOMENTS = [
  "Your vibe is taking shape.",
  "Nice to meet you.",
  "Honest instincts. Better matches.",
  "Getting real about timing.",
  "Narrowing in on your world.",
  "What home looks like for you.",
  "Where you stand financially.",
  "Almost there.",
];

const INITIAL: QuestionnaireAnswers = {
  homeFeeling: [],
  sundayMorning: "",
  currentFrustration: [],
  hostingVsPrivacy: "",
  modernVsCozy: "",
  tradeoffSpaceVsLocation: "" as QuestionnaireAnswers["tradeoffSpaceVsLocation"],
  tradeoffPrivacyVsWalkability: "" as QuestionnaireAnswers["tradeoffPrivacyVsWalkability"],
  tradeoffOutdoorVsInterior: "" as QuestionnaireAnswers["tradeoffOutdoorVsInterior"],
  tradeoffQuietVsEnergy: "" as QuestionnaireAnswers["tradeoffQuietVsEnergy"],
  tradeoffNewVsCharacter: "" as QuestionnaireAnswers["tradeoffNewVsCharacter"],
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
  "Your Vibe", "About You", "Trade-offs", "Timeline",
  "Location", "The Home", "Finances", "Anything else",
];

const STEP_COMPONENTS = [
  StepVibe, StepContact, StepTradeoffs, StepTimeline,
  StepLocation, StepProperty, StepFinancials, StepNotes,
];

function scoreAnswers(answers: QuestionnaireAnswers): LeadScore {
  const timeline = answers.timeline;
  const approval = answers.preApprovalStatus;

  const isUrgent = timeline === "ASAP" || timeline === "1–3 months";
  const isFinanced = approval === "Yes, fully approved" || approval === "Paying cash";
  const isInProgress = approval === "In progress";
  const isMidTerm = timeline === "3–6 months";

  if (isUrgent && isFinanced) return "Hot";
  if ((isUrgent && isInProgress) || (isMidTerm && isFinanced)) return "Warm";
  return "Browsing";
}

function calcMatchScore(answers: QuestionnaireAnswers, score: LeadScore): number {
  // Base by score
  const base = score === "Hot" ? 75 : score === "Warm" ? 60 : 50;
  // Bonus for completeness
  let bonus = 0;
  if (answers.preferredCity) bonus += 5;
  if (answers.propertyType) bonus += 5;
  if (answers.budgetMax > answers.budgetMin) bonus += 5;
  if (answers.mustHaves.length > 0) bonus += 5;
  if (answers.preApprovalStatus) bonus += 5;
  return Math.min(95, base + bonus);
}

export default function QuestionnaireForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL);
  const [showMoment, setShowMoment] = useState(false);
  const [momentText, setMomentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const momentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = STEP_LABELS.length;
  const progress = ((step) / totalSteps) * 100;

  useEffect(() => {
    return () => { if (momentTimer.current) clearTimeout(momentTimer.current); };
  }, []);

  function update<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < totalSteps - 1) {
      const text = STEP_MOMENTS[step] || "Your profile is coming together.";
      setMomentText(text);
      setShowMoment(true);
      momentTimer.current = setTimeout(() => {
        setShowMoment(false);
        setStep((s) => s + 1);
      }, 1100);
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      sessionStorage.setItem("homematch_answers", JSON.stringify(answers));
    } catch { /* ignore */ }

    const realtorId = searchParams.get("r");
    if (realtorId) {
      const score = scoreAnswers(answers);
      const matchScore = calcMatchScore(answers, score);
      const supabase = createClient();
      const { error } = await supabase.from("leads").insert({
        realtor_id: realtorId,
        answers,
        score,
        status: "New Lead",
        is_priority: score === "Hot",
        match_score: matchScore,
      });

      if (error) {
        console.error("Lead insert failed:", error.message);
        setSubmitError("Something went wrong saving your profile. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    router.push("/results");
  }

  const StepComponent = STEP_COMPONENTS[step];
  const stepProps = { answers, update, onNext: next, onBack: back, onSubmit: submit, isSubmitting, submitError };

  return (
    <div className="w-full">

      {/* ─── Slim gold progress line ─────────────────────────────────────────── */}
      <div className="h-[3px] bg-[#e8e4de] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #b8956a 0%, #e8c870 50%, #c9a870 100%)", boxShadow: progress > 0 ? "0 0 14px rgba(201,168,112,0.75), 0 0 6px rgba(201,168,112,0.45)" : "none" }}
        />
      </div>

      {/* ─── Step eyebrow + back ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        {step > 0 ? (
          <button
            onClick={back}
            className="flex items-center gap-1.5 text-[#8c8580] hover:text-[#2c2825] transition-colors text-sm"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          <span />
        )}
        <span className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase">
          {STEP_LABELS[step]}
        </span>
        <span className="text-[#b8b4b0] text-xs">
          {step + 1} / {totalSteps}
        </span>
      </div>

      {/* ─── Fullscreen motivational overlay ─────────────────────────────────── */}
      {showMoment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #f8f5f0 0%, #faf9f7 60%, #f5f2ec 100%)" }}>
          <div className="text-center px-8">
            <p className="text-[#2c2825] text-2xl sm:text-3xl font-semibold animate-scale-in leading-tight max-w-xs mx-auto">
              {momentText}
            </p>
            <div className="flex justify-center gap-1.5 mt-8">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-[#b8a88a]" : "bg-[#e0dbd4]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Step content ─────────────────────────────────────────────────────── */}
      <div key={step} className="animate-step-enter">
        <StepComponent {...stepProps} />
      </div>
    </div>
  );
}
