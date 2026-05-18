import { Listing } from "@/types";

// ─── Niagara Region Mock Listings ─────────────────────────────────────────
// Real street names, accurate price ranges, authentic neighbourhood details.
// Photos via Unsplash (architecture/real estate category).

export const niagaraListings: Listing[] = [
  // ── NIAGARA-ON-THE-LAKE ────────────────────────────────────────────────
  {
    id: "lst-001",
    mlsNumber: "X9412801",
    status: "Active",
    address: "14 Delater Street",
    city: "Niagara-on-the-Lake",
    neighbourhood: "Old Town",
    postalCode: "L0S 1J0",
    price: 2195000,
    propertyType: "Single Family",
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3420,
    lotSize: "75 x 165 ft",
    yearBuilt: 2018,
    garage: "2-car attached",
    basement: "Finished, in-law suite",
    heating: "Forced air gas / radiant floor",
    features: [
      "Chef's kitchen with Thermador appliances",
      "Primary ensuite with heated floors",
      "Covered outdoor terrace with built-in BBQ",
      "Wine cellar",
      "Smart home system (Lutron)",
      "Walk to Queen Street shops & restaurants",
      "Top-rated school district",
    ],
    description:
      "An exceptional custom-built residence in the heart of Old Town Niagara-on-the-Lake. Designed for those who expect nothing less than the finest: every surface, fixture, and finish has been curated with care. The open-concept main floor flows seamlessly to a covered terrace and private garden, making this the ideal home for entertaining. Minutes from world-class wineries, the Shaw Festival, and the lakefront.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80",
    ],
    listedAt: "2026-05-01T00:00:00Z",
    daysOnMarket: 14,
    taxes: 9840,
  },
  {
    id: "lst-002",
    mlsNumber: "X9401233",
    status: "Active",
    address: "87 Simcoe Street",
    city: "Niagara-on-the-Lake",
    neighbourhood: "Old Town",
    postalCode: "L0S 1J0",
    price: 1485000,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2240,
    lotSize: "60 x 140 ft",
    yearBuilt: 1998,
    garage: "1-car detached, EV charger",
    basement: "Partially finished",
    heating: "Forced air gas",
    features: [
      "Renovated kitchen (2023)",
      "Hardwood throughout",
      "Landscaped garden with perennial beds",
      "Gas fireplace",
      "Primary ensuite with soaker tub",
      "Walking distance to wineries",
    ],
    description:
      "Charming updated home on one of Old Town's most coveted tree-lined streets. A rare opportunity to own in NOTL at an approachable price point, with room to add your own finishing touches. The private rear garden is a true seasonal sanctuary.",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80",
    ],
    listedAt: "2026-04-28T00:00:00Z",
    daysOnMarket: 17,
    taxes: 6720,
  },

  // ── ST. CATHARINES ─────────────────────────────────────────────────────
  {
    id: "lst-003",
    mlsNumber: "X9388104",
    status: "Active",
    address: "22 Yates Street",
    city: "St. Catharines",
    neighbourhood: "Secord Woods",
    postalCode: "L2P 1W3",
    price: 879000,
    propertyType: "Single Family",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2050,
    lotSize: "55 x 120 ft",
    yearBuilt: 2007,
    garage: "2-car attached",
    basement: "Finished rec room",
    heating: "Forced air gas",
    features: [
      "Renovated kitchen with quartz counters",
      "Open concept main floor",
      "Covered deck & fenced yard",
      "Top-rated elementary school zone",
      "Minutes to Burgoyne Woods trail system",
      "Updated bathrooms (2022)",
    ],
    description:
      "Move-in ready family home in one of St. Catharines' most established neighbourhoods. Secord Woods is known for its quiet streets, mature trees, and strong community feel. The kids can walk to school. You can walk to the trails. Everyone wins.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    ],
    listedAt: "2026-05-05T00:00:00Z",
    daysOnMarket: 10,
    taxes: 5240,
  },
  {
    id: "lst-004",
    mlsNumber: "X9374902",
    status: "Price Reduced",
    address: "341 Lakeshore Road",
    city: "St. Catharines",
    neighbourhood: "Port Dalhousie",
    postalCode: "L2N 6R2",
    price: 1125000,
    originalPrice: 1249000,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1820,
    lotSize: "50 x 110 ft",
    yearBuilt: 1962,
    garage: "1-car detached",
    basement: "Unfinished",
    heating: "Forced air gas",
    features: [
      "Lakefront community, steps to the beach",
      "Updated kitchen and main bath",
      "Gas fireplace in living room",
      "Mature private lot",
      "Port Dalhousie carousel & marina walkable",
      "Strong rental/investment potential",
    ],
    description:
      "An incredible opportunity in Port Dalhousie, one of St. Catharines' most beloved lakeside communities. Walk to the beach, the marina, and the historic carousel. The home has been well maintained and updated in key areas, with upside potential for renovation or investment.",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80",
    ],
    listedAt: "2026-04-10T00:00:00Z",
    daysOnMarket: 35,
    taxes: 6180,
  },
  {
    id: "lst-005",
    mlsNumber: "X9415622",
    status: "Active",
    address: "18 Queenston Street",
    city: "St. Catharines",
    neighbourhood: "Glenridge",
    postalCode: "L2T 1E7",
    price: 649000,
    propertyType: "Townhouse",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1480,
    lotSize: "25 x 90 ft",
    yearBuilt: 2015,
    garage: "1-car attached",
    basement: "Finished, laundry",
    heating: "Forced air gas",
    features: [
      "Low-maintenance living",
      "Modern open concept main floor",
      "Private rear patio",
      "Steps to Brock University",
      "Grocery & transit within walking distance",
      "In-unit laundry",
    ],
    description:
      "Contemporary freehold townhome in vibrant Glenridge. No condo fees, low maintenance, and strong rental history. The location puts you within walking distance of Brock University, Pen Centre, and quick access to the 406. Perfect for professionals, investors, or right-sizing buyers.",
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=900&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&q=80",
    ],
    listedAt: "2026-05-10T00:00:00Z",
    daysOnMarket: 5,
    taxes: 3940,
  },

  // ── GRIMSBY ────────────────────────────────────────────────────────────
  {
    id: "lst-006",
    mlsNumber: "X9399017",
    status: "Active",
    address: "6 Windermere Road",
    city: "Grimsby",
    neighbourhood: "Grimsby Beach",
    postalCode: "L3M 4E6",
    price: 1350000,
    propertyType: "Single Family",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2680,
    lotSize: "80 x 150 ft",
    yearBuilt: 2014,
    garage: "2-car attached, EV charger",
    basement: "Finished walkout",
    heating: "Forced air gas / in-floor in basement",
    features: [
      "Lake Ontario views from primary bedroom",
      "Chef's kitchen with Caesarstone island",
      "Walkout basement to lower patio",
      "Inground pool with cabana",
      "Smart home / Nest",
      "Minutes to Casablanca GO Station",
      "Escarpment views from backyard",
    ],
    description:
      "Stunning lakeside community home with coveted Escarpment backdrop and glimpses of Lake Ontario. Grimsby Beach is one of Niagara's best-kept secrets: a tight-knit waterfront community with real character, great schools, and a fast-growing food scene. Commuters love the easy GO Train access.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=80",
    ],
    listedAt: "2026-05-03T00:00:00Z",
    daysOnMarket: 12,
    taxes: 7640,
  },

  // ── PELHAM ─────────────────────────────────────────────────────────────
  {
    id: "lst-007",
    mlsNumber: "X9381450",
    status: "Active",
    address: "104 Canboro Road",
    city: "Pelham",
    neighbourhood: "Fonthill",
    postalCode: "L0S 1E0",
    price: 1189000,
    propertyType: "Single Family",
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3100,
    lotSize: "90 x 180 ft",
    yearBuilt: 2010,
    garage: "2-car attached, workshop",
    basement: "Fully finished, separate entrance",
    heating: "Forced air gas",
    features: [
      "Private 0.37 acre mature lot",
      "In-ground pool with waterfall feature",
      "Home gym in basement",
      "Pelham's top-rated school district",
      "Large covered deck",
      "Separate entrance in-law suite",
      "Backup generator",
    ],
    description:
      "Prestigious Fonthill, Pelham's crown jewel, offers this exceptional family home on a rare oversized lot. Five bedrooms, four bathrooms, finished basement with in-law potential, and one of the region's best school catchments. The kind of home that rarely comes to market twice.",
    images: [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&q=80",
      "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=900&q=80",
    ],
    listedAt: "2026-04-22T00:00:00Z",
    daysOnMarket: 23,
    taxes: 7120,
  },

  // ── LINCOLN ────────────────────────────────────────────────────────────
  {
    id: "lst-008",
    mlsNumber: "X9407733",
    status: "Active",
    address: "3480 King Street",
    city: "Lincoln",
    neighbourhood: "Vineland",
    postalCode: "L0R 2C0",
    price: 975000,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2200,
    lotSize: "100 x 220 ft",
    yearBuilt: 2004,
    garage: "2-car detached, heated",
    basement: "Unfinished, high ceiling",
    heating: "Geothermal",
    features: [
      "Vineyard views from rear deck",
      "Geothermal heating/cooling",
      "Chef's kitchen with Wolf range",
      "Heated detached workshop/garage",
      "Steps from Ball's Falls Conservation Area",
      "20 Brix Winery within walking distance",
      "Custom millwork throughout",
    ],
    description:
      "Wine country living at its finest. Set in the heart of Vineland's tender fruit belt, this exceptional home blends refined interiors with the natural beauty of the Niagara Escarpment. Geothermal heating, vineyard views, and a heated workshop for the hobbyist. A rare find in one of Ontario's most scenic communities.",
    images: [
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=900&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80",
    ],
    listedAt: "2026-05-07T00:00:00Z",
    daysOnMarket: 8,
    taxes: 5880,
  },

  // ── NIAGARA FALLS ──────────────────────────────────────────────────────
  {
    id: "lst-009",
    mlsNumber: "X9366211",
    status: "Active",
    address: "5891 Riverbend Drive",
    city: "Niagara Falls",
    neighbourhood: "Chippawa",
    postalCode: "L2G 6S1",
    price: 829000,
    propertyType: "Single Family",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400,
    lotSize: "65 x 130 ft",
    yearBuilt: 2019,
    garage: "2-car attached",
    basement: "Finished, wet bar",
    heating: "Forced air gas",
    features: [
      "Niagara River corridor, backs to greenspace",
      "Open concept with vaulted ceilings",
      "Granite kitchen with large island",
      "Primary ensuite with freestanding tub",
      "Steps to Niagara River Recreational Trail",
      "Near Navy Island Park",
    ],
    description:
      "Situated in sought-after Chippawa, a quiet residential enclave along the Niagara River corridor, this near-new home offers outstanding value. Backs to peaceful greenspace with trail access right from your backyard. A rare blend of nature and modern comfort in Niagara Falls' most desirable pocket.",
    images: [
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&q=80",
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=900&q=80",
    ],
    listedAt: "2026-04-30T00:00:00Z",
    daysOnMarket: 15,
    taxes: 5060,
  },
  {
    id: "lst-010",
    mlsNumber: "X9391827",
    status: "Active",
    address: "7244 Dorchester Road",
    city: "Niagara Falls",
    neighbourhood: "Stamford",
    postalCode: "L2G 5T2",
    price: 579000,
    propertyType: "Townhouse",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1560,
    lotSize: "28 x 95 ft",
    yearBuilt: 2021,
    garage: "1-car attached",
    basement: "Unfinished",
    heating: "Forced air gas",
    features: [
      "Freehold, no condo fees",
      "Modern finishes throughout",
      "Open concept main floor",
      "Private fenced backyard",
      "Stamford Centre amenities walkable",
      "Easy QEW access",
    ],
    description:
      "Nearly new freehold townhome in a quiet pocket of Stamford. Clean, contemporary, and completely move-in ready. Freehold ownership means no monthly fees to worry about. Great for first-time buyers, young families, or investors looking for strong rental demand in Niagara Falls.",
    images: [
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=900&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80",
    ],
    listedAt: "2026-05-09T00:00:00Z",
    daysOnMarket: 6,
    taxes: 3420,
  },

  // ── FORT ERIE ──────────────────────────────────────────────────────────
  {
    id: "lst-011",
    mlsNumber: "X9358019",
    status: "Active",
    address: "392 Lakeshore Road",
    city: "Fort Erie",
    neighbourhood: "Crystal Beach",
    postalCode: "L0S 1B0",
    price: 899000,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1740,
    lotSize: "75 x 140 ft",
    yearBuilt: 1955,
    garage: "1-car detached",
    basement: "Partial",
    heating: "Forced air gas",
    features: [
      "Steps to Crystal Beach, one of Ontario's finest sand beaches",
      "Full renovation completed 2022",
      "Open concept kitchen & living",
      "Spacious rear deck for entertaining",
      "Beach community, vibrant summer village",
      "Short drive to Buffalo border crossing",
      "Investment / cottage potential",
    ],
    description:
      "Crystal Beach is having a moment, and this fully renovated home puts you right in the middle of it. Steps from one of Ontario's most stunning sandy beaches, with a thriving year-round community, new restaurants, and a creative arts scene. Perfect as a primary residence, a weekend retreat, or a rental investment.",
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=900&q=80",
    ],
    listedAt: "2026-04-18T00:00:00Z",
    daysOnMarket: 27,
    taxes: 4860,
  },

  // ── WELLAND ────────────────────────────────────────────────────────────
  {
    id: "lst-012",
    mlsNumber: "X9421045",
    status: "Active",
    address: "65 Hellems Avenue",
    city: "Welland",
    neighbourhood: "North Welland",
    postalCode: "L3C 3X4",
    price: 539000,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1380,
    lotSize: "50 x 110 ft",
    yearBuilt: 1988,
    garage: "1-car attached",
    basement: "Finished family room",
    heating: "Forced air gas",
    features: [
      "Updated kitchen with new appliances",
      "Hardwood on main floor",
      "Fenced yard with storage shed",
      "Near Notre Dame Catholic Secondary",
      "Quiet family street",
      "Quick access to Hwy 406",
    ],
    description:
      "Solid, well-cared-for family home in quiet North Welland. Updated throughout with a new kitchen, fresh paint, and updated flooring. The kind of turnkey home that makes every first-time buyer's list and checks all the boxes. A wonderful street, a fenced yard, and a finished basement.",
    images: [
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=900&q=80",
      "https://images.unsplash.com/photo-1560440021-33f9b867899d?w=900&q=80",
    ],
    listedAt: "2026-05-12T00:00:00Z",
    daysOnMarket: 3,
    taxes: 3290,
  },

  // ── THOROLD ────────────────────────────────────────────────────────────
  {
    id: "lst-013",
    mlsNumber: "X9394561",
    status: "Active",
    address: "19 Albert Street West",
    city: "Thorold",
    neighbourhood: "Downtown Thorold",
    postalCode: "L2V 2G7",
    price: 469000,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 1,
    sqft: 1200,
    lotSize: "40 x 100 ft",
    yearBuilt: 1945,
    garage: "None",
    basement: "Unfinished",
    heating: "Forced air gas",
    features: [
      "Character home, original hardwood",
      "Covered front porch",
      "Deep private lot",
      "Walking distance to Brock University",
      "Fantastic investment / rental opportunity",
      "Close to Welland Canal trail",
    ],
    description:
      "A classic character home with strong bones and excellent location. The Brock University corridor makes this an outstanding rental investment. Thorold is one of the Niagara region's most overlooked markets, with rising demand and limited supply. Add your own vision and unlock serious value.",
    images: [
      "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=900&q=80",
      "https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?w=900&q=80",
    ],
    listedAt: "2026-04-25T00:00:00Z",
    daysOnMarket: 20,
    taxes: 2890,
  },

  // ── PORT COLBORNE ──────────────────────────────────────────────────────
  {
    id: "lst-014",
    mlsNumber: "X9378834",
    status: "Price Reduced",
    address: "228 Otter Street",
    city: "Port Colborne",
    neighbourhood: "West Side",
    postalCode: "L3K 3B2",
    price: 629000,
    originalPrice: 689000,
    propertyType: "Single Family",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1960,
    lotSize: "80 x 165 ft",
    yearBuilt: 1972,
    garage: "1-car detached",
    basement: "Finished",
    heating: "Forced air gas",
    features: [
      "Oversized lot, rare for the area",
      "Renovated kitchen & baths",
      "Hardwood floors throughout",
      "Large private backyard with mature trees",
      "Walk to H.H. Knoll Lakeview Park",
      "Canal-side Canal Days community events",
      "Strong investment upside",
    ],
    description:
      "Port Colborne's West Side is attracting a growing wave of buyers seeking space, value, and lifestyle. This renovated four-bedroom on an 80-foot lot delivers all three. Walk to the lake, the Welland Canal, and the charming Main Street strip. An increasingly rare opportunity in one of Niagara's most authentic communities.",
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&q=80",
      "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=900&q=80",
    ],
    listedAt: "2026-04-08T00:00:00Z",
    daysOnMarket: 37,
    taxes: 3740,
  },

  // ── LUXURY - NOTL ESTATE ───────────────────────────────────────────────
  {
    id: "lst-015",
    mlsNumber: "X9344991",
    status: "Active",
    address: "1441 Niagara Stone Road",
    city: "Niagara-on-the-Lake",
    neighbourhood: "Virgil",
    postalCode: "L0S 1T0",
    price: 3450000,
    propertyType: "Luxury Estate",
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6200,
    lotSize: "2.8 acres",
    yearBuilt: 2021,
    garage: "3-car attached, heated",
    basement: "Full finished: home theatre, gym, wine cellar",
    heating: "Geothermal / radiant floor throughout",
    features: [
      "Custom-built 2021, never lived in",
      "Vineyard and Escarpment views",
      "Heated saltwater pool with cabana",
      "Home theatre & professional gym",
      "1,200-bottle temperature-controlled wine cellar",
      "Crestron smart home throughout",
      "Chef's kitchen with La Cornue range",
      "Primary suite with private terrace & spa ensuite",
      "3-car heated garage with car lift",
      "Surrounded by working vineyards",
    ],
    description:
      "The pinnacle of Niagara wine country living. Set on 2.8 acres in the prestigious Virgil corridor, this extraordinary custom estate was completed in 2021 and has never been occupied. World-class finishes at every turn: geothermal heating, Crestron automation, a La Cornue kitchen, and a private primary wing that rivals the finest hotels. The wine cellar, home theatre, and professional gym ensure every amenity is within reach. A true legacy property.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=900&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=900&q=80",
    ],
    listedAt: "2026-03-15T00:00:00Z",
    daysOnMarket: 61,
    taxes: 16200,
  },
];

