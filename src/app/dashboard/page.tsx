"use client";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockLeads } from "@/data/mockLeads";
import LeadCard from "@/components/dashboard/LeadCard";
import { Lead, LeadScore, LeadStatus } from "@/types";
import { Download, Flame, Zap, Eye, AlertCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
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
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-[#2c2825]">Leads</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLeads(filtered)}
              className="flex items-center gap-1.5 border border-[#e8e4de] text-[#8c8580] text-xs px-4 py-2 rounded-full hover:border-[#2c2825] hover:text-[#2c2825] transition-colors bg-white"
            >
              <Download size={12} /> Export
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 border border-[#e8e4de] text-[#8c8580] text-xs px-4 py-2 rounded-full hover:border-rose-300 hover:text-rose-600 transition-colors bg-white"
              title="Sign out"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>

        {/* ── Stats strip ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: mockLeads.length, icon: <Eye size={13} />, color: "text-[#8c8580]" },
            { label: "Hot", value: hot, icon: <Flame size={13} />, color: "text-rose-500" },
            { label: "Warm", value: warm, icon: <Zap size={13} />, color: "text-amber-500" },
            { label: "New", value: newLeads, icon: <AlertCircle size={13} />, color: "text-blue-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#e8e4de] rounded-xl px-3 py-3 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className="text-lg font-bold text-[#2c2825] leading-none">{s.value}</p>
              <p className="text-[10px] text-[#8c8580] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + filters ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, city…"
            className="flex-1 border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-white"
          />
          <div className="flex gap-1.5 flex-wrap">
            {SCORE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all ${
                  scoreFilter === f
                    ? "bg-[#2c2825] text-white border-[#2c2825]"
                    : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => setPriorityOnly((v) => !v)}
              className={`text-xs px-3 py-2 rounded-xl border transition-all ${
                priorityOnly
                  ? "bg-[#b8a88a]/20 text-[#8c6a3e] border-[#b8a88a]"
                  : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825]"
              }`}
            >
              ★ Priority
            </button>
          </div>
        </div>

        {/* ── Status filter row ───────────────────────────────────────────── */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                statusFilter === f
                  ? "bg-[#2c2825] text-white border-[#2c2825]"
                  : "bg-white text-[#8c8580] border-[#e8e4de] hover:text-[#2c2825]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Lead count ─────────────────────────────────────────────────── */}
        <p className="text-[#b8b4b0] text-xs mb-4">
          {filtered.length} of {mockLeads.length} leads
        </p>

        {/* ── Lead list ──────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-[#e8e4de] rounded-2xl">
            <p className="text-[#2c2825] font-medium mb-1">No leads match</p>
            <p className="text-[#8c8580] text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
