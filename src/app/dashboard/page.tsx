"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockLeads } from "@/data/mockLeads";
import LeadCard from "@/components/dashboard/LeadCard";
import { Lead, LeadScore, LeadStatus } from "@/types";
import { Download, Flame, Zap, Eye, AlertCircle, Copy, Check, Link2, Phone, Mail, ChevronRight, Star, Users, TrendingUp, ChevronDown, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const SCORE_FILTERS: (LeadScore | "All")[] = ["All", "Hot", "Warm", "Browsing"];
const STATUS_FILTERS: (LeadStatus | "All")[] = [
  "All", "New Lead", "Qualified", "Showing Booked", "Offer Stage", "Closed",
];

function exportLeads(leads: Lead[]) {
  const headers = ["Name","Email","Phone","Score","Status","Budget Min","Budget Max","Timeline","Location","Property Type","Pre-Approval","Submitted"].join(",");
  const rows = leads.map((l) =>
    [`"${l.answers.firstName} ${l.answers.lastName}"`, l.answers.email, l.answers.phone, l.score, l.status, l.answers.budgetMin, l.answers.budgetMax, l.answers.timeline, l.answers.preferredCity, l.answers.propertyType, l.answers.preApprovalStatus, l.submittedAt].join(",")
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

function mapSupabaseLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    score: (row.score as Lead["score"]) ?? "Browsing",
    matchScore: (row.match_score as number) ?? 0,
    status: (row.status as Lead["status"]) ?? "New Lead",
    isPriority: (row.is_priority as boolean) ?? false,
    submittedAt: row.submitted_at as string,
    realtorNotes: [],
    reminders: [],
    savedHomeIds: [],
    answers: row.answers as Lead["answers"],
  };
}

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}${name ? `, ${name}` : ""}`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
}

function quickGmailUrl(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function openGmailPopup(to: string, subject: string, body: string) {
  window.open(quickGmailUrl(to, subject, body), "gmail_compose", "width=960,height=720,left=200,top=100");
}

function quickSmsUrl(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

type ActionItem = {
  id: string;
  priority: "urgent" | "high" | "medium";
  icon: "call" | "email" | "new" | "followup";
  label: string;
  sub: string;
  leadId: string;
  phone?: string;
  emailAddr?: string;
  lead: Lead;
};

function generateQuickMessage(item: ActionItem, lead: Lead, realtorName: string): string {
  const name = lead.answers.firstName;
  const city = lead.answers.preferredCity || "your area";
  const from = realtorName || "Your Name";

  if (item.icon === "call" || item.icon === "email") {
    const hook = lead.answers.sundayMorning
      ? `You mentioned ${lead.answers.sundayMorning.toLowerCase()} as your ideal Sunday`
      : lead.answers.homeFeeling?.[0]
      ? `You're looking for something ${lead.answers.homeFeeling[0].toLowerCase()}`
      : `You have a clear sense of what you want`;
    return `Hi ${name}, it's ${from} from Home Match. ${hook}. I have a couple of properties in ${city} that I think could be a real fit. Worth a quick 5-minute call this week?`;
  }
  if (item.icon === "new") {
    const propType = lead.answers.propertyType || "property";
    const timeline = lead.answers.timeline || "";
    return `New profile submitted: ${name} is looking for a ${propType} in ${city}. Budget and timeline look ${timeline === "ASAP" || timeline === "1–3 months" ? "urgent" : "solid"}. Open their profile to review and reach out.`;
  }
  return `Hi ${name}, it's ${from}. Just following up. Still keeping an eye out for ${city} properties that match what you described. Anything new on your end?`;
}

function buildActionQueue(leads: Lead[]): ActionItem[] {
  const items: ActionItem[] = [];
  for (const lead of leads) {
    const name = `${lead.answers.firstName} ${lead.answers.lastName}`;
    const isHot = lead.score === "Hot";
    const isWarm = lead.score === "Warm";
    const isNew = lead.status === "New Lead";
    const isASAP = lead.answers.timeline === "ASAP" || lead.answers.timeline === "1–3 months";
    const isFinanced = lead.answers.preApprovalStatus === "Yes, fully approved" || lead.answers.preApprovalStatus === "Paying cash";

    if (isHot && isASAP && isFinanced) {
      items.push({ id: `call-${lead.id}`, priority: "urgent", icon: "call", label: `Call ${name} now`, sub: "Hot · Pre-approved · ASAP, act now", leadId: lead.id, phone: lead.answers.phone, emailAddr: lead.answers.email, lead });
    } else if (isHot && isNew) {
      items.push({ id: `email-${lead.id}`, priority: "high", icon: "email", label: `Send first email to ${name}`, sub: "Hot lead · New, reach out within the hour", leadId: lead.id, emailAddr: lead.answers.email, lead });
    } else if (isNew) {
      items.push({ id: `new-${lead.id}`, priority: isWarm ? "high" : "medium", icon: "new", label: `New lead: ${name}`, sub: `${lead.score} · ${lead.answers.propertyType || "Buyer"} in ${lead.answers.preferredCity || "N/A"}`, leadId: lead.id, lead });
    } else if (isWarm) {
      items.push({ id: `followup-${lead.id}`, priority: "medium", icon: "followup", label: `Follow up with ${name}`, sub: `Warm · ${lead.status}, keep the momentum`, leadId: lead.id, emailAddr: lead.answers.email, lead });
    }
  }
  const order = { urgent: 0, high: 1, medium: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 5);
}