// ── Helper: match a listing against a lead's questionnaire answers ─────────
// Returns a 0–100 compatibility score and a list of matching reasons.

export interface ListingMatch {
  score: number;
  reasons: string[];
  warnings: string[];
}

export function matchListingToLead(
  listing: Listing,
  answers: import("@/types").QuestionnaireAnswers
): ListingMatch {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Budget (35 pts)
  if (answers.budgetMin && answers.budgetMax) {
    if (listing.price >= answers.budgetMin && listing.price <= answers.budgetMax) {
      score += 35;
      reasons.push("Within budget range");
    } else if (listing.price < answers.budgetMin) {
      score += 20;
      reasons.push("Below budget, room to negotiate or invest in renovations");
    } else {
      const over = ((listing.price - answers.budgetMax) / answers.budgetMax) * 100;
      if (over <= 10) { score += 15; warnings.push(`Slightly over budget by ${over.toFixed(0)}%`); }
      else warnings.push("Over stated budget");
    }
  }

  // City / location (25 pts)
  const preferredCities = (answers.preferredCity || "").toLowerCase();
  const preferredHoods = (answers.preferredNeighbourhoods || "").toLowerCase();
  if (preferredCities.includes(listing.city.toLowerCase())) {
    score += 20;
    reasons.push(`Located in ${listing.city}`);
  }
  if (preferredHoods.includes(listing.neighbourhood.toLowerCase())) {
    score += 5;
    reasons.push(`In preferred neighbourhood: ${listing.neighbourhood}`);
  }

  // Property type (15 pts)
  if (answers.propertyType && listing.propertyType === answers.propertyType) {
    score += 15;
    reasons.push(`Matches property type: ${listing.propertyType}`);
  }

  // Bedrooms (10 pts)
  if (answers.bedrooms && listing.bedrooms >= answers.bedrooms) {
    score += 10;
    reasons.push(`${listing.bedrooms} bedrooms, meets requirement`);
  } else if (answers.bedrooms && listing.bedrooms < answers.bedrooms) {
    warnings.push(`Only ${listing.bedrooms} bed (wanted ${answers.bedrooms}+)`);
  }

  // Must-haves keyword match (15 pts, 3pts each, up to 5)
  let mustHaveMatches = 0;
  for (const must of answers.mustHaves) {
    const keyword = must.toLowerCase();
    const matchesFeature = listing.features.some((f) =>
      f.toLowerCase().includes(keyword) ||
      keyword.includes(f.toLowerCase().split(" ")[0])
    );
    const matchesDesc = listing.description.toLowerCase().includes(keyword);
    if (matchesFeature || matchesDesc) {
      mustHaveMatches++;
      if (mustHaveMatches <= 5) {
        score += 3;
        reasons.push(`Has: ${must}`);
      }
    }
  }

  // Deal breaker check
  for (const breaker of answers.dealBreakers) {
    const keyword = breaker.toLowerCase();
    if (
      listing.description.toLowerCase().includes(keyword) ||
      listing.features.some((f) => f.toLowerCase().includes(keyword))
    ) {
      warnings.push(`Possible deal breaker: "${breaker}"`);
      score = Math.max(0, score - 15);
    }
  }

  return { score: Math.min(100, score), reasons, warnings };
}
