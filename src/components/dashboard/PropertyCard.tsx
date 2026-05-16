import { PropertyRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ExternalLink, BedDouble, Bath, Ruler } from "lucide-react";
import Image from "next/image";

interface PropertyCardProps {
  property: PropertyRecommendation;
}

export default function PropertyCard({ property: p }: PropertyCardProps) {
  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm">
      {/* Photo */}
      <div className="relative h-44 w-full bg-[#e8e4de]">
        <Image
          src={p.imageUrl}
          alt={p.address}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[#2c2825] font-medium text-sm leading-snug">{p.address}</p>
          {p.listingUrl && (
            <a
              href={p.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8c8580] hover:text-[#2c2825] shrink-0 ml-2"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <p className="text-[#b8a88a] font-semibold text-lg mb-3">
          {formatCurrency(p.price)}
        </p>

        <div className="flex items-center gap-4 text-xs text-[#8c8580] mb-4">
          <span className="flex items-center gap-1.5">
            <BedDouble size={12} /> {p.bedrooms} bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={12} /> {p.bathrooms} bath
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler size={12} /> {p.sqft.toLocaleString()} sqft
          </span>
        </div>

        {/* Match reason */}
        <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl p-3.5 mb-3">
          <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-1.5">
            Why this matches
          </p>
          <p className="text-[#2c2825] text-xs leading-relaxed">{p.matchReason}</p>
        </div>

        {/* Realtor note */}
        {p.realtorNotes && (
          <p className="text-[#8c8580] text-xs italic leading-relaxed mb-4">
            &ldquo;{p.realtorNotes}&rdquo;
          </p>
        )}

        <button className="w-full bg-[#2c2825] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#1a1714] transition-colors">
          Request a Showing
        </button>
      </div>
    </div>
  );
}
