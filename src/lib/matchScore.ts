import { QuestionnaireAnswers } from "@/types";

// ─── Buyer Match Score (0–100) ────────────────────────────────────────────
// Measures how purchase-ready a buyer is based on their questionnaire answers.
// Higher = more motivated, qualified, and ready to transact.

export interface ScoreBreakdown {
  total: number;
  preApproval: number;
  timeline: number;
  budget: number;
  completeness: number;
  engagement: number;
}

export function calculateMatchScore(a: QuestionnaireAnswers): ScoreBreakdown {
  let preApproval = 0;
  switch (a.preApprovalStatus) {
    case "Yes, fully approved": preApproval = 30; break;
    case "Paying cash":         preApproval = 30; break;
    case "In progress":         preApproval = 16; break;
    case "Not yet":             preApproval = 5;  break;
  }

  let timeline = 0;
  switch (a.timeline) {
    case "ASAP":           timeline = 25; break;
    case "1–3 months":     timeline = 22; break;
    case "3–6 months":     timeline = 14; break;
    case "6–12 months":    timeline = 7;  break;
    case "Just exploring": timeline = 2;  break;
  }

  // Budget: reward specificity (range < $600k spread = focused buyer)
  let budget = 0;
  if (a.budgetMin > 0 && a.budgetMax > 0) {
    const spread = a.budgetMax - a.budgetMin;
    budget = spread <= 300000 ? 20 : spread <= 600000 ? 14 : spread <= 1000000 ? 8 : 4;
  }

  // Completeness: key fields filled out
  const keyFields = [
    a.firstName, a.email, a.phone, a.preferredCity,
    a.propertyType, a.timeline, a.preApprovalStatus, a.ownershipStatus,
  ];
  const filled = keyFields.filter(Boolean).length;
  const completeness = Math.round((filled / keyFields.length) * 15);

  // Engagement: must-haves, deal breakers, lifestyle priorities, notes
  let engagement = 0;
  if (a.mustHaves.length >= 3)          engagement += 4;
  if (a.dealBreakers.length >= 1)       engagement += 3;
  if (a.lifestylePriorities.length >= 2) engagement += 3;
  if (a.additionalNotes.length > 30)    engagement += 2;
  // cap at 10
  engagement = Math.min(engagement, 10);

  const total = Math.min(100, preApproval + timeline + budget + completeness + engagement);

  return { total, preApproval, timeline, budget, completeness, engagement };
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Browsing";
}

export function scoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 80) return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
  if (score >= 50) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
}

export function generateDreamHomeProfile(a: QuestionnaireAnswers): string {
  const name = a.firstName || "This buyer";
  const type = a.propertyType || "home";
  const city = a.preferredCity || "their preferred city";
  const hoods = a.preferredNeighbourhoods || "select neighbourhoods";
  const beds = a.bedrooms;
  const budget = a.budgetMax
    ? `up to $${(a.budgetMax / 1000000).toFixed(1).replace(".0", "")}M`
    : "within their stated budget";
  const timeline = a.timeline ? `within ${a.timeline.toLowerCase()}` : "in the near term";
  const mustHaveList = a.mustHaves.slice(0, 3).join(", ") || "specific home features";
  const vibe = a.neighbourhoodVibe?.slice(0, 2).join(" and ").toLowerCase() || "well-suited";
  const purpose = a.investmentOrPersonal?.toLowerCase() || "personal use";

  return `${name} is searching for a ${beds}-bedroom ${type.toLowerCase()} in ${city}, ` +
    `with a focus on ${hoods}. They are looking for a ${vibe} neighbourhood and ` +
    `hope to purchase ${timeline} ${budget}. Key priorities include ${mustHaveList}. ` +
    `This purchase is intended for ${purpose}. ${
      a.additionalNotes
        ? `Additional context: ${a.additionalNotes.slice(0, 120)}${a.additionalNotes.length > 120 ? "…" : ""}`
        : ""
    }`;
}
