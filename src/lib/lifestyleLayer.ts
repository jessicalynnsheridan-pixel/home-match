import type { Listing } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AmenityCategory =
  | "coffee"
  | "fitness"
  | "pilates"
  | "park"
  | "wellness"
  | "restaurant"
  | "school"
  | "grocery"
  | "trail"
  | "market";

export interface AmenityItem {
  name: string;
  category: AmenityCategory;
  walkMinutes?: number;
  driveMinutes?: number;
  note?: string;
}

export interface LifestyleLayer {
  sundayMorningEnergy: string;
  neighbourhoodVibe: string[];
  amenities: AmenityItem[];
  emotionalPrompts: string[];
  lifestyleStatement: string;
  lifestyleIdentities: string[];
}

// ─── Neighbourhood categories ─────────────────────────────────────────────────

type NeighbourhoodCategory =
  | "village"
  | "waterfront"
  | "escarpment"
  | "urban"
  | "suburban_family"
  | "rural";

function getCategory(listing: Listing): NeighbourhoodCategory {
  const { city, neighbourhood, features, description } = listing;
  const text = `${neighbourhood} ${features.join(" ")} ${description}`.toLowerCase();

  if (city === "Niagara-on-the-Lake") return "village";
  if (city === "Fort Erie" || city === "Port Colborne") return "waterfront";
  if (city === "Lincoln" || city === "Grimsby") return "escarpment";
  if (city === "Pelham") return "rural";
  if (/waterfront|lakefront|lake view|marina|beach/.test(text)) return "waterfront";
  if (/vineyard|winery|escarpment|orchard/.test(text)) return "escarpment";
  if (/downtown|urban|walkable|main street/.test(text)) return "urban";
  if (city === "St. Catharines" && /port dalhousie|lakeshore|lakeside/.test(text)) return "waterfront";
  if (city === "St. Catharines") return "urban";
  if (city === "Niagara Falls") return "urban";
  return "suburban_family";
}

// ─── Deterministic seed ───────────────────────────────────────────────────────

function seed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], s: number, offset = 0): T {
  return arr[(s + offset) % arr.length];
}

function pickN<T>(arr: T[], n: number, s: number): T[] {
  const tagged = arr.map((item, i) => ({ item, sort: seed(String(item) + s + i) }));
  tagged.sort((a, b) => a.sort - b.sort);
  return tagged.slice(0, Math.min(n, arr.length)).map((t) => t.item);
}

// ─── Amenity pools ────────────────────────────────────────────────────────────

