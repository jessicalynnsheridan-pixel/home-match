import type { Listing, QuestionnaireAnswers } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ontarioLTT(price: number): number {
  let tax = 0;
  if (price > 2_000_000) tax += (price - 2_000_000) * 0.025;
  if (price > 400_000) tax += (Math.min(price, 2_000_000) - 400_000) * 0.02;
  if (price > 250_000) tax += (Math.min(price, 400_000) - 250_000) * 0.015;
  if (price > 55_000) tax += (Math.min(price, 250_000) - 55_000) * 0.01;
  tax += Math.min(price, 55_000) * 0.005;
  return Math.round(tax);
}

function calcPayment(price: number, downPct = 0.2, rate = 0.055, years = 25): number {
  const principal = price * (1 - downPct);
  const r = rate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type BudgetComfort = "well within" | "within" | "at the top of" | "slightly over" | "over";

export interface AffordabilitySnapshot {
  monthlyPayment: number;
  propertyTaxMonthly: number;
  utilityEstimate: number;
  totalMonthly: number;
  downPayment: number;
  ltt: number;
  closingCosts: number;
  totalCashAtClose: number;
  budgetComfort: BudgetComfort;
}

export interface LifestyleDimension {
  label: string;
  score: number;     // 0-100
  matched: boolean;
  detail: string;
}

export interface CompatibilityResult {
  overall: number;   // 0-100
  label: string;
  mustHaveHits: string[];
  mustHaveMisses: string[];
  dealBreakerFlags: string[];
  lifestyle: LifestyleDimension[];
  summary: string;
  highlights: string[];
  affordability: AffordabilitySnapshot;
}

export interface ReadinessDimension {
  label: string;
  score: number;    // 0-100 normalised for display
  detail: string;
}

export interface ReadinessResult {
  overall: number;  // 0-100
  label: "Ready to Move" | "Nearly Ready" | "Building Momentum" | "Early Stage";
  financing: ReadinessDimension;
  timeline: ReadinessDimension;
  documentation: ReadinessDimension;
  commitment: ReadinessDimension;
  tip: string;
}

// ─── Affordability ────────────────────────────────────────────────────────────

export function calcAffordabilitySnapshot(
  price: number,
  answers: Partial<QuestionnaireAnswers>,
  sqft?: number,
): AffordabilitySnapshot {
  const payment = Math.round(calcPayment(price));
  const propertyTaxMonthly = Math.round((price * 0.007) / 12);
  const utilityEstimate = sqft
    ? Math.round(150 + Math.max(0, (sqft - 1000) / 100) * 15)
    : 280;
  const totalMonthly = payment + propertyTaxMonthly + utilityEstimate;
  const downPayment = Math.round(price * 0.2);
  const ltt = ontarioLTT(price);
  const closingCosts = Math.round(price * 0.015);
  const totalCashAtClose = downPayment + ltt + closingCosts;

  const budgetMax = answers.budgetMax || 0;
  const budgetMin = answers.budgetMin || 0;
  let budgetComfort: BudgetComfort = "within";

  if (budgetMax > 0) {
    const mid = (budgetMin + budgetMax) / 2;
    if (price <= mid) budgetComfort = "well within";
    else if (price <= budgetMax) budgetComfort = "within";
    else if (price <= budgetMax * 1.05) budgetComfort = "at the top of";
    else if (price <= budgetMax * 1.15) budgetComfort = "slightly over";
    else budgetComfort = "over";
  }

  return {
    monthlyPayment: payment,
    propertyTaxMonthly,
    utilityEstimate,
    totalMonthly,
    downPayment,
    ltt,
    closingCosts,
    totalCashAtClose,
    budgetComfort,
  };
}

// ─── Buyer Readiness ──────────────────────────────────────────────────────────

export function calcBuyerReadiness(answers: Partial<QuestionnaireAnswers>): ReadinessResult {
  // Financing (raw 0-40)
  const preApproval = answers.preApprovalStatus || "";
  let fin = 5;
  let finDetail = "Pre-approval not yet started";
  if (preApproval === "Yes, fully approved") { fin = 40; finDetail = "Fully pre-approved and ready"; }
  else if (preApproval === "Paying cash") { fin = 40; finDetail = "Cash buyer, no financing needed"; }
  else if (preApproval === "In progress") { fin = 22; finDetail = "Pre-approval in progress"; }

  // Timeline (raw 0-25)
  const timeline = answers.timeline || "";
  let tim = 2;
  let timDetail = "No timeline set";
  if (timeline === "ASAP") { tim = 25; timDetail = "Actively searching now"; }
  else if (timeline === "1-3 months") { tim = 20; timDetail = "Ready within 3 months"; }
  else if (timeline === "3-6 months") { tim = 13; timDetail = "Planning for 3-6 months out"; }
  else if (timeline === "6-12 months") { tim = 7; timDetail = "Looking ahead 6-12 months"; }
  else if (timeline === "Just exploring") { tim = 2; timDetail = "Early research stage"; }

  // Documentation (raw 0-20)
  const checklist = answers.mortgageChecklist || [];
  const done = checklist.filter((i) => i.completed).length;
  const total = checklist.length || 8;
  const doc = Math.round((done / total) * 20);
  const docDetail = checklist.length > 0
    ? `${done} of ${total} documents ready`
    : "Mortgage checklist not started";

  // Commitment (raw 0-15)
  const ownership = answers.ownershipStatus || "";
  let com = 8;
  let comDetail = "Ownership situation not specified";
  if (ownership === "First-time buyer") { com = 15; comDetail = "No sale contingency needed"; }
  else if (ownership === "Renting") { com = 15; comDetail = "Flexible timing, no sale needed"; }
  else if (ownership === "Own (can buy independently)") { com = 12; comDetail = "Can buy without selling first"; }
  else if (ownership === "Own (need to sell first)") { com = 6; comDetail = "Sale of current home required"; }

  const rawTotal = fin + tim + doc + com;
  const overall = Math.min(100, rawTotal);

  let label: ReadinessResult["label"] = "Early Stage";
  if (overall >= 80) label = "Ready to Move";
  else if (overall >= 60) label = "Nearly Ready";
  else if (overall >= 40) label = "Building Momentum";

  // Weakest dimension determines the tip
  const dims = [
    { name: "financing", pct: fin / 40 },
    { name: "timeline", pct: tim / 25 },
    { name: "documentation", pct: doc / 20 },
    { name: "commitment", pct: com / 15 },
  ];
  const weakest = dims.reduce((a, b) => (a.pct < b.pct ? a : b));

  const TIPS: Record<string, string> = {
    financing: preApproval === "Not yet"
      ? "Getting pre-approved is the single most impactful step right now. Most sellers won't consider an offer without it."
      : "Follow up with your lender to finalize your pre-approval before rates shift.",
    timeline: "Setting a clear buying timeline helps you and your realtor stay focused and avoids missing the right property.",
    documentation: "Complete your mortgage document checklist. Having everything ready cuts approval time significantly.",
    commitment: "If you need to sell your current home first, speaking to a listing agent now reduces pressure later.",
  };

  return {
    overall,
    label,
    financing: { label: "Financing", score: Math.round((fin / 40) * 100), detail: finDetail },
    timeline: { label: "Timeline", score: Math.round((tim / 25) * 100), detail: timDetail },
    documentation: { label: "Documentation", score: Math.round((doc / 20) * 100), detail: docDetail },
    commitment: { label: "Commitment", score: Math.round((com / 15) * 100), detail: comDetail },
    tip: TIPS[weakest.name],
  };
}

// ─── Buyer Compatibility ──────────────────────────────────────────────────────

export function calcBuyerCompatibility(
  listing: Listing,
  answers: Partial<QuestionnaireAnswers>,
): CompatibilityResult {
  const affordability = calcAffordabilitySnapshot(listing.price, answers, listing.sqft);

  // Build a single searchable string from listing data
  const listingText = [
    ...listing.features,
    listing.description,
    listing.neighbourhood,
    listing.city,
    listing.basement,
    listing.garage,
  ].join(" ").toLowerCase();

  const has = (term: string) => listingText.includes(term.toLowerCase());

  // ── Budget (0-35) ──────────────────────────────────────────────────────────
  let budgetScore = 0;
  const bMax = answers.budgetMax || 0;
  const bMin = answers.budgetMin || 0;
  if (bMax > 0) {
    if (listing.price >= bMin && listing.price <= bMax) budgetScore = 35;
    else if (listing.price < bMin) budgetScore = 22;
    else if (listing.price <= bMax * 1.07) budgetScore = 14;
    else if (listing.price <= bMax * 1.15) budgetScore = 7;
  } else {
    budgetScore = 18; // neutral when no budget set
  }

  // ── Location (0-20) ────────────────────────────────────────────────────────
  let locationScore = 0;
  const prefCity = (answers.preferredCity || "").toLowerCase();
  const prefHoods = (answers.preferredNeighbourhoods || "").toLowerCase();
  if (prefCity && listing.city.toLowerCase().includes(prefCity)) locationScore += 15;
  else if (prefCity) locationScore += 4;
  if (prefHoods) {
    const hoods = prefHoods.split(",").map((h) => h.trim()).filter(Boolean);
    if (hoods.some((h) => listing.neighbourhood.toLowerCase().includes(h))) locationScore += 5;
  }

  // ── Property (0-15) ────────────────────────────────────────────────────────
  let propertyScore = 0;
  if (answers.propertyType && listing.propertyType === answers.propertyType) propertyScore += 10;
  if (answers.bedrooms && listing.bedrooms >= answers.bedrooms) propertyScore += 5;

  // ── Must-haves (0-20) ──────────────────────────────────────────────────────
  const mustHaves = answers.mustHaves || [];
  const mustHaveHits: string[] = [];
  const mustHaveMisses: string[] = [];

  for (const must of mustHaves) {
    const words = must.toLowerCase().split(" ").filter((w) => w.length > 3);
    const matched = words.some((w) => has(w));
    if (matched) mustHaveHits.push(must);
    else mustHaveMisses.push(must);
  }

  const mustHaveScore = mustHaves.length > 0
    ? Math.round((mustHaveHits.length / mustHaves.length) * 20)
    : 10;

  // ── Deal breakers (penalty) ────────────────────────────────────────────────
  const dealBreakers = answers.dealBreakers || [];
  const dealBreakerFlags: string[] = [];
  for (const db of dealBreakers) {
    const words = db.toLowerCase().split(" ").filter((w) => w.length > 3);
    if (words.some((w) => has(w))) dealBreakerFlags.push(db);
  }

  // ── Lifestyle dimensions ───────────────────────────────────────────────────
  const lifestyle: LifestyleDimension[] = [];
  const mustL = (m: string) => mustHaves.some((h) => h.toLowerCase().includes(m));
  const lifeL = (l: string) => (answers.lifestylePriorities || []).some((p) => p.toLowerCase().includes(l));
  const vibeL = (v: string) => (answers.neighbourhoodVibe || []).some((n) => n.toLowerCase().includes(v));
  const proxL = (p: string) => (answers.proximityPriorities || []).some((x) => x.toLowerCase().includes(p));

  // Work from Home
  if (mustL("office")) {
    const matched = has("office");
    lifestyle.push({
      label: "Work from Home",
      score: matched ? 100 : 20,
      matched,
      detail: matched ? "Dedicated home office included" : "No home office listed, worth confirming",
    });
  }

  // Schools
  if (answers.schoolDistrictImportance === "Very important" || proxL("school")) {
    const matched = has("school") || has("district");
    lifestyle.push({
      label: "School District",
      score: matched ? 100 : 30,
      matched,
      detail: matched ? "Strong school zone confirmed" : "School district not highlighted, verify before deciding",
    });
  }

  // Walkability
  if (lifeL("walk") || vibeL("walk")) {
    const matched = has("walkable") || has("steps to") || has("walking distance") || has("village");
    lifestyle.push({
      label: "Walkability",
      score: matched ? 90 : 35,
      matched,
      detail: matched ? "Walkable to shops, dining, or transit" : "Primarily car-dependent location",
    });
  }

  // Outdoor living
  if (mustL("backyard") || mustL("garden") || mustL("deck") || mustL("pool") || lifeL("outdoor") || lifeL("entertain")) {
    const matched = has("backyard") || has("garden") || has("terrace") || has("deck") || has("pool") || has("outdoor");
    lifestyle.push({
      label: "Outdoor Living",
      score: matched ? 100 : 25,
      matched,
      detail: matched ? "Private outdoor space available" : "Outdoor space not prominently featured",
    });
  }

  // Transit
  if (proxL("transit") || (answers.commutePreferences || "").toLowerCase().includes("go")) {
    const matched = has("go ") || has("station") || has("transit") || has("train");
    lifestyle.push({
      label: "Transit Access",
      score: matched ? 95 : 20,
      matched,
      detail: matched ? "Near GO or public transit" : "Transit access not highlighted",
    });
  }

  // Quiet neighbourhood
  if (vibeL("quiet") || lifeL("quiet")) {
    const matched = has("quiet") || has("residential") || has("tree-lined");
    lifestyle.push({
      label: "Quiet Neighbourhood",
      score: matched ? 95 : 45,
      matched,
      detail: matched ? "Quiet, residential character confirmed" : "Neighbourhood noise level not specified",
    });
  }

  // Green space
  if (lifeL("green") || proxL("park")) {
    const matched = has("park") || has("trail") || has("green") || has("ravine") || has("nature");
    lifestyle.push({
      label: "Green Space",
      score: matched ? 90 : 40,
      matched,
      detail: matched ? "Parks or trails nearby" : "Green space proximity not mentioned",
    });
  }

  // ── Overall ────────────────────────────────────────────────────────────────
  const rawScore = budgetScore + locationScore + propertyScore + mustHaveScore;
  const penalty = dealBreakerFlags.length * 12;
  const overall = Math.max(0, Math.min(100, rawScore - penalty));

  let label = "Low Match";
  if (overall >= 85) label = "Exceptional Match";
  else if (overall >= 70) label = "Strong Match";
  else if (overall >= 55) label = "Good Match";
  else if (overall >= 35) label = "Partial Match";

  // ── Highlights ─────────────────────────────────────────────────────────────
  const highlights: string[] = [];
  const bc = affordability.budgetComfort;

  if (bc === "well within") highlights.push("Priced well within your budget with room to negotiate");
  else if (bc === "within") highlights.push("Falls within your stated budget range");
  else if (bc === "at the top of") highlights.push("Near the top of your budget, but within reach");
  else if (bc === "slightly over") highlights.push("Slightly above your budget - worth discussing");

  if (locationScore >= 15) highlights.push(`Located in ${listing.city}, your preferred area`);
  if (locationScore >= 20) highlights.push(`In ${listing.neighbourhood}, one of your listed neighbourhoods`);

  if (mustHaveHits.length > 0) {
    highlights.push(`Matches your must-haves: ${mustHaveHits.slice(0, 3).join(", ")}`);
  }
  if (mustHaveMisses.length > 0 && mustHaveMisses.length <= 2) {
    highlights.push(`Worth confirming: ${mustHaveMisses.join(", ")}`);
  }

  const topLife = lifestyle.find((l) => l.matched);
  if (topLife) highlights.push(topLife.detail);

  if (dealBreakerFlags.length > 0) {
    highlights.push(`Flagged for review: ${dealBreakerFlags[0]}`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const parts: string[] = [];

  if (bMax > 0) {
    if (bc === "well within") parts.push("Priced well within your budget");
    else if (bc === "within") parts.push("Fits your budget range");
    else if (bc === "at the top of") parts.push("Near the top of your budget but within reach");
    else parts.push("Above your stated budget");
  }

  if (locationScore >= 15) {
    parts.push(`located in ${listing.city}${prefCity ? ", your preferred area" : ""}`);
  }

  if (mustHaves.length > 0) {
    const pct = Math.round((mustHaveHits.length / mustHaves.length) * 100);
    if (pct === 100) parts.push(`checking all ${mustHaves.length} of your must-haves`);
    else if (pct >= 50) parts.push(`covering ${mustHaveHits.length} of ${mustHaves.length} must-haves`);
    else parts.push(`meeting ${mustHaveHits.length} of your ${mustHaves.length} must-haves`);
  }

  let summary = parts.length > 0
    ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + (parts.length > 1 ? ", " + parts.slice(1).join(", ") + "." : ".")
    : "Review the breakdown below to see how this home aligns with your profile.";

  if (dealBreakerFlags.length > 0) {
    summary += ` One item flagged for review: ${dealBreakerFlags[0]}.`;
  }

  return {
    overall,
    label,
    mustHaveHits,
    mustHaveMisses,
    dealBreakerFlags,
    lifestyle,
    summary,
    highlights,
    affordability,
  };
}