const PRIORITY_CONFIG = {
  urgent: {
    cardBg: "bg-white",
    border: "border border-[#e8e4de]",
    leftBar: "bg-rose-400",
    badge: "bg-[#f5f3f0] text-[#5c5550] border border-[#e8e4de]",
    badgeLabel: "Urgent",
    iconBg: "bg-[#f5f3f0] text-[#2c2825]",
    ctaBg: "bg-[#2c2825] hover:bg-[#1a1714] text-white",
    expandBg: "bg-[#faf9f7]",
  },
  high: {
    cardBg: "bg-white",
    border: "border border-[#e8e4de]",
    leftBar: "bg-amber-300",
    badge: "bg-[#f5f3f0] text-[#5c5550] border border-[#e8e4de]",
    badgeLabel: "Today",
    iconBg: "bg-[#f5f3f0] text-[#2c2825]",
    ctaBg: "bg-[#2c2825] hover:bg-[#1a1714] text-white",
    expandBg: "bg-[#faf9f7]",
  },
  medium: {
    cardBg: "bg-white",
    border: "border border-[#e8e4de]",
    leftBar: "bg-[#b8a88a]",
    badge: "bg-[#f5f3f0] text-[#5c5550] border border-[#e8e4de]",
    badgeLabel: "This week",
    iconBg: "bg-[#f5f3f0] text-[#2c2825]",
    ctaBg: "bg-[#2c2825] hover:bg-[#1a1714] text-white",
    expandBg: "bg-[#faf9f7]",
  },
};

