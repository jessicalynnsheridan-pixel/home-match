import type { QuestionnaireAnswers } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommunicationStyle = "Analytical" | "Visionary" | "Decisive" | "Cautious";
export type MotivationTier = "High" | "Medium" | "Low";
export type FollowUpChannel = "email" | "call" | "text";

export interface StyleProfile {
  type: CommunicationStyle;
  headline: string;
  description: string;
  realtorTip: string;
}

export interface MotivationProfile {
  tier: MotivationTier;
  score: number; // 0–100
  signals: string[];
}

export interface EmotionalTrigger {
  label: string;
  detail: string;
}

export interface HesitationPoint {
  label: string;
  detail: string;
  suggestion: string;
}

export interface ToneGuide {
  title: string;
  description: string;
  dos: string[];
  donts: string[];
}

export interface FollowUpSuggestion {
  id: string;
  timing: string;
  channel: FollowUpChannel;
  subject: string;
  message: string;
  rationale: string;
  urgent: boolean;
}

export interface RecoveryPrompt {
  subject: string;
  message: string;
  rationale: string;
}

export interface BuyerIntelligence {
  style: StyleProfile;
  motivation: MotivationProfile;
  triggers: EmotionalTrigger[];
  hesitations: HesitationPoint[];
  toneGuide: ToneGuide;
  followUpSuggestions: FollowUpSuggestion[];
  recoveryPrompt?: RecoveryPrompt;
  summaryLine: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function contains(haystack: string[], ...needles: string[]): boolean {
  const joined = haystack.join(" ").toLowerCase();
  return needles.some((n) => joined.includes(n.toLowerCase()));
}

function notesContain(notes: string, ...words: string[]): boolean {
  const lower = notes.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function completionRate(checklist: { completed: boolean }[]): number {
  if (!checklist.length) return 0;
  return checklist.filter((i) => i.completed).length / checklist.length;
}

// ─── Communication Style ──────────────────────────────────────────────────────

function deriveStyle(a: QuestionnaireAnswers): StyleProfile {
  const scores: Record<CommunicationStyle, number> = {
    Analytical: 0,
    Visionary: 0,
    Decisive: 0,
    Cautious: 0,
  };

  const allLists = [...a.mustHaves, ...a.lifestylePriorities, ...a.dealBreakers, ...a.neighbourhoodVibe];
  const notes = a.additionalNotes || "";

  // Analytical signals
  if (["Yes, fully approved", "Paying cash"].includes(a.preApprovalStatus)) scores.Analytical += 22;
  if (notes.length > 200) scores.Analytical += 15;
  if (completionRate(a.mortgageChecklist) > 0.5) scores.Analytical += 15;
  if (a.investmentOrPersonal === "Investment" || a.investmentOrPersonal === "Both") scores.Analytical += 18;
  if (contains(allLists, "inspection", "energy efficient", "permits", "garage", "sqft")) scores.Analytical += 10;
  if (notesContain(notes, "numbers", "data", "research", "analysis", "market")) scores.Analytical += 12;

  // Visionary signals
  if (a.lifestylePriorities.length >= 4) scores.Visionary += 20;
  if (contains(allLists, "outdoor", "entertain", "garden", "open concept", "light", "character", "charm", "aesthetic", "design")) scores.Visionary += 22;
  if (a.investmentOrPersonal === "Personal use") scores.Visionary += 10;
  if (notesContain(notes, "dream", "love", "feel", "vibe", "aesthetic", "imagine", "picture", "vision")) scores.Visionary += 18;
  if (a.neighbourhoodVibe.length >= 3) scores.Visionary += 10;
  if (contains(a.proximityPriorities, "parks", "shops", "cafes", "community")) scores.Visionary += 10;

  // Decisive signals
  if (a.timeline === "ASAP" || a.timeline === "1–3 months") scores.Decisive += 32;
  if (a.mustHaves.length >= 5) scores.Decisive += 12;
  if (a.dealBreakers.length >= 3) scores.Decisive += 12;
  if (["Yes, fully approved", "Paying cash"].includes(a.preApprovalStatus)) scores.Decisive += 14;
  if (a.budgetMax > 0 && a.budgetMin > 0 && (a.budgetMax - a.budgetMin) < 150_000) scores.Decisive += 14;
  if (notesContain(notes, "ready", "need to move", "asap", "quickly", "can't wait")) scores.Decisive += 10;

  // Cautious signals
  if (a.ownershipStatus === "First-time buyer") scores.Cautious += 28;
  if (a.preApprovalStatus === "Not yet") scores.Cautious += 22;
  if (a.timeline === "Just exploring") scores.Cautious += 28;
  if (completionRate(a.mortgageChecklist) < 0.25) scores.Cautious += 10;
  if (notesContain(notes, "nervous", "overwhelmed", "not sure", "uncertain", "worried", "confused", "don't know")) scores.Cautious += 14;

  const winner = (Object.keys(scores) as CommunicationStyle[]).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  const PROFILES: Record<CommunicationStyle, Omit<StyleProfile, "type">> = {
    Analytical: {
      headline: "Data-driven and deliberate",
      description:
        "This buyer thinks in numbers. They've done research, they compare options, and they want to feel like they're making a defensible decision. Ambiguity makes them uncomfortable.",
      realtorTip:
        "Lead with market data, list-to-sale ratios, and days on market. Send a comparison sheet before showings. Give them time to process — don't rush toward a decision.",
    },
    Visionary: {
      headline: "Lifestyle-led and emotionally driven",
      description:
        "This buyer is buying a feeling as much as a property. They respond to story, staging, and atmosphere. Specs matter less than whether a home 'feels right.'",
      realtorTip:
        "Paint pictures, not specs. Describe how a home lives, not just what it has. When you find something that matches their lifestyle, frame it in their language.",
    },
    Decisive: {
      headline: "Direct, ready to move",
      description:
        "This buyer knows what they want and is ready to act. They don't need to be sold — they need to be shown the right options fast, with minimal friction in the process.",
      realtorTip:
        "Keep communication short and action-focused. Present options quickly. Have the offer paperwork ready before they ask. Overthinking the relationship costs you the deal.",
    },
    Cautious: {
      headline: "Needs guidance and reassurance",
      description:
        "This buyer is either early in their journey or carrying anxiety about the process. They want to feel informed, not pressured. Trust is built slowly and lost quickly.",
      realtorTip:
        "Educate before you sell. Break the process into small, clear steps. Never push toward a decision — let them arrive there. Being the calm, consistent voice is your competitive advantage.",
    },
  };

  return { type: winner, ...PROFILES[winner] };
}

// ─── Motivation ───────────────────────────────────────────────────────────────

function deriveMotivation(a: QuestionnaireAnswers): MotivationProfile {
  let raw = 0;
  const signals: string[] = [];

  const timelineMap: Record<string, number> = {
    ASAP: 35,
    "1–3 months": 28,
    "3–6 months": 18,
    "6–12 months": 10,
    "Just exploring": 3,
  };
  if (a.timeline && timelineMap[a.timeline] !== undefined) {
    raw += timelineMap[a.timeline];
    if (timelineMap[a.timeline] >= 28) signals.push(`Buying within ${a.timeline}`);
    else if (timelineMap[a.timeline] <= 5) signals.push("Still in early exploration mode");
  }

  const preMap: Record<string, number> = {
    "Yes, fully approved": 25,
    "Paying cash": 25,
    "In progress": 15,
    "Not yet": 5,
  };
  if (a.preApprovalStatus && preMap[a.preApprovalStatus] !== undefined) {
    raw += preMap[a.preApprovalStatus];
    if (preMap[a.preApprovalStatus] === 25) signals.push("Financing fully sorted");
    else if (a.preApprovalStatus === "Not yet") signals.push("No pre-approval yet");
  }

  const ownerMap: Record<string, number> = {
    Renting: 20,
    "First-time buyer": 15,
    "Own (can buy independently)": 12,
    "Own (need to sell first)": 8,
  };
  if (a.ownershipStatus && ownerMap[a.ownershipStatus] !== undefined) {
    raw += ownerMap[a.ownershipStatus];
    if (a.ownershipStatus === "Renting") signals.push("Renting now — motivated to own");
    if (a.ownershipStatus === "Own (need to sell first)") signals.push("Must sell current home first");
  }

  if (a.mustHaves.length >= 5) { raw += 12; signals.push("Highly specific must-have list"); }
  else if (a.mustHaves.length >= 3) { raw += 7; }

  if ((a.additionalNotes || "").length > 150) { raw += 8; signals.push("Detailed, invested questionnaire responses"); }

  const score = Math.min(100, Math.round((raw / 92) * 100));
  const tier: MotivationTier = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";

  return { tier, score, signals };
}

// ─── Emotional Triggers ───────────────────────────────────────────────────────

function deriveTriggers(a: QuestionnaireAnswers): EmotionalTrigger[] {
  const all = [
    ...a.mustHaves,
    ...a.lifestylePriorities,
    ...a.neighbourhoodVibe,
    ...a.proximityPriorities,
    a.additionalNotes,
    a.commutePreferences,
  ].join(" ").toLowerCase();

  const triggers: EmotionalTrigger[] = [];

  if (/school|kids|children|family|education/.test(all))
    triggers.push({ label: "Family safety and education", detail: "School quality and neighbourhood safety are core to this decision, not just preferences." });

  if (/outdoor|backyard|garden|entertain|patio|deck|bbq|pool/.test(all))
    triggers.push({ label: "Outdoor living and entertaining", detail: "They picture themselves using outdoor space regularly. Homes with strong outdoor flow will land emotionally." });

  if (/office|wfh|work from home|remote|zoom|studio|quiet/.test(all))
    triggers.push({ label: "Productive home environment", detail: "Work-from-home setup matters to this buyer. A dedicated space signals long-term livability, not just square footage." });

  if (/kitchen|chef|cook|bake|entertain|dinner/.test(all))
    triggers.push({ label: "Kitchen as the heart of the home", detail: "The kitchen is an emotional anchor. Homes with premium kitchen setups should be surfaced first when relevant." });

  if (/quiet|peaceful|private|calm|retreat|sanctuary/.test(all))
    triggers.push({ label: "Privacy and retreat", detail: "This buyer is looking for a home that feels like an escape. Busy streets, shared walls, or open-plan noise may be dealbreakers." });

  if (/walkable|walk|transit|commute|subway|bike|cycling/.test(all))
    triggers.push({ label: "Connected neighbourhood life", detail: "Getting around without a car — or having easy commute options — carries real emotional weight for this buyer." });

  if (/park|green|nature|trail|ravine|trees|outdoor space/.test(all))
    triggers.push({ label: "Nature and green space", detail: "Proximity to green space isn't a bonus — it's a quality-of-life requirement. Ravines, parks, and trails are genuine selling points." });

  if (/investment|equity|value|appreciation|roi|rent/.test(all))
    triggers.push({ label: "Building equity and long-term value", detail: "This buyer thinks about a purchase in terms of financial trajectory, not just lifestyle. Neighbourhood trajectory matters." });

  if (/modern|contemporary|design|aesthetic|style|character|charm|farmhouse|heritage/.test(all))
    triggers.push({ label: "Home style and identity", detail: "This buyer wants to live in a home that reflects who they are. Architectural style and finishes are not superficial — they're part of the decision." });

  return triggers.slice(0, 5);
}

// ─── Hesitation Points ────────────────────────────────────────────────────────

function deriveHesitations(a: QuestionnaireAnswers): HesitationPoint[] {
  const h: HesitationPoint[] = [];

  if (a.preApprovalStatus === "Not yet") {
    h.push({
      label: "Financing not confirmed",
      detail: "They don't yet have a pre-approval, which often signals uncertainty about qualification, not just process delay. This can stall momentum right before an offer.",
      suggestion: "Offer to connect them with a trusted mortgage broker — frame it as getting clarity, not commitment. 'Knowing your real number makes everything easier, even if you're not ready to buy tomorrow.'",
    });
  }

  if (a.ownershipStatus === "Own (need to sell first)") {
    h.push({
      label: "Sale contingency creates complexity",
      detail: "They're in a two-sided transaction, which brings coordination anxiety, timing risk, and fear of being caught without a home or stuck with two mortgages.",
      suggestion: "Acknowledge the coordination challenge early and walk them through bridge financing options. Make the process feel manageable — most buyers in this situation just need a realistic plan laid out.",
    });
  }

  if (a.ownershipStatus === "First-time buyer" || a.preApprovalStatus === "Not yet") {
    h.push({
      label: "Process unfamiliarity and overwhelm",
      detail: "Too many steps, too much jargon. First-time buyers often stall not because they're not ready, but because the volume of decisions feels paralyzing.",
      suggestion: "Break the path into three or four clear stages. Celebrate every milestone. Never assume knowledge — explain what's normal and what requires action.",
    });
  }

  if (a.timeline === "Just exploring") {
    h.push({
      label: "Not emotionally ready to commit",
      detail: "They've started the process, but they haven't arrived at a feeling of readiness yet. Pushing showings or offers too early will push them away.",
      suggestion: "Focus on education and relationship-building, not conversion. Stay in their orbit with low-pressure value (market updates, neighbourhood profiles) until they signal readiness.",
    });
  }

  if (a.budgetMax > 0 && a.budgetMin > 0 && (a.budgetMax - a.budgetMin) > 300_000) {
    h.push({
      label: "Wide budget range signals price sensitivity",
      detail: "A wide budget window often means they're not yet sure what they can comfortably afford — or they're afraid to anchor to a number. Affordability anxiety may be present.",
      suggestion: "Have an honest, empathetic conversation about their comfort zone, not just their approval number. Help them understand what different price points actually deliver in their market.",
    });
  }

  if (completionRate(a.mortgageChecklist) < 0.3 && a.preApprovalStatus !== "Yes, fully approved" && a.preApprovalStatus !== "Paying cash") {
    h.push({
      label: "Documentation gaps could delay an offer",
      detail: "Their mortgage checklist is mostly incomplete. If they find the right home, they may not be ready to move fast — creating frustration or losing the deal.",
      suggestion: "Proactively share the checklist and frame it as 'pre-loading the work so when the right home shows up, you're ready to move.' Make it feel like a competitive advantage, not a chore.",
    });
  }

  return h.slice(0, 4);
}

// ─── Follow-up Tone Guide ─────────────────────────────────────────────────────

function deriveToneGuide(style: CommunicationStyle, tier: MotivationTier): ToneGuide {
  const guides: Record<CommunicationStyle, ToneGuide> = {
    Analytical: {
      title: "Lead with data, follow with logic",
      description: "This buyer wants to feel smart about their decision. Give them information they can analyze, not enthusiasm they have to trust.",
      dos: [
        "Open with market data and comparable sales",
        "Send a written summary they can review at their own pace",
        "Acknowledge tradeoffs honestly — they respect nuance",
        "Give them time to process before asking for decisions",
        "Use specifics: price per sqft, days on market, school ratings",
      ],
      donts: [
        "Push urgency before they've processed the numbers",
        "Lead with emotional language or lifestyle pitch",
        "Leave key questions unanswered hoping they won't ask",
        "Call without warning — they prefer email or scheduled calls",
        "Summarize listings with vague praise ('gorgeous home')",
      ],
    },
    Visionary: {
      title: "Paint the picture before showing the price",
      description: "This buyer is buying a feeling. The moment a home connects emotionally, logic follows. Lead with story and lifestyle, not specs.",
      dos: [
        "Describe how a home lives, not just what it has",
        "Reference specifics from their questionnaire in every touchpoint",
        "Share photos and neighbourhood atmosphere, not just listing sheets",
        "Celebrate the emotional wins ('I think this is the one worth seeing')",
        "Give them space to form their own picture before asking what they think",
      ],
      donts: [
        "Lead with price-per-sqft before they've connected emotionally",
        "Send listings with just numbers and no narrative",
        "Dismiss their aesthetic preferences as trivial",
        "Overwhelm them with too many options at once",
        "Move to offer talk before they've said they love it",
      ],
    },
    Decisive: {
      title: "Respect their time, move at their pace",
      description: "This buyer is ahead of you. They don't need relationship-building — they need access and speed. Cut to what matters.",
      dos: [
        "Keep messages short and action-focused",
        "Front-load the key information in every communication",
        "Have offer paperwork and steps ready before they ask",
        "Give them two options, not five — they want to choose, not browse",
        "Confirm next steps at the end of every interaction",
      ],
      donts: [
        "Over-explain things they already know",
        "Slow down to 'build rapport' when they're ready to act",
        "Send long emails with lots of preamble",
        "Delay responses — their patience for slow follow-through is low",
        "Repeat yourself across multiple touchpoints",
      ],
    },
    Cautious: {
      title: "Nurture first, transact second",
      description: "This buyer needs to feel guided and never rushed. Pressure is the surest way to lose them. Build trust through consistency and clarity.",
      dos: [
        "Explain each step before it happens — no surprises",
        "Validate their pace ('taking your time is completely normal')",
        "Share educational resources that reduce anxiety",
        "Check in without asking for anything in return",
        "Be the most patient person in the process",
      ],
      donts: [
        "Apply urgency or scarcity pressure of any kind",
        "Skip over the 'why' of any recommendation or step",
        "Express frustration if they slow down or go quiet",
        "Make them feel behind or underprepared",
        "Assume readiness — always test where they are first",
      ],
    },
  };

  const guide = { ...guides[style] };

  if (tier === "High" && style === "Cautious") {
    guide.description += " Despite their high motivation score, approach carefully — enthusiasm can tip into overwhelm.";
  }
  if (tier === "Low" && style === "Decisive") {
    guide.description += " Note: their motivation reads low right now. Avoid pushing hard — find out what's causing the pause.";
  }

  return guide;
}

// ─── Follow-up Suggestions ────────────────────────────────────────────────────

function deriveFollowUpSuggestions(
  a: QuestionnaireAnswers,
  style: CommunicationStyle,
  tier: MotivationTier,
  daysSince: number,
): FollowUpSuggestion[] {
  const { firstName, preferredCity, mustHaves, budgetMin, budgetMax, timeline, preApprovalStatus } = a;

  const topMustHave = mustHaves[0] || "the features on your list";
  const budgetMid = budgetMin && budgetMax ? Math.round((budgetMin + budgetMax) / 2) : null;
  const budgetStr = budgetMid
    ? new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(budgetMid)
    : "your budget";
  const city = preferredCity || "your target area";

  const suggestions: FollowUpSuggestion[] = [];

  // Suggestion 1: First touch
  const touch1: Record<CommunicationStyle, FollowUpSuggestion> = {
    Analytical: {
      id: "s1-analytical",
      timing: "Within 24 hours",
      channel: "email",
      subject: `Your profile — a few numbers worth knowing`,
      message: `Hi ${firstName},\n\nI went through your questionnaire this morning and wanted to get in touch quickly.\n\nGiven your budget and what's currently active in ${city}, I'm already tracking 3–4 properties that hit your criteria. Before I send them over, I want to pull together a quick comparison — price per sqft, days on market, and how each one stacks up against your must-haves.\n\nWould a 15-minute call work this week? I'd rather walk you through the numbers than just send a list.`,
      rationale: "Analytical buyers respond to preparation and substance over warmth. Mentioning you've already done work signals competence.",
      urgent: tier === "High",
    },
    Visionary: {
      id: "s1-visionary",
      timing: "Within 24 hours",
      channel: "email",
      subject: `I read your questionnaire — I have a clear picture`,
      message: `Hi ${firstName},\n\nI went through what you shared and loved the detail you put into it. The combination of ${topMustHave} and the neighbourhood feel you're describing gives me a really clear picture of what we're looking for.\n\nI've already been keeping notes on a few homes that came to mind while reading. Nothing to show just yet, but I want to set up a quick call so I understand the full picture before I start sending you options.\n\nWhen works best for you this week?`,
      rationale: "Visionary buyers need to feel seen and understood before they trust your recommendations. Reference the specific things they wrote.",
      urgent: false,
    },
    Decisive: {
      id: "s1-decisive",
      timing: "Within 24 hours",
      channel: "call",
      subject: `Ready to book showings this week`,
      message: `Hi ${firstName}, it's [your name] from [brokerage]. I went through your profile — you're well-prepared and I have a couple of properties already worth your time.\n\nI know your timeline is ${timeline || "tight"}, so I'd rather move quickly than set up a long discovery call. Are you free for showings this week, or would Saturday work better?\n\nIf you prefer, I can also send a quick shortlist by email first.`,
      rationale: "Decisive buyers don't want rapport-building before action. Show them you're ready to move and offer a choice between two next steps.",
      urgent: true,
    },
    Cautious: {
      id: "s1-cautious",
      timing: "Within 24 hours",
      channel: "email",
      subject: `Welcome — no rush, just wanted to introduce myself`,
      message: `Hi ${firstName},\n\nThank you for taking the time to fill out your profile — I know it's a lot of questions, and I appreciate the thought you put in.\n\nI'm not going to push you toward anything right away. I'd rather start by making sure you feel informed about how the process works before we start looking at homes.\n\nIf it's helpful, I put together a simple overview of what the first 60 days of a home search looks like. Happy to walk through it together on a quick call whenever the timing feels right for you.`,
      rationale: "Cautious buyers need to feel safe before they trust. Your first message should deliver value with zero pressure.",
      urgent: false,
    },
  };

  suggestions.push(touch1[style]);

  // Suggestion 2: Value-add follow-up (day 3–6)
  const touch2: Record<CommunicationStyle, FollowUpSuggestion> = {
    Analytical: {
      id: "s2-analytical",
      timing: "Day 3–5",
      channel: "email",
      subject: `${city} market snapshot for your price range`,
      message: `Hi ${firstName},\n\nQuick market update for ${city} in your range:\n\n• ${budgetStr} range: ${budgetMax && budgetMax > 1_000_000 ? "competitive but not frenzied" : "good supply, some negotiation room"}\n• Average days on market for your property type: 18–24 days\n• List-to-sale ratio: roughly 97–101%\n\nThe main takeaway: homes that are priced right are moving quickly, but there's still room to be selective.\n\nI'm monitoring ${city} daily. When I see something that fits, you'll be the first to know.`,
      rationale: "Deliver value in the format they care about. Numbers, context, and a clear next step.",
      urgent: false,
    },
    Visionary: {
      id: "s2-visionary",
      timing: "Day 3–5",
      channel: "email",
      subject: `A neighbourhood you might not have considered`,
      message: `Hi ${firstName},\n\nI've been keeping your profile in mind this week. I had a showing in ${city} yesterday that reminded me of the feel you described — quiet streets, the kind of neighbourhood where you actually know your neighbours.\n\nIt wasn't on your initial list, but I think it's worth a look. I'd rather show you one neighbourhood that might surprise you than send you ten listings that check boxes but feel flat.\n\nAre you open to a quick drive-by this week? No commitment — just to see if it resonates.`,
      rationale: "Visionary buyers love the idea of discovering something unexpected. Frame it as a low-stakes experience, not a showing.",
      urgent: false,
    },
    Decisive: {
      id: "s2-decisive",
      timing: "Day 2–3",
      channel: "text",
      subject: `Two listings just came up worth flagging`,
      message: `${firstName} — two homes just hit the market that match your criteria. One is priced to move and one just dropped ${budgetMax ? "$40K" : "significantly"}. Both worth seeing before the weekend. Do you want me to send the details?`,
      rationale: "Decisive buyers move on text. Short, specific, and action-oriented. Give them something to respond to.",
      urgent: true,
    },
    Cautious: {
      id: "s2-cautious",
      timing: "Day 5–7",
      channel: "email",
      subject: `A simple guide to getting pre-approved (no pressure)`,
      message: `Hi ${firstName},\n\nI wanted to share something that a lot of buyers find helpful early on. Even if you're not close to making an offer, getting a pre-approval puts you in a much stronger position — and more importantly, it gives you a clear number to work with so the search feels grounded.\n\nI work with a few mortgage brokers who are great at explaining options without any pressure. Happy to make an introduction whenever you're ready.\n\nNo rush — just wanted to plant the seed.`,
      rationale: preApprovalStatus === "Not yet"
        ? "Addresses their key hesitation point indirectly — education, not pressure."
        : "Reinforces financial confidence even for buyers with some approval progress.",
      urgent: false,
    },
  };

  suggestions.push(touch2[style]);

  // Suggestion 3: Relationship builder / strategic (week 2+)
  const touch3: Record<CommunicationStyle, FollowUpSuggestion> = {
    Analytical: {
      id: "s3-analytical",
      timing: "Week 2",
      channel: "email",
      subject: `${mustHaves.length > 0 ? `Homes with ${topMustHave}` : "Your shortlist"} — updated comparison`,
      message: `Hi ${firstName},\n\nI've been tracking listings against your criteria and wanted to share a quick update. Here's where things stand:\n\n• 2 homes match your full must-have list within budget\n• 3 homes are close — each missing one item\n• Market inventory in ${city} is currently [normal/tight/increasing]\n\nI'd recommend we narrow the shortlist to the top 2–3 and book showings before month-end. Happy to talk through the tradeoffs on each. Want to connect this week?`,
      rationale: "Give them the analytical framing they need to make a decision. Status update + clear recommendation.",
      urgent: tier === "High",
    },
    Visionary: {
      id: "s3-visionary",
      timing: "Week 2",
      channel: "email",
      subject: `Still thinking about your notes`,
      message: `Hi ${firstName},\n\nI keep coming back to what you wrote about ${topMustHave}. I haven't sent you a shortlist yet because I haven't seen anything that truly fits — and I'd rather hold out than send you something that's just "good enough."\n\nThat said, I have one coming up this week I want your take on. It's not perfect on paper, but it has a quality that's hard to quantify. Would you want to take a look with me on [day] afternoon?`,
      rationale: "Visionary buyers need to feel you've been curating for them, not just filtering. Show selectivity.",
      urgent: false,
    },
    Decisive: {
      id: "s3-decisive",
      timing: "Week 2",
      channel: "call",
      subject: `Where do things stand — a quick check-in`,
      message: `${firstName}, quick check-in — we looked at a few options and I want to make sure we're still aligned before the market moves.\n\nHere's where I'd push us to go next: [top 1–2 options]. I can have an offer ready to go if either of these land. Do you want to book 30 minutes this week to talk through it?\n\nIf your timeline has shifted, just let me know and I'll adjust.`,
      rationale: "Keep momentum with decisive buyers. Acknowledge the current state and offer a clear path forward.",
      urgent: tier === "High",
    },
    Cautious: {
      id: "s3-cautious",
      timing: "Week 2–3",
      channel: "email",
      subject: `Checking in — no agenda`,
      message: `Hi ${firstName},\n\nJust wanted to check in and see how you're feeling about the process. Home searches can sometimes feel like a lot, and I want you to know there's no expectation or timeline pressure from my end.\n\nIf you've been keeping an eye on anything in ${city} and want to talk through it, I'm here. And if you need a bit more time, that's completely fine too.\n\nWhenever you're ready to take the next step, even just looking at a single home together, I'll be here.`,
      rationale: "Cautious buyers go quiet when they feel pressure. This message keeps the door open without asking for anything.",
      urgent: false,
    },
  };

  suggestions.push(touch3[style]);

  return suggestions;
}

// ─── Recovery Prompt ──────────────────────────────────────────────────────────

function deriveRecoveryPrompt(a: QuestionnaireAnswers, style: CommunicationStyle): RecoveryPrompt {
  const { firstName, preferredCity, mustHaves } = a;
  const city = preferredCity || "your area";
  const topMustHave = mustHaves[0] || "what you're looking for";

  const messages: Record<CommunicationStyle, RecoveryPrompt> = {
    Analytical: {
      subject: `${city} market update — thought of you`,
      message: `Hi ${firstName},\n\nI know it's been a while since we last connected, and I didn't want to reach out without having something useful to share.\n\nThe ${city} market has shifted a bit since you submitted your profile — specifically in the price range you're targeting. Inventory has [increased/tightened], which changes the strategy slightly.\n\nIf you're still actively searching (or thinking about restarting), I'd love to walk you through the current numbers. Even 15 minutes on a call would give you a clearer picture. No pressure — happy to go at whatever pace works.`,
      rationale: "Analytical buyers re-engage when you lead with information that's useful to them, not when you check in emotionally.",
    },
    Visionary: {
      subject: `I saw something this week that made me think of you`,
      message: `Hi ${firstName},\n\nI know it's been a little while, and I didn't want to reach out just to check in without a reason.\n\nI walked through a home in ${city} this week that genuinely reminded me of what you described — specifically the ${topMustHave} and the kind of feel you were after. It might not be the right fit, but it's the closest I've seen to what you had in mind.\n\nWould it be worth a look together? Even if it's not the one, it might help us sharpen what we're looking for.`,
      rationale: "Visionary buyers re-engage when they feel personally seen. Make it about them and something specific, not a generic check-in.",
    },
    Decisive: {
      subject: `A couple of things worth knowing`,
      message: `${firstName} — quick note. Two things have come up in ${city} since we last spoke that match your criteria, including ${topMustHave}. One is fresh, one just had a price reduction.\n\nI don't want you to miss either of these without knowing they exist. Worth a 10-minute catch-up this week?\n\nIf your timeline or situation has changed, just say the word and I'll update where things stand.`,
      rationale: "Decisive buyers re-engage when you lead with specific, actionable information. No preamble.",
    },
    Cautious: {
      subject: `Still here whenever you're ready`,
      message: `Hi ${firstName},\n\nI noticed some time has passed since we last connected, and I just wanted to reach out to say: there's no pressure from my end.\n\nSearches pause and restart all the time, and whenever you're ready to pick this back up — whether that's next week or next year — I'm here and happy to help.\n\nIn the meantime, I've seen a few homes come through ${city} that match your must-haves, specifically around ${topMustHave}. If you'd like me to forward the details, just say the word.\n\nHope you're doing well.`,
      rationale: "Cautious buyers need to feel safe re-engaging. Remove all pressure and make coming back feel easy.",
    },
  };

  return messages[style];
}

// ─── Summary Line ─────────────────────────────────────────────────────────────

function deriveSummaryLine(
  style: CommunicationStyle,
  motivation: MotivationProfile,
  a: QuestionnaireAnswers,
): string {
  const tierWord = motivation.tier === "High" ? "high-motivation" : motivation.tier === "Medium" ? "moderate-motivation" : "low-motivation";

  const lines: Record<CommunicationStyle, Record<MotivationTier, string>> = {
    Analytical: {
      High: "Data-driven buyer ready to act. Give them numbers first, then move fast.",
      Medium: "Thoughtful and research-oriented. Build confidence with data before pushing showings.",
      Low: "Analytical buyer still processing. Stay informative, don't apply pressure.",
    },
    Visionary: {
      High: "Emotionally driven and motivated. Find the home that fits their story and they'll move.",
      Medium: "Lifestyle-led buyer with time to browse. Build the relationship through curation.",
      Low: "Visionary buyer still forming their picture. Inspire, don't push.",
    },
    Decisive: {
      High: "Ready to move now. Cut the preamble and get to showings.",
      Medium: "Decisive but not rushed. Stay action-focused and responsive.",
      Low: "Decisive buyer who's paused. Find out why before reapplying pressure.",
    },
    Cautious: {
      High: "Motivated but anxious. Guide them step-by-step — don't let urgency tip into overwhelm.",
      Medium: "Cautious and deliberate. Build trust; they'll move when they feel safe.",
      Low: "Early-stage buyer who needs a guide, not a closer. Play the long game.",
    },
  };

  return lines[style][motivation.tier];
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function calcBuyerIntelligence(
  answers: QuestionnaireAnswers,
  meta?: { submittedAt?: string; status?: string },
): BuyerIntelligence {
  const style = deriveStyle(answers);
  const motivation = deriveMotivation(answers);
  const triggers = deriveTriggers(answers);
  const hesitations = deriveHesitations(answers);
  const toneGuide = deriveToneGuide(style.type, motivation.tier);

  const daysSince = meta?.submittedAt
    ? Math.floor((Date.now() - new Date(meta.submittedAt).getTime()) / 86_400_000)
    : 0;

  const followUpSuggestions = deriveFollowUpSuggestions(
    answers,
    style.type,
    motivation.tier,
    daysSince,
  );

  const isInactive =
    daysSince > 10 &&
    (meta?.status === "New Lead" || meta?.status === "Qualified");

  const recoveryPrompt = isInactive ? deriveRecoveryPrompt(answers, style.type) : undefined;
  const summaryLine = deriveSummaryLine(style.type, motivation, answers);

  return {
    style,
    motivation,
    triggers,
    hesitations,
    toneGuide,
    followUpSuggestions,
    recoveryPrompt,
    summaryLine,
  };
}