const AMENITY_POOLS: Record<NeighbourhoodCategory, AmenityItem[]> = {
  village: [
    { name: "Balcony Coffee & Tea", category: "coffee", walkMinutes: 6, note: "Village favourite" },
    { name: "The Old Winery Café", category: "coffee", walkMinutes: 12 },
    { name: "Treadwell Farm-to-Table", category: "restaurant", walkMinutes: 8, note: "Seasonal menu, local produce" },
    { name: "The Olde Angel Inn", category: "restaurant", walkMinutes: 5, note: "Historic pub, Sunday brunch" },
    { name: "Ravine Vineyard Estate", category: "restaurant", driveMinutes: 7, note: "Wine country dining" },
    { name: "Queen's Royal Park", category: "park", walkMinutes: 10, note: "Waterfront views" },
    { name: "Commons Park", category: "park", walkMinutes: 7 },
    { name: "The Spa at Harbour House", category: "wellness", driveMinutes: 5 },
    { name: "NOTL Yoga Studio", category: "pilates", walkMinutes: 9 },
    { name: "NOTL Grocer", category: "grocery", walkMinutes: 6 },
    { name: "Harvest Barn", category: "market", driveMinutes: 8, note: "Local farm market" },
    { name: "Niagara River Recreation Trail", category: "trail", walkMinutes: 4, note: "17km waterfront trail" },
    { name: "École Secondaire", category: "school", driveMinutes: 6 },
    { name: "Lord Tweedsmuir PS", category: "school", walkMinutes: 11 },
  ],
  waterfront: [
    { name: "The Dockside Café", category: "coffee", walkMinutes: 5, note: "Lake views at every table" },
    { name: "Anchor Coffee House", category: "coffee", walkMinutes: 8 },
    { name: "The Boat House Bistro", category: "restaurant", walkMinutes: 7, note: "Fresh catch daily" },
    { name: "Erie Beach Hotel & Patio", category: "restaurant", driveMinutes: 5 },
    { name: "Windmill Beach Park", category: "park", walkMinutes: 4, note: "Sandy beach access" },
    { name: "Waverly Beach", category: "trail", walkMinutes: 9, note: "2km waterfront trail" },
    { name: "Fort Erie Fitness", category: "fitness", driveMinutes: 6 },
    { name: "Lakeshore Wellness", category: "wellness", driveMinutes: 8 },
    { name: "Flow Pilates Studio", category: "pilates", driveMinutes: 7 },
    { name: "No Frills Fort Erie", category: "grocery", driveMinutes: 5 },
    { name: "Harbourside Market", category: "market", walkMinutes: 12, note: "Saturday mornings" },
    { name: "W.L. Mackenzie PS", category: "school", driveMinutes: 5 },
    { name: "Crystal Beach", category: "park", driveMinutes: 6, note: "Historic beach community" },
  ],
  escarpment: [
    { name: "Thirty Bench Winery Café", category: "coffee", driveMinutes: 8, note: "Vineyard terrace" },
    { name: "Kacaba Vineyards", category: "restaurant", driveMinutes: 10, note: "Saturday tasting room" },
    { name: "Peninsula Ridge Estate", category: "restaurant", driveMinutes: 12 },
    { name: "Short Hills Provincial Park", category: "trail", driveMinutes: 10, note: "35km of trails" },
    { name: "Ball's Falls Conservation", category: "park", driveMinutes: 9 },
    { name: "Beamsville Farmer's Market", category: "market", driveMinutes: 6, note: "Year-round Saturday market" },
    { name: "Grimsby Foodland", category: "grocery", driveMinutes: 5 },
    { name: "Elevate Wellness Grimsby", category: "wellness", driveMinutes: 7 },
    { name: "Escarpment Yoga", category: "pilates", driveMinutes: 8 },
    { name: "F45 Training Grimsby", category: "fitness", driveMinutes: 6 },
    { name: "Jordan Harbour", category: "park", driveMinutes: 11, note: "Canoe and kayak launch" },
    { name: "Blessed Trinity CSS", category: "school", driveMinutes: 9 },
    { name: "Lakeview Coffee", category: "coffee", driveMinutes: 5 },
  ],
  urban: [
    { name: "Mahtay Café", category: "coffee", walkMinutes: 5, note: "St. Catharines institution" },
    { name: "Dispatch Coffee", category: "coffee", walkMinutes: 9 },
    { name: "AG Inspired Cuisine", category: "restaurant", walkMinutes: 11, note: "Farm-to-table fine dining" },
    { name: "Wellington Court", category: "restaurant", walkMinutes: 8 },
    { name: "The Merchant Ale House", category: "restaurant", walkMinutes: 6 },
    { name: "Twelve Mile Creek Trail", category: "trail", walkMinutes: 7, note: "City trail system" },
    { name: "Merritt Island", category: "park", walkMinutes: 10 },
    { name: "Goodlife Fitness", category: "fitness", walkMinutes: 8 },
    { name: "F45 Training St. Catharines", category: "fitness", driveMinutes: 5 },
    { name: "Pure Pilates Niagara", category: "pilates", walkMinutes: 12 },
    { name: "Salt Cave Wellness", category: "wellness", walkMinutes: 9, note: "Halotherapy studio" },
    { name: "Ridley Square Sobeys", category: "grocery", walkMinutes: 6 },
    { name: "St. Catharines Farmers Market", category: "market", walkMinutes: 8, note: "Wed & Sat year-round" },
    { name: "Sir Winston Churchill SS", category: "school", walkMinutes: 13 },
    { name: "Queenston PS", category: "school", walkMinutes: 9 },
  ],
  suburban_family: [
    { name: "Tim Hortons Welland", category: "coffee", driveMinutes: 4 },
    { name: "The Coffee Culture Café", category: "coffee", driveMinutes: 6 },
    { name: "Fonthill Bakery", category: "coffee", driveMinutes: 7, note: "Weekend morning lineup worth it" },
    { name: "Zehrs Welland", category: "grocery", driveMinutes: 5 },
    { name: "Welland Farmers Market", category: "market", driveMinutes: 6, note: "Saturday mornings" },
    { name: "Merritt Island Trails", category: "trail", driveMinutes: 8, note: "Canal-side walking paths" },
    { name: "Rotary Park", category: "park", driveMinutes: 5 },
    { name: "Welland Goodlife Fitness", category: "fitness", driveMinutes: 6 },
    { name: "Niagara West Pilates", category: "pilates", driveMinutes: 9 },
    { name: "Wellspring Wellness Centre", category: "wellness", driveMinutes: 8 },
    { name: "Notre Dame College School", category: "school", driveMinutes: 7 },
    { name: "Seaway Mall (local eats)", category: "restaurant", driveMinutes: 5 },
    { name: "The Barrel Restaurant", category: "restaurant", driveMinutes: 8, note: "Community favourite" },
  ],
  rural: [
    { name: "The Wainfleet Bakery", category: "coffee", driveMinutes: 10, note: "Weekend morning destination" },
    { name: "Fenwick Coffee House", category: "coffee", driveMinutes: 8 },
    { name: "Pelham Town Square Café", category: "coffee", driveMinutes: 6 },
    { name: "Short Hills Trails", category: "trail", driveMinutes: 12, note: "35km old-growth forest" },
    { name: "Waterfall Point", category: "park", driveMinutes: 15 },
    { name: "Pelham Farmers Market", category: "market", driveMinutes: 7, note: "Summer Saturdays" },
    { name: "E.L. Crossley SS", category: "school", driveMinutes: 10 },
    { name: "Steve Bauer Trail", category: "trail", driveMinutes: 8, note: "50km cycling and walking" },
    { name: "Serenity Wellness Pelham", category: "wellness", driveMinutes: 9 },
    { name: "Zehrs Fonthill", category: "grocery", driveMinutes: 8 },
    { name: "Pelham Fitness", category: "fitness", driveMinutes: 7 },
    { name: "Lookout Point Country Club", category: "park", driveMinutes: 6, note: "Golf and green space" },
    { name: "The Loft Pilates", category: "pilates", driveMinutes: 11 },
  ],
};

