import type { Lead } from "@/types";

export type PlaybookUrgency = "critical" | "high" | "medium" | "low";

export interface Playbook {
  urgency: PlaybookUrgency;
  action: string;
  color: string;
  bg: string;
  border: string;
  steps: string[];
  why: string;
}

export function getPlaybook(lead: Lead): Playbook {
  const { answers, score } = lead;
  const isFinanced =
    answers.preApprovalStatus === "Yes, fully approved" ||
    answers.preApprovalStatus === "Paying cash";
  const isASAP =
    answers.timeline === "ASAP" || answers.timeline === "1-3 months";

  if (score === "Hot" && isASAP && isFinanced) {
    return {
      urgency: "critical",
      action: "Call within 2 hours",
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
      steps: [
        `Text first: 'Hi ${answers.firstName}, saw your profile come through - great taste. Have 2 homes in mind. Quick call today?'`,
        "Follow with the personalised email below if no reply within 3 hours",
        "They're financed and ready - your window to be first is narrow",
      ],
      why: `${answers.firstName} is pre-approved, buying ${answers.timeline?.toLowerCase() ?? "soon"}, and fully committed. This lead goes cold fast if a competitor gets there first.`,
    };
  }

  if (score === "Hot") {
    return {
      urgency: "high",
      action: "Email today, call tomorrow",
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
      steps: [
        "Send the personalised email now - it references their exact answers so it won't feel automated",
        "Call or text tomorrow morning if no reply",
        "Offer a 15-min call, not a full meeting - lower barrier to yes",
      ],
      why: `${answers.firstName} scored Hot based on timeline and intent. They're shopping - your first response sets the tone for the whole relationship.`,
    };
  }

  if (score === "Warm") {
    return {
      urgency: "medium",
      action: "Email now, follow up in 5 days",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
      steps: [
        "Send the warm nurture email - position yourself as the expert, not the pusher",
        "Wait 5 days, then follow up with a market update or listing",
        "Share 1 market insight about their target area - builds trust without pressure",
      ],
      why: `${answers.firstName} is on a ${answers.timeline ?? "flexible"} timeline. Stay warm and top-of-mind - when they're ready to move, you're the obvious call.`,
    };
  }

  return {
    urgency: "low",
    action: "Monthly touch - no rush",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    steps: [
      "Send the trust-building email - no pressure, all value",
      "Add to a monthly newsletter list",
      "Check back in 6 weeks - circumstances change fast",
    ],
    why: `${answers.firstName} is exploring. Don't oversell - be the realtor they remember when they're ready.`,
  };
}
