import { PropertyRecommendation } from "@/types";

// Mock property recommendations — swap image URLs for real ones or connect to MLS later
export const mockProperties: PropertyRecommendation[] = [
  {
    id: "prop-001",
    leadId: "lead-001",
    address: "14 Crescent Road, Rosedale, Toronto ON",
    price: 1695000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2840,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    matchReason:
      "Quiet tree-lined street in top-rated school zone. Renovated chef's kitchen, double garage, and private backyard — matches every must-have.",
    realtorNotes: "Sellers are motivated. Listed 14 days ago. Could negotiate to $1.65M.",
    listingUrl: "#",
  },
  {
    id: "prop-002",
    leadId: "lead-001",
    address: "88 Forest Hill Road, Forest Hill, Toronto ON",
    price: 1795000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3100,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    matchReason:
      "Forest Hill Village — walkable, top schools, stunning primary ensuite. Home office addition completed 2024.",
    realtorNotes: "New listing — expected to move fast. Book showing ASAP.",
    listingUrl: "#",
  },
  {
    id: "prop-003",
    leadId: "lead-002",
    address: "12 Hiawatha Pkwy, Port Credit, Mississauga ON",
    price: 1050000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1920,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    matchReason:
      "Steps to Port Credit GO station and the waterfront trail. Fenced backyard — perfect for a dog. Updated kitchen and finished basement.",
    realtorNotes: "Great value for the street. Has been on market 21 days.",
    listingUrl: "#",
  },
  {
    id: "prop-004",
    leadId: "lead-004",
    address: "52 The Bridle Path, Toronto ON",
    price: 3200000,
    bedrooms: 6,
    bathrooms: 6,
    sqft: 6800,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    matchReason:
      "Iconic Bridle Path estate. Wine cellar, home gym, resort-style pool, Crestron smart home. Triple garage on 110ft lot.",
    realtorNotes: "Off-market opportunity — exclusive preview available.",
    listingUrl: "#",
  },
];
