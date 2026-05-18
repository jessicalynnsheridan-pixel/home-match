/**
 * Realtor Attribution System
 *
 * When a buyer arrives via a realtor invite link (?r=slug or /invite/[slug]),
 * their attribution is silently stored in localStorage.
 *
 * This allows the app to:
 * - Personalise the experience with the realtor's name/branding
 * - Track which leads came from which realtor
 * - Route questionnaire completions to the right dashboard
 *
 * The buyer never sees this mechanism — they just see a personalised experience.
 */

export interface RealtorAttribution {
  slug: string;           // e.g. "sarah-mitchell"
  name: string;           // e.g. "Sarah Mitchell"
  firstName: string;      // e.g. "Sarah"
  agency?: string;        // e.g. "Home Match Realty"
  email?: string;
  phone?: string;
  tagline?: string;
  arrivedAt: string;      // ISO timestamp
  source: "invite_link" | "qr_code" | "bio_link" | "text" | "website" | "direct";
}

const STORAGE_KEY = "homematch_realtor_attribution";

// ─── Slug → Realtor Profile lookup ────────────────────────────────────────────
// In production this would be a DB lookup. For now it uses the BrandingContext
// defaults and the slug as a display hint.
export function slugToAttribution(slug: string, source: RealtorAttribution["source"] = "invite_link"): RealtorAttribution {
  // Decode slug: "sarah-mitchell" → "Sarah Mitchell"
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const firstName = name.split(" ")[0];

  return {
    slug,
    name,
    firstName,
    arrivedAt: new Date().toISOString(),
    source,
  };
}

// ─── Write ─────────────────────────────────────────────────────────────────────
export function setRealtorAttribution(attribution: RealtorAttribution): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch { /* ignore quota/private-mode errors */ }
}

// ─── Read ──────────────────────────────────────────────────────────────────────
export function getRealtorAttribution(): RealtorAttribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RealtorAttribution;
  } catch {
    return null;
  }
}

// ─── Clear ─────────────────────────────────────────────────────────────────────
export function clearRealtorAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

// ─── Apply to BrandingConfig ───────────────────────────────────────────────────
// Returns a partial BrandingConfig patch based on attribution data.
// Merges gracefully with defaults — only overrides what we know.
export function attributionToBrandingPatch(attr: RealtorAttribution) {
  return {
    realtorName: attr.name,
    ...(attr.agency ? { agencyName: attr.agency } : {}),
    ...(attr.email ? { email: attr.email } : {}),
    ...(attr.phone ? { phone: attr.phone } : {}),
    ...(attr.tagline ? { tagline: attr.tagline } : {}),
  };
}
