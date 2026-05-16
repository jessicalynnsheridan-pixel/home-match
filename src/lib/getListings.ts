import { Listing, ListingStatus, NiagaraCity, PropertyType } from "@/types";
import { niagaraListings } from "@/data/niagaraListings";

// ─── RESO field mappers ────────────────────────────────────────────────────

function mapStatus(raw: string): ListingStatus {
  switch ((raw ?? "").toLowerCase().replace(/\s/g, "")) {
    case "active":                return "Active";
    case "pricereduced":          return "Price Reduced";
    case "pending":
    case "activeundercontract":
    case "undercontract":         return "Under Contract";
    case "closed":
    case "sold":                  return "Sold";
    default:                      return "Active";
  }
}

function mapPropertyType(type: string, subType: string): PropertyType {
  const s = `${type} ${subType}`.toLowerCase();
  if (s.includes("condo") || s.includes("apartment"))       return "Condo";
  if (s.includes("townhouse") || s.includes("townhome"))    return "Townhouse";
  if (s.includes("multi") || s.includes("duplex"))          return "Multi-Family";
  if (s.includes("land") || s.includes("lot"))              return "Land";
  if (s.includes("luxury") || s.includes("estate"))         return "Luxury Estate";
  return "Single Family";
}

type ResoRecord = Record<string, unknown>;

function mapResoRecord(p: ResoRecord, index: number): Listing {
  const media = (p.Media as Array<{ MediaURL?: string }>) ?? [];
  const images = media.map((m) => m.MediaURL).filter(Boolean) as string[];

  const listPrice = Number(p.ListPrice ?? 0);
  const origPrice = p.OriginalListPrice ? Number(p.OriginalListPrice) : undefined;

  // Build a features array from common RESO feature fields
  const featureSources = [
    p.Appliances,
    p.InteriorFeatures,
    p.ExteriorFeatures,
    p.PoolFeatures,
    p.FireplaceFeatures,
  ];
  const features: string[] = featureSources.flatMap((f) =>
    Array.isArray(f) ? f : typeof f === "string" && f ? [f] : []
  );

  return {
    id: String(p.ListingKey ?? `reso-${index}`),
    mlsNumber: String(p.ListingId ?? p.ListingKey ?? ""),
    status: mapStatus(String(p.StandardStatus ?? "Active")),
    address: String(
      p.UnparsedAddress ??
        `${p.StreetNumber ?? ""} ${p.StreetName ?? ""} ${p.StreetSuffix ?? ""}`.trim()
    ),
    city: String(p.City ?? "St. Catharines") as NiagaraCity,
    neighbourhood: String(p.SubdivisionName ?? p.Neighborhood ?? ""),
    postalCode: String(p.PostalCode ?? ""),
    price: listPrice,
    originalPrice:
      origPrice && origPrice !== listPrice ? origPrice : undefined,
    propertyType: mapPropertyType(
      String(p.PropertyType ?? ""),
      String(p.PropertySubType ?? "")
    ),
    bedrooms: Number(p.BedroomsTotal ?? 0),
    bathrooms: Number(p.BathroomsTotalInteger ?? p.BathroomsFull ?? 0),
    sqft: Number(p.LivingArea ?? 0),
    lotSize: String(p.LotSizeDimensions ?? p.LotSizeArea ?? ""),
    yearBuilt: Number(p.YearBuilt ?? 0),
    garage: p.GarageSpaces ? `${p.GarageSpaces}-car` : "None",
    basement: String(p.Basement ?? p.BasementFeatures ?? ""),
    heating: String(p.Heating ?? p.HeatingSystem ?? ""),
    features,
    description: String(p.PublicRemarks ?? ""),
    images:
      images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"],
    listedAt: String(
      p.OnMarketDate ?? p.ListingContractDate ?? new Date().toISOString()
    ),
    daysOnMarket: Number(p.DaysOnMarket ?? 0),
    taxes: Number(p.TaxAnnualAmount ?? 0),
    maintenanceFee: p.AssociationFee ? Number(p.AssociationFee) : undefined,
    virtualTourUrl: p.VirtualTourURLUnbranded
      ? String(p.VirtualTourURLUnbranded)
      : undefined,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  const apiUrl = process.env.RESO_API_URL;
  const apiToken = process.env.RESO_API_TOKEN;

  if (apiUrl && apiToken) {
    try {
      const query =
        process.env.RESO_QUERY ??
        "$filter=StandardStatus eq 'Active'&$expand=Media&$top=200&$orderby=OnMarketDate desc";

      const res = await fetch(`${apiUrl}/Property?${query}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: "application/json",
        },
        next: { revalidate: 900 }, // revalidate every 15 minutes
      });

      if (!res.ok) {
        console.error(`[RESO] ${res.status} ${res.statusText} — falling back to mock data`);
        return niagaraListings;
      }

      const json = await res.json();
      const records: ResoRecord[] = Array.isArray(json.value) ? json.value : [];
      return records.map(mapResoRecord);
    } catch (err) {
      console.error("[RESO] Fetch failed — falling back to mock data:", err);
      return niagaraListings;
    }
  }

  return niagaraListings;
}

export async function getListing(id: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find((l) => l.id === id) ?? null;
}
