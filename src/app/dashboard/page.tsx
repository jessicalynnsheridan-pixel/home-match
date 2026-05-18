"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockLeads } from "@/data/mockLeads";
import LeadCard from "@/components/dashboard/LeadCard";
import { Lead, LeadScore, LeadStatus } from "@/types";
import { Download, Flame, Zap, Eye, AlertCircle, Copy, Check, Link2, Phone, Mail, ChevronRight, Star, Users, TrendingUp, Bell, ChevronDown, CheckCircle2, ExternalLink } from "lucide-react";
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
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

function generateQuickMessage(item: ActionItem, lead: Lead): string {
  const name = lead.answers.firstName;
  const city = lead.answers.preferredCity || "your area";
  const timeline = lead.answers.timeline || "";
  const propType = lead.answers.propertyType || "property";

  if (item.icon === "call" || item.icon === "email") {
    const hook = lead.answers.sundayMorning
      ? `You mentioned ${lead.answers.sundayMorning.toLowerCase()} as your ideal Sunday`
      : lead.answers.homeFeeling?.[0]
      ? `You're looking for something ${lead.answers.homeFeeling[0].toLowerCase()}`
      : `You have a clear sense of what you want`;
    return `Hi ${name}, it's [Your Name] from Home Match. ${hook} — I have a couple of properties in ${city} that I think could be a real fit. Worth a quick 5-minute call this week?`;
  }
  if (item.icon === "new") {
    return `New profile submitted: ${name} is looking for a ${propType} in ${city}. Budget and timeline look ${timeline === "ASAP" || timeline === "1–3 months" ? "urgent" : "solid"}. Open their profile to review and reach out.`;
  }
  return `Hi ${name}, just following up — still keeping an eye out for ${city} properties that match what you described. Anything new on your end?`;
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
      items.push({ id: `call-${lead.id}`, priority: "urgent", icon: "call", label: `Call ${name} now`, sub: "Hot · Pre-approved · ASAP — don't wait", leadId: lead.id, phone: lead.answers.phone, emailAddr: lead.answers.email, lead });
    } else if (isHot && isNew) {
      items.push({ id: `email-${lead.id}`, priority: "high", icon: "email", label: `Send first email to ${name}`, sub: "Hot lead · New — reach out within the hour", leadId: lead.id, emailAddr: lead.answers.email, lead });
    } else if (isNew) {
      items.push({ id: `new-${lead.id}`, priority: isWarm ? "high" : "medium", icon: "new", label: `New lead: ${name}`, sub: `${lead.score} · ${lead.answers.propertyType || "Buyer"} in ${lead.answers.preferredCity || "—"}`, leadId: lead.id, lead });
    } else if (isWarm) {
      items.push({ id: `followup-${lead.id}`, priority: "medium", icon: "followup", label: `Follow up with ${name}`, sub: `Warm · ${lead.status} — keep the momentum`, leadId: lead.id, emailAddr: lead.answers.email, lead });
    }
  }
  const order = { urgent: 0, high: 1, medium: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 5);
}

