import { Lead } from "@/types";

/**
 * Maps a raw Supabase leads row to the app's Lead type.
 * Single source of truth — used by dashboard, pipeline, and lead detail pages.
 */
export function mapSupabaseLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    score: (row.score as Lead["score"]) ?? "Browsing",
    matchScore: (row.match_score as number) ?? 0,
    status: (row.status as Lead["status"]) ?? "New Lead",
    isPriority: (row.is_priority as boolean) ?? false,
    submittedAt: row.submitted_at as string,
    realtorNotes: [],
    reminders: [],
    savedHomeIds: [],
    answers: {
      firstName: "", lastName: "", email: "", phone: "",
      mustHaves: [], dealBreakers: [], lifestylePriorities: [],
      mortgageChecklist: [], homeFeeling: [], neighbourhoodVibe: [],
      proximityPriorities: [], currentFrustration: [],
      ...(row.answers as Partial<Lead["answers"]> ?? {}),
    } as Lead["answers"],
  };
}