// ─── Sunday Morning Energy ────────────────────────────────────────────────────

const SUNDAY_ENERGY: Record<NeighbourhoodCategory, string[]> = {
  village: [
    "Sunday here unfolds slowly on purpose. You take your coffee to the front porch, hear the church bells from a few blocks away, and find yourself in no particular hurry. The village has a rhythm that resists urgency — wine country mornings weren't designed to be rushed.",
    "The bakery opens at eight, but there's no reason to be there before nine. A slow walk through tree-lined streets, maybe a stop at the market, and suddenly it's noon and you've done exactly what you needed to. NOTL has a way of making leisure feel earned.",
  ],
  waterfront: [
    "The morning starts with the sound of water. You'll make your coffee and take it outside without thinking about it, watching the light change on the lake before the rest of the world has woken up. There's nowhere else you'd rather be at 7am.",
    "Open the back door and the lake is already there, doing what it does. No alarm required. The kind of Sunday morning that makes you wonder why you ever lived anywhere else — calm, wide open, entirely yours.",
  ],
  escarpment: [
    "Drive up the escarpment before 9am and you'll have the view to yourself — the whole Niagara Peninsula spread out below, a thermos in hand. By afternoon you might find yourself at a winery tasting room without having planned it. That's just how Sundays work here.",
    "The mornings are quiet in a way that feels like a decision. Trail before breakfast, coffee after, maybe a stop at the farm stand on the way home. Wine country doesn't demand anything of you on a Sunday — that's the whole point.",
  ],
  urban: [
    "Two blocks to a good coffee, a farmers' market twice a month, and a trail system most of the neighbourhood hasn't discovered yet. Sunday morning is a walk, a latte, and whatever sounds good after that. The city gives you options without demanding anything.",
    "The Saturday-night energy has settled by morning, and what's left is a neighbourhood that actually likes itself. Regulars at the café, trail runners on the creek path, the kind of Sunday that feels both easy and full.",
  ],
  suburban_family: [
    "The kind of Sunday where you end up talking to three different neighbours without planning to. Kids on bikes, someone's dog making the rounds, a coffee on the front step. Community isn't an amenity here — it's just the street.",
    "Slow start, no agenda. The park fills up by 10, the farmers' market by 11. You'll bump into someone you know. This is the kind of neighbourhood where that happens regularly, and it never gets old.",
  ],
  rural: [
    "Quiet here isn't the absence of noise — it's the presence of something else. Sunday might mean your own garden, a trail through old-growth forest ten minutes away, a drive for coffee that takes long enough to feel like a ritual. No rush, no agenda, no performance.",
    "The trail is empty before 8am. The coffee shop opens at 9 and it feels like a reward. This is rural Ontario living at its most honest — space, air, and a kind of peace that suburban life keeps promising but rarely delivers.",
  ],
};

