import Link from "next/link";
import { Lead } from "@/types";
import { formatCurrency, formatDate, getScoreColor } from "@/lib/utils";
import { Star, Phone, Mail, MessageSquare, Clock, MapPin, Calendar, DollarSign } from "lucide-react";

// ─── Playbook ─────────────────────────────────────────────────────────────────

type Playbook = { icon: React.ReactNode; action: string; color: string; bg: string; border: string };

function getPlaybook(lead: Lead): Playbook {
  const { answers, score } = lead;
  const isFinanced = answers.preApprovalStatus === "Yes, fully approved" || answers.preApprovalStatus === "Paying cash";
  const isASAP = answers.timeline === "ASAP" || answers.timeline === "1–3 months";

  if (score === "Hot" && isASAP && isFinanced) return {
    icon: <Phone size={10} />, action: "Call within 2 hours",
    color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
  };
  if (score === "Hot") return {
    icon: <Mail size={10} />, action: "Email today, call tomorrow",
    color: "#d97706", bg: "#fffbeb", border: "#fde68a",
  };
  if (score === "Warm") return {
    icon: <MessageSquare size={10} />, action: "Email now, follow up in 5 days",
    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
  };
  return {
    icon: <Clock size={10} />, action: "Monthly touch",
    color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb",
  };
}

export default function LeadCard({ lead }: { lead: Lead }) {
  const { answers } = lead;
  const pb = getPlaybook(lead);

  return (
    <Link
      href={`/dashboard/${lead.id}`}
      className="flex items-stretch bg-white border border-[#e8e4de] rounded-2xl overflow-hidden hover:border-[#2c2825] hover:shadow-md transition-all group"
    >
      {/* Colored left accent based on score */}
      <div className="w-1 shrink-0" style={{
        background: lead.score === "Hot" ? "#ef4444" : lead.score === "Warm" ? "#f59e0b" : "#d1d5db"
      }} />

      <div className="flex-1 p-4">
        {/* Top row: name + badges */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {lead.isPriority && <Star size={11} className="text-[#b8a88a] fill-[#b8a88a] shrink-0" />}
            <p className="text-[#2c2825] font-semibold text-sm truncate">
              {answers.firstName} {answers.lastName}
            </p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${getScoreColor(lead.score)}`}>
            {lead.score}
          </span>
        </div>

        {/* Action directive */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 mb-3 border w-fit"
          style={{ background: pb.bg, borderColor: pb.border }}
        >
          <span style={{ color: pb.color }}>{pb.icon}</span>
          <p className="text-[10px] font-semibold" style={{ color: pb.color }}>{pb.action}</p>
        </div>

        {/* Key facts — compact 2-column */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1">
            <DollarSign size={10} className="text-[#b8b4b0] shrink-0" />
            <p className="text-xs text-[#2c2825] truncate">{formatCurrency(answers.budgetMin)}–{formatCurrency(answers.budgetMax)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={10} className="text-[#b8b4b0] shrink-0" />
            <p className="text-xs text-[#2c2825] truncate">{answers.timeline || "—"}</p>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={10} className="text-[#b8b4b0] shrink-0" />
            <p className="text-xs text-[#2c2825] truncate">{answers.preferredCity || "—"}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#b8b4b0] text-[10px] shrink-0">🏠</span>
            <p className="text-xs text-[#2c2825] truncate">{answers.propertyType || "—"} · {answers.bedrooms}bd</p>
          </div>
        </div>

        {/* Footer: status + date */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#f0ece6]">
          <span className="text-[10px] text-[#8c8580]">{lead.status}</span>
          <span className="text-[10px] text-[#b8b4b0]">{formatDate(lead.submittedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
