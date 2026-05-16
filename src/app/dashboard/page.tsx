"use client";

import { useState } from "react";
import { mockLeads } from "@/data/mockLeads";
import LeadCard from "@/components/dashboard/LeadCard";
import { Lead, LeadScore, LeadStatus } from "@/types";
import { Download, SlidersHorizontal } from "lucide-react";

const SCORE_FILTERS: (LeadScore | "All")[] = ["All", "Hot", "Warm", "Browsing"];
const STATUS_FILTERS: (LeadStatus | "All")[] = [
  "All",
  "New Lead",
  "Qualified",
  "Showing Booked",
  "Offer Stage",
  "Closed",
];

function exportLeads(leads: Lead[]) {
  // Build a simple CSV from lead data
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Score",
    "Status",
    "Budget Min",
    "Budget Max",
    "Timeline",
    "Location",
    "Property Type",
    "Pre-Approval",
    "Submitted",
  ].join(",");

  const rows = leads.map((l) =>
    [
      `"${l.answers.firstName} ${l.answers.lastName}"`,
      l.answers.email,
      l.answers.phone,
      l.score,
      l.status,
      l.answers.budgetMin,
      l.answers.budgetMax,
      l.answers.timeline,
      l.answers.preferredCity,
      l.answers.propertyType,
      l.answers.preApprovalStatus,
      l.submittedAt,
    ].join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "homematch-leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const [scoreFilter, setScoreFilter] = useState<LeadScore | "All">("All");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [priorityOnly, setPriorityOnly] = useState(false);

  const filtered = mockLeads.filter((lead) => {
    if (scoreFilter !== "All" && lead.score !== scoreFilter) return false;
    if (statusFilter !== "All" && lead.status !== statusFilter) return false;
    if (priorityOnly && !lead.isPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${lead.answers.firstName} ${lead.answers.lastName}`.toLowerCase();
      if (
        !name.includes(q) &&
        !lead.answers.preferredCity.toLowerCase().includes(q) &&
        !lead.answers.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // Summary stats from all leads
  const hot = mockLeads.filter((l) => l.score === "Hot").length;
  const warm = mockLeads.filter((l) => l.score === "Warm").length;
  const newLeads = mockLeads.filter((l) => l.status === "New Lead").length;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-1">
              Realtor Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-[#2c2825]">Buyer Leads</h1>
          </div>
          <button
            onClick={() => exportLeads(filtered)}
            className="flex items-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm px-5 py-2.5 rounded-full hover:border-[#2c2825] transition-colors bg-white"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: mockLeads.length },
            { label: "Hot Leads", value: hot },
            { label: "Warm Leads", value: warm },
            { label: "New (Uncontacted)", value: newLeads },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-4 shadow-sm"
            >
              <p className="text-2xl font-semibold text-[#2c2825]">{s.value}</p>
              <p className="text-[#8c8580] text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or city..."
              className="flex-1 border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7]"
            />

            {/* Score filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal size={14} className="text-[#8c8580] shrink-0" />
              {SCORE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setScoreFilter(f)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                    scoreFilter === f
                      ? "bg-[#2c2825] text-white border-[#2c2825]"
                      : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                    statusFilter === f
                      ? "bg-[#2c2825] text-white border-[#2c2825]"
                      : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Priority toggle */}
            <button
              onClick={() => setPriorityOnly((v) => !v)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                priorityOnly
                  ? "bg-[#b8a88a] text-[#2c2825] border-[#b8a88a] font-medium"
                  : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
              }`}
            >
              Priority only
            </button>
          </div>
        </div>

        {/* Lead count */}
        <p className="text-[#8c8580] text-sm mb-5">
          Showing {filtered.length} of {mockLeads.length} leads
        </p>

        {/* Lead grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#e8e4de] rounded-2xl">
            <p className="text-[#2c2825] font-medium mb-2">No leads match your filters</p>
            <p className="text-[#8c8580] text-sm">Try adjusting the filters above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
