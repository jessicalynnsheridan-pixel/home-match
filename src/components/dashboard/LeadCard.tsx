import Link from "next/link";
import { Lead } from "@/types";
import { formatCurrency, formatDate, getScoreColor, getStatusColor, isOverdue } from "@/lib/utils";
import { Star, Bell } from "lucide-react";
import { calcBuyerIntelligence, CommunicationStyle } from "@/lib/buyerIntelligence";

const STYLE_BADGE: Record<CommunicationStyle, string> = {
  Analytical: "bg-blue-50 text-blue-700 border-blue-200",
  Visionary:  "bg-violet-50 text-violet-700 border-violet-200",
  Decisive:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cautious:   "bg-amber-50 text-amber-700 border-amber-200",
};

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const { answers } = lead;
  const { style } = calcBuyerIntelligence(answers);

  return (
    <Link
      href={`/dashboard/${lead.id}`}
      className="block bg-white border border-[#e8e4de] rounded-2xl p-6 shadow-sm hover:border-[#2c2825] hover:shadow-md transition-all group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {lead.isPriority && (
            <Star size={14} className="text-[#b8a88a] fill-[#b8a88a]" />
          )}
          <h3 className="text-[#2c2825] font-semibold">
            {answers.firstName} {answers.lastName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {lead.reminders?.some((r) => !r.completed && isOverdue(r.dueDate)) && (
            <Bell size={13} className="text-rose-500" />
          )}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border ${getScoreColor(lead.score)}`}
          >
            {lead.score}
          </span>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(lead.status)}`}
          >
            {lead.status}
          </span>
        </div>
      </div>

      {/* Match score bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#8c8580] mb-1">
          <span>Match Score</span>
          <span className="font-medium text-[#2c2825]">{lead.matchScore}/100</span>
        </div>
        <div className="h-1.5 bg-[#e8e4de] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${lead.matchScore >= 80 ? "bg-rose-400" : lead.matchScore >= 50 ? "bg-amber-400" : "bg-slate-300"}`}
            style={{ width: `${lead.matchScore}%` }}
          />
        </div>
      </div>

      {/* Key facts grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <Fact label="Budget">
          {formatCurrency(answers.budgetMin)} – {formatCurrency(answers.budgetMax)}
        </Fact>
        <Fact label="Timeline">{answers.timeline || "-"}</Fact>
        <Fact label="Location">{answers.preferredCity || "-"}</Fact>
        <Fact label="Property type">{answers.propertyType || "-"}</Fact>
        <Fact label="Pre-approval">{answers.preApprovalStatus || "-"}</Fact>
        <Fact label="Beds / Baths">
          {answers.bedrooms}+ bed · {answers.bathrooms}+ bath
        </Fact>
      </div>

      {/* Must-haves snippet */}
      {answers.mustHaves.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {answers.mustHaves.slice(0, 4).map((item) => (
            <span
              key={item}
              className="text-xs bg-[#f5f3f0] text-[#2c2825] border border-[#e8e4de] px-2.5 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
          {answers.mustHaves.length > 4 && (
            <span className="text-xs text-[#8c8580] px-1 py-1">
              +{answers.mustHaves.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e8e4de]">
        <div className="flex items-center gap-2">
          <p className="text-[#8c8580] text-xs">
            Submitted {formatDate(lead.submittedAt)}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${STYLE_BADGE[style.type]}`}>
            {style.type}
          </span>
        </div>
        <p className="text-[#2c2825] text-xs font-medium group-hover:underline">
          View full profile
        </p>
      </div>
    </Link>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[#8c8580] text-xs mb-0.5">{label}</p>
      <p className="text-[#2c2825] text-sm font-medium">{children}</p>
    </div>
  );
}
