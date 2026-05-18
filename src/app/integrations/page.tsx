"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Circle, Mail, Calendar, ChevronDown, ChevronUp, Sparkles, Wifi } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = "connected" | "not_connected" | "coming_soon";

interface Integration {
  id: string;
  name: string;
  logoText: string;
  logoColor: string;
  category: "email" | "calendar" | "ai";
  description: string;
  status: ConnectionStatus;
  connectedEmail?: string;
  features: string[];
  setupSteps?: { label: string; detail: string }[];
  connectHref?: string;
  docsUrl?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  email:    { label: "Email",    icon: <Mail size={13} />,      color: "text-blue-600 bg-blue-50 border-blue-200" },
  calendar: { label: "Calendar", icon: <Calendar size={13} />,  color: "text-violet-600 bg-violet-50 border-violet-200" },
  ai:       { label: "AI",       icon: <Sparkles size={13} />,  color: "text-amber-600 bg-amber-50 border-amber-200" },
};

// ─── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({ integration }: { integration: Integration }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[integration.category];
  const isConnected = integration.status === "connected";
  const isComingSoon = integration.status === "coming_soon";

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${
      isConnected ? "border-emerald-200 shadow-emerald-50" : "border-[#e8e4de]"
    }`}>
      {/* Connected banner */}
      {isConnected && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 flex items-center gap-2">
          <CheckCircle size={14} className="text-white" />
          <span className="text-white text-xs font-semibold">Connected</span>
          {integration.connectedEmail && (
            <span className="text-white/70 text-xs ml-1">· {integration.connectedEmail}</span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo circle */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
              style={{ background: integration.logoColor + "20", color: integration.logoColor }}
            >
              {integration.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-sm font-semibold text-[#2c2825]">{integration.name}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cat.color}`}>
                  {cat.label}
                </span>
                {isComingSoon && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-[#f5f3f0] text-[#8c8580] border-[#e8e4de]">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8c8580] leading-relaxed max-w-sm">{integration.description}</p>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                <Wifi size={11} /> Active
              </span>
            ) : isComingSoon ? (
              <button className="text-xs px-4 py-2 rounded-full border border-[#e8e4de] text-[#8c8580] bg-[#f5f3f0] cursor-not-allowed">
                Notify me
              </button>
            ) : (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-[#2c2825] text-white hover:bg-[#1a1714] transition-colors font-medium"
              >
                Connect {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {integration.features.map((f) => (
            <div key={f} className="flex items-start gap-1.5">
              <Circle size={4} className="text-[#b8a88a] shrink-0 mt-1.5 fill-[#b8a88a]" />
              <p className="text-xs text-[#5c5550]">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Setup panel */}
      {expanded && integration.setupSteps && (
        <div className="border-t border-[#e8e4de] bg-[#faf9f7] p-5">
          <p className="text-xs font-semibold text-[#2c2825] uppercase tracking-wider mb-4">How it works</p>
          <div className="space-y-4 mb-5">
            {integration.setupSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#2c2825] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2c2825] mb-0.5">{step.label}</p>
                  <p className="text-xs text-[#8c8580] leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {integration.connectHref && (
            <a
              href={integration.connectHref}
              className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full bg-[#2c2825] text-white hover:bg-[#1a1714] transition-colors font-semibold"
            >
              Connect {integration.name}
            </a>
          )}
          {integration.docsUrl && (
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
            >
              View docs
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inner page (needs useSearchParams) ──────────────────────────────────────

function IntegrationsInner() {
  const searchParams = useSearchParams();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [toast, setToast] = useState<"connected" | "error" | null>(null);

  useEffect(() => {
    // Load real Gmail connection status from Supabase user metadata
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.gmail_connected) {
        setGmailConnected(true);
        setGmailEmail(user.user_metadata.gmail_email ?? "");
      }
    });

    // Show toast if redirected back from OAuth
    const result = searchParams.get("gmail");
    if (result === "connected") {
      setToast("connected");
      setTimeout(() => setToast(null), 5000);
    } else if (result === "error") {
      setToast("error");
      setTimeout(() => setToast(null), 5000);
    }
  }, [searchParams]);

  const INTEGRATIONS: Integration[] = [
    {
      id: "gmail",
      name: "Gmail",
      logoText: "G",
      logoColor: "#EA4335",
      category: "email",
      description: "Send outreach emails directly from your Gmail account. Templates auto-fill in a pre-addressed draft — one click to send.",
      status: gmailConnected ? "connected" : "not_connected",
      connectedEmail: gmailEmail,
      features: [
        "Open pre-filled drafts in Gmail compose",
        "Your emails come from your own address",
        "Full Gmail threading and history",
        "Works with Google Workspace accounts",
      ],
      setupSteps: [
        { label: "Click Connect Gmail below", detail: "You'll be taken to Google to sign in and grant permission. We only request access to compose and send emails — we never read your inbox." },
        { label: "Choose your Google account", detail: "Use the same email your leads will recognise — typically your brokerage Google Workspace address." },
        { label: "You're done", detail: "Every template in the Outreach Hub will have an 'Open in Gmail' button that opens a pre-filled draft ready to send." },
      ],
      connectHref: "/api/auth/gmail",
      docsUrl: "https://support.google.com/mail",
    },
    {
      id: "outlook",
      name: "Outlook / Microsoft 365",
      logoText: "O",
      logoColor: "#0078D4",
      category: "email",
      description: "Send directly from your Outlook or Microsoft 365 account. Templates open as pre-addressed drafts in Outlook compose.",
      status: "not_connected",
      features: [
        "Open pre-filled drafts in Outlook compose",
        "Works with personal Outlook and Microsoft 365",
        "Full Outlook threading",
        "Compatible with brokerage Exchange accounts",
      ],
      setupSteps: [
        { label: "Coming soon", detail: "Outlook OAuth is in progress. Gmail is available now." },
      ],
    },
    {
      id: "google_calendar",
      name: "Google Calendar",
      logoText: "📅",
      logoColor: "#4285F4",
      category: "calendar",
      description: "Auto-create calendar events for follow-ups, showings, and call reminders directly from the app.",
      status: "coming_soon",
      features: [
        "Create showing appointments with one click",
        "Follow-up reminders sync to your calendar",
        "Invite buyers to events directly",
        "Events include buyer profile link in notes",
      ],
    },
    {
      id: "outlook_calendar",
      name: "Outlook Calendar",
      logoText: "📆",
      logoColor: "#0078D4",
      category: "calendar",
      description: "Sync showings and follow-ups with your Outlook or Microsoft 365 calendar.",
      status: "coming_soon",
      features: [
        "Create events from follow-up reminders",
        "Showing bookings appear in your calendar",
        "Events include buyer name, contact, and notes",
        "Works with Exchange, Outlook.com, and M365",
      ],
    },
    {
      id: "claude",
      name: "Claude AI",
      logoText: "✦",
      logoColor: "#D97706",
      category: "ai",
      description: "Let Claude draft personalized outreach, rewrite emails in your voice, and surface conversation starters from every buyer's profile.",
      status: "coming_soon",
      features: [
        "AI-drafted emails tailored to each buyer's answers",
        "Rewrite any template in your personal tone",
        "One-click conversation starters from profile data",
        "Instant lead summaries before every call",
      ],
    },
  ];

  const connected = INTEGRATIONS.filter((i) => i.status === "connected").length;
  const categories = ["email", "calendar", "ai"] as const;
  const categoryLabels = { email: "Email", calendar: "Calendar", ai: "AI" };

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* Toast notifications */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2.5 transition-all ${
          toast === "connected"
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
        }`}>
          {toast === "connected" ? (
            <><CheckCircle size={16} /> Gmail connected successfully!</>
          ) : (
            <>Something went wrong — please try again.</>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#b8a88a] text-xs font-semibold uppercase tracking-widest mb-1">Settings</p>
          <h1 className="text-2xl font-semibold text-[#2c2825] mb-2">Integrations</h1>
          <p className="text-[#8c8580] text-sm leading-relaxed">
            Connect your email and calendar so you can send outreach and schedule showings without leaving the app.
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-8 flex items-center gap-5 shadow-sm">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#2c2825] mb-1">{connected} of {INTEGRATIONS.length} connected</p>
            <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                style={{ width: `${(connected / INTEGRATIONS.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-[#8c8580]">Fully connected realtors</p>
            <p className="text-xs font-semibold text-[#2c2825]">close 2× more leads</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-br from-[#2c2825] to-[#1a1714] rounded-2xl p-6 mb-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Connect Gmail", detail: "One-click Google sign-in. Takes 30 seconds." },
              { step: "2", title: "Open any lead", detail: "Templates pre-fill with the buyer's exact profile data." },
              { step: "3", title: "Hit send", detail: "One click opens a ready-to-send draft in your Gmail." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{s.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration sections */}
        {categories.map((cat) => {
          const items = INTEGRATIONS.filter((i) => i.category === cat);
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} className="mb-8">
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${meta.color}`}>
                {meta.icon} {categoryLabels[cat]}
              </div>
              <div className="space-y-3">
                {items.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-[#2c2825] mb-1">Need a custom integration?</p>
          <p className="text-xs text-[#8c8580] mb-3">We can connect to Follow Up Boss, LionDesk, BoomTown, and most CRMs.</p>
          <a
            href="mailto:setup@homematch.ca?subject=Custom integration request"
            className="inline-flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-full bg-[#2c2825] text-white hover:bg-[#1a1714] transition-colors font-medium"
          >
            <Mail size={12} /> Contact us
          </a>
        </div>

      </div>
    </div>
  );
}

// ─── Page with Suspense boundary (required for useSearchParams) ───────────────

export default function IntegrationsPage() {
  return (
    <Suspense>
      <IntegrationsInner />
    </Suspense>
  );
}