// ─── Neighbourhood vibe tags ──────────────────────────────────────────────────

const VIBE_TAGS: Record<NeighbourhoodCategory, string[]> = {
  village:         ["Walkable village", "Wine country", "Historic charm", "Weekend energy", "Slow living", "Boutique culture"],
  waterfront:      ["Lakefront access", "Sunset views", "Year-round calm", "Active outdoors", "Weekend escapes", "Quiet waterfront"],
  escarpment:      ["Vineyard views", "Trail-connected", "Farm country", "Nature-first", "Weekend winery", "Escarpment living"],
  urban:           ["Walkable core", "Coffee culture", "Trail access", "Arts scene", "Market Saturdays", "Urban convenience"],
  suburban_family: ["Family streets", "Great schools", "Park nearby", "Community feel", "Safe and quiet", "Room to grow"],
  rural:           ["Deep quiet", "Trail-connected", "Space to breathe", "Farm to table", "Privacy first", "Country living"],
};

// ─── Emotional prompts ────────────────────────────────────────────────────────

const BASE_PROMPTS: Record<NeighbourhoodCategory, string[]> = {
  village:         ["Can you picture a slow Sunday walk to the village café?", "Could you see yourself unwinding from the week here?", "Would this pace of life feel like coming home?"],
  waterfront:      ["Can you picture watching the sunrise over the water from here?", "Could this become your favourite place to exhale?", "Would waking up to water change your mornings?"],
  escarpment:      ["Can you imagine trail runs before work and wine country weekends?", "Could you picture yourself settling into this kind of quiet?", "Would this landscape become part of how you live?"],
  urban:           ["Can you picture your morning coffee routine in this neighbourhood?", "Could you imagine building your week around these streets?", "Would this be the neighbourhood that finally feels right?"],
  suburban_family: ["Can you picture kids on bikes and Saturday morning pancakes here?", "Could this neighbourhood grow with your family?", "Would this street feel like home in five years?"],
  rural:           ["Can you picture genuine peace as your daily baseline?", "Could this become the space where you finally decompress?", "Would the quiet here feel like a gift or a question?"],
};

function featurePrompts(listing: Listing): string[] {
  const text = `${listing.features.join(" ")} ${listing.description}`.toLowerCase();
  const prompts: string[] = [];

  if (/backyard|patio|deck|outdoor|entertaining/.test(text))
    prompts.push("Could you picture hosting here on a warm summer evening?");
  if (/kitchen|chef|gourmet/.test(text))
    prompts.push("Can you imagine this kitchen becoming the heart of your home?");
  if (/office|study|den/.test(text))
    prompts.push("Could you start your morning here and not miss the commute?");
  if (/pool|hot tub|sauna/.test(text))
    prompts.push("Can you picture summer weekends that never require leaving home?");
  if (/fireplace|fire place/.test(text))
    prompts.push("Can you picture yourself here on a quiet winter evening?");
  if (/garage|workshop/.test(text))
    prompts.push("Could this space finally give you room for the projects you keep putting off?");

  return prompts;
}