const PRIORITY_STYLES = {
  urgent: { dot: "bg-rose-500", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", label: "Urgent", border: "border-l-4 border-rose-400" },
  high:   { dot: "bg-amber-500", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Today", border: "border-l-4 border-amber-400" },
  medium: { dot: "bg-blue-400", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "This week", border: "border-l-4 border-blue-300" },
};

function ActionQueueItem({
  item,
  isChecked,
  isExpanded,
  onToggleCheck,
  onToggleExpand,
}: {
  item: ActionItem;
  isChecked: boolean;
  isExpanded: boolean;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
}) {
  const s = PRIORITY_STYLES[item.priority];
  const message = generateQuickMessage(item, item.lead);
  const isEmailType = item.icon === "email" || (item.icon === "followup" && item.emailAddr);
  const gmailUrl = item.emailAddr
    ? quickGmailUrl(
        item.emailAddr,
        `Homes in ${item.lead.answers.preferredCity || "your area"} — Home Match`,
        message
      )
    : "";
  const smsUrl = item.phone ? quickSmsUrl(item.phone, message) : "";

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(message);
  }

  return (
    <div className={`${s.border} ${isChecked ? "opacity-50" : ""} transition-opacity`}>
      <div
        className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#faf9f7] transition-colors cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
          className="shrink-0 w-5 h-5 rounded border border-[#d4cfc9] flex items-center justify-center hover:border-[#2c2825] transition-colors bg-white"
          aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
        >
          {isChecked && <Check size={11} className="text-emerald-600" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-[#2c2825] truncate ${isChecked ? "line-through text-[#b8b4b0]" : ""}`}>
            {item.label}
          </p>
          <p className="text-xs text-[#8c8580] mt-0.5">{item.sub}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text}`}>{s.label}</span>
          {item.icon === "call" && item.phone && (
            <a
              href={`tel:${item.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-[#2c2825] text-white hover:bg-[#1a1714] transition-colors font-medium"
            >
              <Phone size={11} /> Call
            </a>
          )}
          {item.emailAddr && item.icon !== "call" && (
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors font-medium"
            >
              <Mail size={11} /> Email
            </a>
          )}
          <ChevronDown
            size={14}
            className={`text-[#b8b4b0] transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded message panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-[#faf9f7] border-t border-[#f0ece6]">
          <p className="text-xs text-[#5c5550] leading-relaxed bg-white border border-[#e8e4de] rounded-xl px-3 py-2.5 mb-3">
            {message}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#e8e4de] bg-white text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium"
            >
              <Copy size={11} /> Copy
            </button>

            {isEmailType && gmailUrl ? (
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#e8e4de] bg-white text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium"
              >
                <ExternalLink size={11} /> Open in Gmail
              </a>
            ) : smsUrl ? (
              <a
                href={smsUrl}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#e8e4de] bg-white text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium"
              >
                <ExternalLink size={11} /> Open in Messages
              </a>
            ) : null}

            <Link
              href={`/dashboard/${item.leadId}`}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-[#b8a88a] hover:text-[#8c6a3e] transition-colors font-medium ml-auto"
            >
              View Full Profile <ChevronRight size={11} />
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

  const demoLeads = mockLeads;
  const allLeads = [...realLeads, ...demoLeads];

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setRealtorId(user.id);
      setRealtorName((user.user_metadata?.first_name as string) ?? "");
      const { data } = await supabase.from("leads").select("*").eq("realtor_id", user.id).order("submitted_at", { ascending: false });
      if (data) setRealLeads(data.map(mapSupabaseLead));
    }
    load();
  }, []);

  const shareableLink = realtorId
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/?r=${realtorId}`
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

  const filteredReal = realLeads.filter(filterLead);
  const filteredDemo = demoLeads.filter(filterLead);
  const filtered = [...filteredReal, ...filteredDemo];

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
    // collapse when checking off
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

  // suppress unused router warning — kept for potential future use
  void router;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">

        {/* ── Morning briefing header ──────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#2c2825]">{getGreeting(realtorName)}</h1>
            <p className="text-[#8c8580] text-sm mt-0.5">{formatDate()} · Here&apos;s what needs your attention today</p>
          </div>
          <button
            onClick={() => exportLeads(filtered)}
            className="flex items-center gap-1.5 border border-[#e8e4de] text-[#8c8580] text-xs px-4 py-2 rounded-full hover:border-[#2c2825] hover:text-[#2c2825] transition-colors bg-white"
          >
            <Download size={12} /> Export
          </button>
        </div>

        {/* ── Top grid: action queue + sidebar ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

          {/* TODAY'S PRIORITY QUEUE */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden h-full">
              {/* Header with gold left accent */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ece6] border-l-4 border-l-[#b8a88a]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-[#b8a88a]" />
                  <h2 className="text-sm font-semibold text-[#2c2825]">Today&apos;s Priorities</h2>
                  {activeItems.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">{activeItems.length}</span>
                  )}
                </div>
                <Link href="/pipeline" className="text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors flex items-center gap-1">
                  Full pipeline <ChevronRight size={11} />
                </Link>
              </div>

              {actionQueue.length === 0 ? (
                <div className="px-5 py-12 text-center bg-emerald-50/40">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium text-sm mb-1">You&apos;re all caught up ✓</p>
                  <p className="text-emerald-600/70 text-xs">No urgent actions right now. Share your buyer link to grow your pipeline.</p>
                </div>
              ) : (
                <>
                  {/* Active items */}
                  {activeItems.length === 0 && doneItems.length > 0 ? (
                    <div className="px-5 py-8 text-center bg-emerald-50/40">
                      <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-700 font-medium text-sm">You&apos;re all caught up ✓</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f5f3f0]">
                      {activeItems.map((item) => (
                        <ActionQueueItem
                          key={item.id}
                          item={item}
                          isChecked={checkedItems.has(item.id)}
                          isExpanded={expandedItems.has(item.id)}
                          onToggleCheck={() => toggleCheck(item.id)}
                          onToggleExpand={() => toggleExpand(item.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Done for today section */}
                  {doneItems.length > 0 && (
                    <div className="border-t border-[#f0ece6]">
                      <div className="px-5 py-2.5 flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#f0ece6]" />
                        <span className="text-[10px] text-[#b8b4b0] font-medium whitespace-nowrap">
                          Completed today ({doneItems.length})
                        </span>
                        <div className="flex-1 h-px bg-[#f0ece6]" />
                      </div>
                      <div className="divide-y divide-[#f5f3f0]">
                        {doneItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 opacity-40">
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
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-4">

            {/* Pipeline stats */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b8a88a] mb-3">Pipeline</p>
              <div className="space-y-3">
                {[
                  { label: "Total leads", value: allLeads.length, icon: <Users size={13} />, dot: "bg-[#c4bfb9]", rowBg: "" },
                  { label: "Hot", value: hot, icon: <Flame size={13} />, dot: "bg-rose-500", rowBg: hot > 0 ? "bg-rose-50/50 -mx-2 px-2 rounded-lg" : "" },
                  { label: "Warm", value: warm, icon: <Zap size={13} />, dot: "bg-amber-400", rowBg: "" },
                  { label: "New", value: newLeads, icon: <TrendingUp size={13} />, dot: "bg-blue-400", rowBg: "" },
                ].map((s) => (
                  <div key={s.label} className={`flex items-center justify-between py-0.5 transition-colors ${s.rowBg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                      <span className="text-xs text-[#5c5550]">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[#2c2825]">{s.value}</span>
                  </div>
                ))}
              </div>
              {allLeads.length > 0 && hot > 0 && (
                <div className="mt-3 pt-3 border-t border-[#f0ece6]">
                  <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400" style={{ width: `${Math.min(100, (hot / allLeads.length) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-[#8c8580] mt-1">{Math.round((hot / allLeads.length) * 100)}% of leads are hot</p>
                </div>
              )}
            </div>

            {/* Buyer link — warm gradient */}
            <div className="border border-[#e8e4de] rounded-2xl p-4 bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8]">
              <div className="flex items-center gap-2 mb-2">
                <Link2 size={13} className="text-[#b8a88a]" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b8a88a]">Your Buyer Link</p>
              </div>
              <p className="text-xs text-[#8c8580] mb-3 leading-relaxed">Share with buyers — their responses come straight to your dashboard.</p>
              {shareableLink ? (
                <>
                  <div className="bg-white/70 border border-[#e8e4de] rounded-xl px-3 py-2 mb-2">
                    <p className="text-[10px] text-[#8c8580] truncate">{shareableLink}</p>
                  </div>
                  <button
                    onClick={copyLink}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl transition-all ${copied ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[#2c2825] text-white hover:bg-[#1a1714]"}`}
                  >
                    {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
                  </button>
                </>
              ) : (
                <div className="bg-white/70 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-[#8c8580]">Sign in to get your link</p>
                </div>
              )}
            </div>

            {/* Quick nav */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b8a88a] mb-3">Quick Access</p>
              <div className="space-y-1">
                {[
                  { label: "Pipeline Board", href: "/pipeline", icon: <TrendingUp size={13} /> },
                  { label: "Listings", href: "/listings", icon: <Eye size={13} /> },
                  { label: "Integrations", href: "/integrations", icon: <AlertCircle size={13} /> },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f5f3f0] transition-colors group">
                    <div className="flex items-center gap-2 text-xs text-[#5c5550]">
                      <span className="text-[#8c8580]">{item.icon}</span>
                      {item.label}
                    </div>
                    <ChevronRight size={11} className="text-[#c4bfb9] group-hover:text-[#2c2825] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── All leads ────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0ece6]">
            <h2 className="text-sm font-semibold text-[#2c2825] flex items-center gap-2">
              <Users size={14} className="text-[#b8a88a]" /> All Leads
              <span className="text-[10px] font-normal text-[#8c8580]">({allLeads.length})</span>
            </h2>
          </div>

          <div className="px-5 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, city…" className="flex-1 border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7]" />
              <div className="flex gap-1.5 flex-wrap">
                {SCORE_FILTERS.map((f) => (
                  <button key={f} onClick={() => setScoreFilter(f)} className={`text-xs px-3 py-2 rounded-xl border transition-all ${scoreFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"}`}>{f}</button>
                ))}
                <button onClick={() => setPriorityOnly((v) => !v)} className={`text-xs px-3 py-2 rounded-xl border transition-all ${priorityOnly ? "bg-[#b8a88a]/20 text-[#8c6a3e] border-[#b8a88a]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825]"}`}>★ Priority</button>
              </div>
            </div>
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {STATUS_FILTERS.map((f) => (
                <button key={f} onClick={() => setStatusFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all shrink-0 ${statusFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:text-[#2c2825]"}`}>{f}</button>
              ))}
            </div>
            <p className="text-[#b8b4b0] text-xs mb-4">{filtered.length} of {allLeads.length} leads</p>
          </div>

          <div className="px-5 pb-5">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredReal.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
                {filteredDemo.map((lead) => <LeadCard key={lead.id} lead={lead} isDemo />)}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#e8e4de] rounded-2xl">
                <p className="text-[#2c2825] font-medium mb-1">No leads match</p>
                <p className="text-[#8c8580] text-sm">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
