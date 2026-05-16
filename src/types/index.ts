// ─── Core Types ───────────────────────────────────────────────────────────────

export type LeadScore = "Hot" | "Warm" | "Browsing";

export type LeadStatus =
  | "New Lead"
  | "Qualified"
  | "Showing Booked"
  | "Offer Stage"
  | "Closed";

export type PropertyType =
  | "Single Family"
  | "Condo"
  | "Townhouse"
  | "Multi-Family"
  | "Land"
  | "Luxury Estate";

export type BuyingTimeline =
  | "ASAP"
  | "1–3 months"
  | "3–6 months"
  | "6–12 months"
  | "Just exploring";

export type PreApprovalStatus =
  | "Yes, fully approved"
  | "In progress"
  | "Not yet"
  | "Paying cash";

export type HomeOwnershipStatus =
  | "Renting"
  | "Own — need to sell first"
  | "Own — can buy independently"
  | "First-time buyer";

// ─── Mortgage Readiness Checklist ─────────────────────────────────────────

export interface MortgageChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

// ─── Follow-Up Reminder ───────────────────────────────────────────────────

export interface FollowUpReminder {
  id: string;
  text: string;
  dueDate: string; // ISO date string
  completed: boolean;
}

// ─── Questionnaire Answers ─────────────────────────────────────────────────

export interface QuestionnaireAnswers {
  // Step 1 – Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2 – Timeline & Budget
  timeline: BuyingTimeline | "";
  budgetMin: number;
  budgetMax: number;

  // Step 3 – Location
  preferredCity: string;
  preferredNeighbourhoods: string;
  neighbourhoodVibe: string[];         // e.g. "Quiet & residential", "Walkable & urban"
  proximityPriorities: string[];       // e.g. "Near schools", "Near transit"
  schoolDistrictImportance: "Not important" | "Somewhat" | "Very important" | "";
  commutePreferences: string;

  // Step 4 – Property Details
  propertyType: PropertyType | "";
  bedrooms: number;
  bathrooms: number;

  // Step 5 – Lifestyle
  mustHaves: string[];
  dealBreakers: string[];
  lifestylePriorities: string[];

  // Step 6 – Financials & Intent
  investmentOrPersonal: "Personal use" | "Investment" | "Both" | "";
  preApprovalStatus: PreApprovalStatus | "";
  ownershipStatus: HomeOwnershipStatus | "";
  mortgageChecklist: MortgageChecklistItem[];

  // Step 7 – Notes
  additionalNotes: string;
}

// ─── Lead (Realtor Dashboard) ─────────────────────────────────────────────

export interface RealtorNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  score: LeadScore;
  matchScore: number;          // 0–100 calculated readiness score
  status: LeadStatus;
  isPriority: boolean;
  submittedAt: string;
  realtorNotes: RealtorNote[];
  reminders: FollowUpReminder[];
  savedHomeIds: string[];      // property IDs the buyer has favourited
  answers: QuestionnaireAnswers;
}

// ─── Property Recommendation ──────────────────────────────────────────────

export interface PropertyRecommendation {
  id: string;
  leadId: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  matchReason: string;
  realtorNotes: string;
  listingUrl?: string;
}

// ─── MLS Listing ──────────────────────────────────────────────────────────

export type ListingStatus = "Active" | "Sold" | "Under Contract" | "Price Reduced";

export interface Listing {
  id: string;
  mlsNumber: string;
  status: ListingStatus;
  address: string;
  city: NiagaraCity;
  neighbourhood: string;
  postalCode: string;
  price: number;
  originalPrice?: number;       // set if price was reduced
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: string;              // e.g. "60 x 120 ft"
  yearBuilt: number;
  garage: string;               // e.g. "2-car attached"
  basement: string;             // e.g. "Finished, walkout"
  heating: string;
  features: string[];           // key selling points
  description: string;
  images: string[];             // Unsplash URLs
  listedAt: string;             // ISO date
  daysOnMarket: number;
  taxes: number;                // annual property tax
  maintenanceFee?: number;      // condo fee if applicable
  virtualTourUrl?: string;
}

export type NiagaraCity =
  | "St. Catharines"
  | "Niagara-on-the-Lake"
  | "Niagara Falls"
  | "Welland"
  | "Fort Erie"
  | "Grimsby"
  | "Lincoln"
  | "Pelham"
  | "Thorold"
  | "Port Colborne";

// ─── Branding ─────────────────────────────────────────────────────────────

export interface BrandingConfig {
  agencyName: string;
  realtorName: string;
  realtorTitle: string;
  email: string;
  phone: string;
  logoText: string;            // text logo fallback
  primaryColor: string;        // hex
  accentColor: string;         // hex
  tagline: string;
  website: string;
}