// ─── Lifestyle identity tags ──────────────────────────────────────────────────

const LIFESTYLE_IDENTITIES: Record<NeighbourhoodCategory, string[]> = {
  village: [
    "I prefer walking over driving",
    "I appreciate character over square footage",
    "A good local café matters to me",
    "I take my time on weekends",
    "I'd rather have one great restaurant nearby than ten mediocre ones",
    "Neighbourhood charm is non-negotiable",
  ],
  waterfront: [
    "I start my mornings with the outdoors",
    "Water is where I decompress",
    "I want outdoor space I'll actually use",
    "Seasonal living appeals to me",
    "I don't need to be in the city to feel connected",
    "Quiet has real value to me",
  ],
  escarpment: [
    "Trail access is part of my routine",
    "I appreciate food and wine culture",
    "Nature is where I reset",
    "I prefer space over density",
    "The drive somewhere beautiful is worth it",
    "I want to feel removed from the noise",
  ],
  urban: [
    "I like being able to walk to coffee",
    "I work from home at least a few days a week",
    "Farmers markets are a Saturday ritual",
    "I want the city within reach",
    "I like knowing my neighbourhood",
    "Local culture matters to me",
  ],
  suburban_family: [
    "School quality is a priority",
    "I want my kids to be able to bike to the park",
    "I host family dinners regularly",
    "Community feel is important to me",
    "I'm building a life here, not just a home",
    "Quiet streets with good neighbours",
  ],
  rural: [
    "I want a property with space around it",
    "Privacy is worth more than convenience to me",
    "I've been dreaming of land",
    "I want silence as my default",
    "Nature access is non-negotiable",
    "I want to feel removed from everything",
  ],
};

// ─── Lifestyle statement ──────────────────────────────────────────────────────

const LIFESTYLE_STATEMENTS: Record<NeighbourhoodCategory, string[]> = {
  village:         ["For the buyer who wants to live in a place, not just own one.", "For people who choose character over convenience."],
  waterfront:      ["For the buyer who measures quality of life in mornings, not commute times.", "For people who believe water changes everything."],
  escarpment:      ["For the buyer who wants nature woven into everyday life.", "For people who think weekends should feel like vacations."],
  urban:           ["For the buyer who wants everything within walking distance.", "For people who want a neighbourhood with a personality."],
  suburban_family: ["For the buyer who's building more than a home — they're building a family's story.", "For people who know community is the real amenity."],
  rural:           ["For the buyer who knows what they're looking for: space, quiet, and room to be.", "For people who are done with density."],
};

// ─── Main export ──────────────────────────────────────────────────────────────

export function calcLifestyleLayer(listing: Listing): LifestyleLayer {
  const category = getCategory(listing);
  const s = seed(listing.id);

  const amenityPool = AMENITY_POOLS[category];
  const amenities = pickN(amenityPool, Math.min(10, amenityPool.length), s);

  const sundayOptions = SUNDAY_ENERGY[category];
  const sundayMorningEnergy = pick(sundayOptions, s);

  const vibePool = VIBE_TAGS[category];
  const neighbourhoodVibe = pickN(vibePool, 5, s);

  const basePrompts = BASE_PROMPTS[category];
  const extra = featurePrompts(listing);
  const allPrompts = [...extra, ...basePrompts];
  const emotionalPrompts = pickN(allPrompts, 4, s);

  const statementPool = LIFESTYLE_STATEMENTS[category];
  const lifestyleStatement = pick(statementPool, s);

  const identityPool = LIFESTYLE_IDENTITIES[category];
  const lifestyleIdentities = pickN(identityPool, 6, s);

  return {
    sundayMorningEnergy,
    neighbourhoodVibe,
    amenities,
    emotionalPrompts,
    lifestyleStatement,
    lifestyleIdentities,
  };
}