function ActionQueueItem({
  item,
  isChecked,
  isExpanded,
  realtorName,
  onToggleCheck,
  onToggleExpand,
}: {
  item: ActionItem;
  isChecked: boolean;
  isExpanded: boolean;
  realtorName: string;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
}) {
  const s = PRIORITY_CONFIG[item.priority];
  const message = generateQuickMessage(item, item.lead, realtorName);
  const isEmailType = item.icon === "email" || (item.icon === "followup" && item.emailAddr);
  const gmailUrl = item.emailAddr
    ? quickGmailUrl(item.emailAddr, `Homes in ${item.lead.answers.preferredCity || "your area"} | Home Match`, message)
    : "";
  const smsUrl = item.phone ? quickSmsUrl(item.phone, message) : "";

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(message);
  }

  const initials = `${item.lead.answers.firstName?.[0] ?? ""}${item.lead.answers.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className={`rounded-2xl overflow-hidden transition-all ${s.border} ${isChecked ? "opacity-40 scale-[0.99]" : ""}`}>
      {/* Card row */}
      <div
        className={`${s.cardBg} cursor-pointer`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          {/* Colored left indicator */}
          <div className={`w-1 self-stretch rounded-full shrink-0 ${s.leftBar}`} />

          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.iconBg}`}>
            {initials || "?"}
          </div>

          {/* Text + mobile actions */}
          <div className="flex-1 min-w-0">
            {/* Top row: name + desktop CTAs + chevron */}
            <div className="flex items-center gap-2">
              <p className={`flex-1 text-sm font-semibold text-[#1a1714] truncate ${isChecked ? "line-through opacity-50" : ""}`}>
                {item.label}
              </p>

              {/* Badge — hidden on mobile, shown on sm+ */}
              <span className={`hidden sm:inline-flex shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                {s.badgeLabel}
              </span>

              {/* CTA buttons — hidden on mobile */}
              {item.icon === "call" && item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`hidden sm:flex items-center gap-1.5 shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Phone size={11} /> Call
                </a>
              )}
              {item.emailAddr && item.icon !== "call" && (
                <button
                  onClick={(e) => { e.stopPropagation(); openGmailPopup(item.emailAddr!, `Homes in ${item.lead.answers.preferredCity || "your area"} | Home Match`, message); }}
                  className={`hidden sm:flex items-center gap-1.5 shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Mail size={11} /> Email
                </button>
              )}

              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
                className="shrink-0 w-6 h-6 rounded-lg border-2 border-white/70 flex items-center justify-center hover:border-emerald-400 transition-colors bg-white/50"
                aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
              >
                {isChecked && <Check size={12} className="text-emerald-600" />}
              </button>

              <ChevronDown size={14} className={`shrink-0 text-[#9c9590] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>

            {/* Sub text */}
            <p className="text-xs text-[#6b6560] mt-0.5 truncate">{item.sub}</p>

            {/* Mobile-only bottom row: badge + CTA */}
            <div className="flex items-center gap-2 mt-2.5 sm:hidden">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                {s.badgeLabel}
              </span>
              {item.icon === "call" && item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Phone size={11} /> Call
                </a>
              )}
              {item.emailAddr && item.icon !== "call" && (
                <button
                  onClick={(e) => { e.stopPropagation(); openGmailPopup(item.emailAddr!, `Homes in ${item.lead.answers.preferredCity || "your area"} | Home Match`, message); }}
                  className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Mail size={11} /> Email
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded message panel */}
      {isExpanded && (
        <div className={`px-5 pb-4 pt-3 ${s.expandBg} border-t border-white/60`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6560] mb-2">Prepared message</p>
          <p className="text-xs text-[#3c3835] leading-relaxed bg-white/80 border border-white/60 rounded-xl px-3.5 py-3 mb-3 backdrop-blur-sm">
            {message}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e0dbd5] text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium"
            >
              <Copy size={11} /> Copy text
            </button>
            {isEmailType && item.emailAddr ? (
              <button
                onClick={(e) => { e.stopPropagation(); openGmailPopup(item.emailAddr!, `Homes in ${item.lead.answers.preferredCity || "your area"} | Home Match`, message); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e0dbd5] text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium">
                <ExternalLink size={11} /> Open in Gmail
              </button>
            ) : smsUrl ? (
              <a href={smsUrl}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e0dbd5] text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium">
                <ExternalLink size={11} /> Open in Messages
              </a>
            ) : null}
            <Link href={`/dashboard/${item.leadId}`}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-[#b8a88a] hover:text-[#8c6a3e] transition-colors font-medium ml-auto">
              Full profile <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [scoreFilter, setScoreFilter] = useState<LeadScore | "All">("All");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [realLeads, setRealLeads] = useState<Lead[]>([]);
  const [realtorName, setRealtorName] = useState<string>("");
  const [realtorId, setRealtorId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const demoLeads = mockLeads;
  const allLeads = loading ? [] : realLeads.length > 0 ? realLeads : demoLeads;

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setRealtorId(user.id);
      setRealtorName((user.user_metadata?.first_name as string) ?? "");
      const { data } = await supabase.from("leads").select("*").eq("realtor_id", user.id).order("submitted_at", { ascending: false });
      if (data) setRealLeads(data.map(mapSupabaseLead));
      setLoading(false);
    }
    load();
  }, []);

  const shareableLink = realtorId
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/questionnaire?r=${realtorId}`
    : "";

  function copyLink() {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function filterLead(lead: Lead): boolean {
    if (scoreFilter !== "All" && lead.score !== scoreFilter) return false;
    if (statusFilter !== "All" && lead.status !== statusFilter) return false;
    if (priorityOnly && !lead.isPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${lead.answers.firstName} ${lead.answers.lastName}`.toLowerCase();
      if (!name.includes(q) && !lead.answers.preferredCity.toLowerCase().includes(q) && !lead.answers.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }

  const showingDemos = !loading && realLeads.length === 0;
  const filteredReal = realLeads.filter(filterLead);
  const filteredDemo = showingDemos ? demoLeads.filter(filterLead) : [];
  const filtered = showingDemos ? filteredDemo : filteredReal;

  const hot = allLeads.filter((l) => l.score === "Hot").length;
  const warm = allLeads.filter((l) => l.score === "Warm").length;
  const newLeads = allLeads.filter((l) => l.status === "New Lead").length;
  const actionQueue = buildActionQueue(allLeads);

  const activeItems = actionQueue.filter((item) => !checkedItems.has(item.id));
  const doneItems = actionQueue.filter((item) => checkedItems.has(item.id));

  function toggleCheck(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  void router;

  return (
    <div className="min-h-screen bg-[#f5f3f0]">

      {/* ── Warm ivory header ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#faf7f3] via-[#f5f0e8] to-[#ede8df] px-5 lg:px-8 pt-10 pb-16 border-b border-[#e8e2d8]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[#b8a88a]" />
                <span className="text-[#b8a88a] text-xs font-medium tracking-wide">{formatDate()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1714] mb-1">{getGreeting(realtorName)}</h1>
              <p className="text-[#8c8580] text-sm">
                {activeItems.length > 0
                  ? `You have ${activeItems.length} priority action${activeItems.length !== 1 ? "s" : ""} today`
                  : "You're all caught up. Great work!"}
              </p>
            </div>
            <button
              onClick={() => exportLeads(filtered)}
              className="flex items-center gap-1.5 border border-[#d8d2c8] text-[#8c8580] text-xs px-4 py-2 rounded-full hover:border-[#2c2825] hover:text-[#2c2825] transition-colors bg-white/60"
            >
              <Download size={12} /> Export
            </button>
          </div>

          {/* Stat pills — 2×2 on mobile, row on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mt-8">
            {[
              { label: "Total Leads", value: allLeads.length, bg: "bg-white border border-[#e8e2d8]", text: "text-[#2c2825]", sub: "text-[#8c8580]", icon: <Users size={14} className="text-[#b8a88a]" /> },
              { label: "Hot", value: hot, bg: "bg-white border border-[#e8e2d8]", text: "text-[#2c2825]", sub: "text-[#8c8580]", icon: <Flame size={14} className="text-rose-400" /> },
              { label: "Warm", value: warm, bg: "bg-white border border-[#e8e2d8]", text: "text-[#2c2825]", sub: "text-[#8c8580]", icon: <Zap size={14} className="text-amber-400" /> },
              { label: "New", value: newLeads, bg: "bg-white border border-[#e8e2d8]", text: "text-[#2c2825]", sub: "text-[#8c8580]", icon: <TrendingUp size={14} className="text-[#b8a88a]" /> },
            ].map((stat) => (
              <div key={stat.label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm ${stat.bg}`}>
                {stat.icon}
                <div>
                  <p className={`text-xl font-bold leading-none ${stat.text}`}>{stat.value}</p>
                  <p className={`text-[10px] mt-0.5 ${stat.sub}`}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content (pulled up to overlap header) ───────────────── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 -mt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: Action Queue ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Section header card */}
            <div className="bg-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm border border-[#ece8e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#2c2825] animate-pulse" />
                <h2 className="text-sm font-semibold text-[#2c2825]">Today&apos;s Priority Actions</h2>
                {activeItems.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f3f0] text-[#5c5550] border border-[#e8e4de]">
                    {activeItems.length} remaining
                  </span>
                )}
              </div>
              <Link href="/pipeline" className="text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors flex items-center gap-1">
                Full pipeline <ChevronRight size={11} />
              </Link>
            </div>

            {/* Action items */}
            {actionQueue.length === 0 ? (
              <div className="bg-white rounded-2xl px-5 py-10 text-center shadow-sm border border-[#ece8e2]">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-700 font-semibold text-sm mb-1">You&apos;re all caught up</p>
                <p className="text-[#8c8580] text-xs">Share your buyer link to grow your pipeline.</p>
              </div>
            ) : (
              <>
                {activeItems.length === 0 && doneItems.length > 0 ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-5 py-10 text-center">
                    <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-700 font-semibold text-sm">All done for today ✓</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeItems.map((item) => (
                      <ActionQueueItem
                        key={item.id}
                        item={item}
                        isChecked={checkedItems.has(item.id)}
                        isExpanded={expandedItems.has(item.id)}
                        realtorName={realtorName}
                        onToggleCheck={() => toggleCheck(item.id)}
                        onToggleExpand={() => toggleExpand(item.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Completed items */}
                {doneItems.length > 0 && (
                  <div className="bg-white/60 border border-[#ece8e2] rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#e8e4de]" />
                      <span className="text-[10px] text-[#b8b4b0] font-medium whitespace-nowrap">
                        Completed today ({doneItems.length})
                      </span>
                      <div className="flex-1 h-px bg-[#e8e4de]" />
                    </div>
                    <div className="divide-y divide-[#f5f3f0]">
                      {doneItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 opacity-50">
                          <button
                            onClick={() => toggleCheck(item.id)}
                            className="shrink-0 w-5 h-5 rounded border border-emerald-300 bg-emerald-50 flex items-center justify-center"
                          >
                            <Check size={11} className="text-emerald-600" />
                          </button>
                          <p className="text-xs text-[#8c8580] line-through truncate">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── All Leads ─────────────────────────────────────────────── */}
            <div className="bg-white border border-[#ece8e2] rounded-2xl overflow-hidden shadow-sm mt-2">
              <div className="px-5 py-4 border-b border-[#f0ece6] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#2c2825] flex items-center gap-2">
                  <Users size={14} className="text-[#b8a88a]" /> All Leads
                  <span className="text-[10px] font-normal text-[#8c8580]">({allLeads.length})</span>
                </h2>
              </div>

              <div className="px-5 pt-4">
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email, city…"
                    className="flex-1 border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7]"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {SCORE_FILTERS.map((f) => (
                      <button key={f} onClick={() => setScoreFilter(f)}
                        className={`text-xs px-3 py-2 rounded-xl border transition-all ${scoreFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"}`}>
                        {f}
                      </button>
                    ))}
                    <button onClick={() => setPriorityOnly((v) => !v)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-1 ${priorityOnly ? "bg-[#b8a88a]/20 text-[#8c6a3e] border-[#b8a88a]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825]"}`}>
                      <Star size={10} /> Priority
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                  {STATUS_FILTERS.map((f) => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all shrink-0 ${statusFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:text-[#2c2825]"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-[#b8b4b0] text-xs mb-4">{filtered.length} of {allLeads.length} leads</p>
              </div>

              <div className="px-5 pb-5">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-40 rounded-2xl bg-[#f0ece6] animate-pulse" />
                    ))}
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {showingDemos
                      ? filteredDemo.map((lead) => <LeadCard key={lead.id} lead={lead} isDemo />)
                      : filteredReal.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-[#e8e4de] rounded-2xl">
                    <p className="text-[#2c2825] font-medium mb-1">No leads match</p>
                    <p className="text-[#8c8580] text-sm">Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Buyer link card */}
            <div className="bg-gradient-to-br from-[#f5f0e8] to-[#ede6d8] border border-[#ddd6c8] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={13} className="text-[#b8a88a]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8a88a]">Your Buyer Link</p>
              </div>
              <p className="text-[#6b6560] text-xs mb-4 leading-relaxed">
                Share this link. Buyers fill out the questionnaire and land directly in your dashboard.
              </p>
              {shareableLink ? (
                <>
                  <div className="bg-white/80 border border-[#ddd6c8] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-[10px] text-[#8c8580] truncate">{shareableLink}</p>
                  </div>
                  <button
                    onClick={copyLink}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-all ${
                      copied
                        ? "bg-emerald-500 text-white"
                        : "bg-[#2c2825] text-white hover:bg-[#1a1714]"
                    }`}
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                  </button>
                </>
              ) : (
                <div className="bg-white/60 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-[#8c8580]">Sign in to get your link</p>
                </div>
              )}
            </div>

            {/* Hot leads callout */}
            {hot > 0 && (
              <div className="bg-white border border-[#e8e4de] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-[#f5f3f0] flex items-center justify-center">
                    <Flame size={14} className="text-rose-400" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8580]">Hot Pipeline</p>
                </div>
                <p className="text-4xl font-bold text-[#2c2825]">{hot}</p>
                <p className="text-[#8c8580] text-xs mt-1">
                  {hot === 1 ? "lead" : "leads"} ready to move. Act fast.
                </p>
                {allLeads.length > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2c2825]"
                        style={{ width: `${Math.min(100, (hot / allLeads.length) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#b8b4b0] mt-1">
                      {Math.round((hot / allLeads.length) * 100)}% of your pipeline is hot
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Warm leads card */}
            {warm > 0 && (
              <div className="bg-white border border-[#e8e4de] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-[#f5f3f0] flex items-center justify-center">
                    <Zap size={14} className="text-amber-400" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8580]">Warm Pipeline</p>
                </div>
                <p className="text-4xl font-bold text-[#2c2825]">{warm}</p>
                <p className="text-[#8c8580] text-xs mt-1">nurture before they go cold</p>
              </div>
            )}

            {/* Quick access */}
            <div className="bg-white border border-[#ece8e2] rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8a88a] mb-3">Quick Access</p>
              <div className="space-y-1">
                {[
                  { label: "Pipeline Board", href: "/pipeline", icon: <TrendingUp size={13} />, color: "text-[#b8a88a]" },
                  { label: "Listings", href: "/listings", icon: <Eye size={13} />, color: "text-[#b8a88a]" },
                  { label: "Integrations", href: "/integrations", icon: <AlertCircle size={13} />, color: "text-[#b8a88a]" },
                ].map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f5f3f0] transition-colors group">
                    <div className="flex items-center gap-2.5 text-xs text-[#5c5550]">
                      <span className={item.color}>{item.icon}</span>
                      {item.label}
                    </div>
                    <ChevronRight size={11} className="text-[#c4bfb9] group-hover:text-[#2c2825] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
