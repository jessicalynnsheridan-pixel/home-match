"use client";

import { useState } from "react";
import { CheckCircle, Circle, ExternalLink, Mail, Calendar, MessageSquare, Zap, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = "connected" | "not_connected" | "coming_soon";

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: "email" | "calendar" | "sms" | "automation";
  description: string;
  status: ConnectionStatus;
  features: string[];
  setupSteps?: { label: string; detail: string }[];
  connectUrl?: string;
  docsUrl?: string;
}

// ─── Integration definitions ──────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: "gmail",
    name: "Gmail",
    logo: "G",
    category: "email",
    description: "Send outreach emails directly from your Gmail account. Templates auto-fill in a pre-addressed draft — one click to send.",
    status: "not_connected",
    features: [
      "Open pre-filled drafts in Gmail compose",
      "Your emails come from your own address",
      "Full Gmail threading and history",
      "Works with Google Workspace accounts",
    ],
    setupSteps: [
      { label: "Click Connect Gmail", detail: "You'll be redirected to Google to authorise access. We only request permission to compose emails — we never read your inbox." },
      { label: "Choose your Google account", detail: "Use the same account your leads will recognise. Typically your brokerage Google Workspace email." },
      { label: "Done", detail: "Every template in the Outreach Hub will now have an 'Open in Gmail' button that pre-fills the draft." },
    ],
    connectUrl: "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/gmail.compose&response_type=code&redirect_uri=https://home-match-six.vercel.app/api/auth/gmail/callback",
    docsUrl: "https://support.google.com/mail",
  },
  {
    id: "outlook",
    name: "Outlook / Microsoft 365",
    logo: "O",
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
      { label: "Click Connect Outlook", detail: "You'll be redirected to Microsoft to authorise access. We request compose-only permissions — no inbox access." },
      { label: "Sign in with Microsoft", detail: "Use your brokerage Microsoft 365 account or personal Outlook login." },
      { label: "Done", detail: "Templates will show an 'Open in Outlook' button that opens a pre-filled compose window." },
    ],
    connectUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?scope=Mail.Send&response_type=code&redirect_uri=https://home-match-six.vercel.app/api/auth/outlook/callback",
    docsUrl: "https://support.microsoft.com/en-us/outlook",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    logo: "📅",
    category: "calendar",
    description: "Auto-create calendar events for follow-ups, showings, and call reminders. Set a reminder in the app — it appears in your calendar.",
    status: "not_connected",
    features: [
      "Create showing appointments with one click",
      "Follow-up reminders sync to your calendar",
      "Invite buyers to events directly",
      "Events include buyer profile link in notes",
    ],
    setupSteps: [
      { label: "Click Connect Google Calendar", detail: "Authorise calendar access. We request permission to create events — we never read or delete existing events." },
      { label: "Select your calendar", detail: "Choose which calendar to add events to. Most realtors use a dedicated 'Clients' or 'Work' calendar." },
      { label: "Done", detail: "Every follow-up reminder and 'Schedule Showing' action will offer one-click calendar creation." },
    ],
    connectUrl: "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar.events&response_type=code",
    docsUrl: "https://support.google.com/calendar",
  },
  {
    id: "outlook_calendar",
    name: "Outlook Calendar",
    logo: "📆",
    category: "calendar",
    description: "Sync showings and follow-ups with your Outlook or Microsoft 365 calendar. One click creates the event with all buyer details.",
    status: "not_connected",
    features: [
      "Create events from follow-up reminders",
      "Showing bookings appear in your calendar",
      "Events include buyer name, contact, and notes",
      "Works with Exchange, Outlook.com, and M365",
    ],
    setupSteps: [
      { label: "Click Connect Outlook Calendar", detail: "Authorise via Microsoft. We request Calendars.ReadWrite only." },
      { label: "Done", detail: "Schedule buttons will create events directly in your Outlook calendar." },
    ],
    connectUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?scope=Calendars.ReadWrite&response_type=code",
  },
  {
    id: "sms_twilio",
    name: "SMS via Twilio",
    logo: "💬",
    category: "sms",
    description: "Send text messages to leads directly from the app using a dedicated business number. Templates auto-fill with buyer-specific content.",
    status: "coming_soon",
    features: [
      "Dedicated local area code number for your business",
      "Pre-filled SMS templates from the Outreach Hub",
      "Two-way SMS — see replies in the lead profile",
      "Opt-out handling built in",
    ],
    setupSteps: [
      { label: "Enter your Twilio credentials", detail: "Account SID + Auth Token from your Twilio console. A number is auto-provisioned." },
      { label: "Verify your business number", detail: "Takes about 2 minutes. The number will be local to your area code." },
      { label: "Done", detail: "SMS templates in the Outreach Hub will have a 'Send Text' button that fires instantly." },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    logo: "⚡",
    category: "automation",
    description: "Connect Home Match to 6,000+ apps. Auto-add leads to your CRM, trigger drip campaigns, notify your team in Slack — no code needed.",
    status: "not_connected",
    features: [
      "New lead -> add to Follow Up Boss / HubSpot / Salesforce",
      "New lead -> send Slack notification to your team",
      "Stage change -> trigger email sequence in Mailchimp",
      "Showing booked -> create Zoom meeting link",
    ],
    setupSteps: [
      { label: "Copy your webhook URL below", detail: "This is your unique endpoint. Zapier will send data here when triggered." },
      { label: "Create a new Zap in Zapier", detail: "Choose 'Webhooks by Zapier' as the trigger, paste your URL, and choose your action app." },
      { label: "Test and activate", detail: "Submit a test lead and watch it flow into your connected apps automatically." },
    ],
    docsUrl: "https://zapier.com/apps/webhook/integrations",
  },
];

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  email: { label: "Email", icon: <Mail size={13} />, color: "text-blue-600 bg-blue-50 border-blue-200" },
  calendar: { label: "Calendar", icon: <Calendar size={13} />, color: "text-violet-600 bg-violet-50 border-violet-200" },
  sms: { label: "SMS", icon: <MessageSquare size={13} />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  automation: { label: "Automation", icon: <Zap size={13} />, color: "text-amber-600 bg-amber-50 border-amber-200" },
};

// ─── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({ integration }: { integration: Integration }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[integration.category];
  const isConnected = integration.status === "connected";
  const isComingSoon = integration.status === "coming_soon";

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
      isConnected ? "border-emerald-200" : "border-[#e8e4de]"
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${
              isConnected ? "bg-emerald-50 text-emerald-700" : "bg-[#f5f3f0] text-[#2c2825]"
            }`}>
              {integration.logo}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
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

          {/* Status + action */}
          <div className="flex items-center gap-2 shrink-0">
            {isConnected ? (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle size={14} className="fill-emerald-100" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            ) : isComingSoon ? (
              <button className="text-xs px-4 py-2 rounded-full border border-[#e8e4de] text-[#8c8580] bg-[#f5f3f0] cursor-not-allowed">
                Notify me
              </button>
            ) : (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-[#2c2825] text-white hover:bg-[#1a1714] transition-colors"
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
          <p className="text-xs font-semibold text-[#2c2825] uppercase tracking-wider mb-4">Setup</p>
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

          {/* Special: Zapier webhook URL */}
          {integration.id === "zapier" && (
            <div className="mb-4">
              <p className="text-xs text-[#8c8580] mb-1.5">Your webhook URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-[#f0ece6] border border-[#e8e4de] rounded-lg px-3 py-2 text-[#2c2825] truncate">
                  https://home-match-six.vercel.app/api/webhooks/zapier
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText("https://home-match-six.vercel.app/api/webhooks/zapier")}
                  className="text-xs px-3 py-2 rounded-lg border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {integration.connectUrl && (
              <a
                href={integration.connectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm px-5 py-2.5 rounded-full bg-[#2c2825] text-white hover:bg-[#1a1714] transition-colors font-medium"
              >
                Connect {integration.name} <ExternalLink size={12} />
              </a>
            )}
            {integration.docsUrl && (
              <a
                href={integration.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
              >
                View docs
              </a>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Full in-app OAuth is coming soon. For now, clicking Connect opens the authorisation page — email us at{" "}
              <strong>setup@homematch.ca</strong> and we will complete the connection within 24 hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const connected = INTEGRATIONS.filter((i) => i.status === "connected").length;
  const categories = ["email", "calendar", "sms", "automation"] as const;
  const categoryLabels = { email: "Email", calendar: "Calendar", sms: "SMS", automation: "Automation" };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#b8a88a] text-xs font-semibold uppercase tracking-widest mb-1">Settings</p>
          <h1 className="text-2xl font-semibold text-[#2c2825] mb-2">Integrations</h1>
          <p className="text-[#8c8580] text-sm leading-relaxed">
            Connect your email, calendar, and tools so you can send outreach, schedule showings, and automate follow-ups without leaving the app.
          </p>
        </div>

        {/* Status bar */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-8 flex items-center gap-5">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#2c2825] mb-1">{connected} of {INTEGRATIONS.length} connected</p>
            <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(connected / INTEGRATIONS.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-[#8c8580]">Fully connected realtors</p>
            <p className="text-xs text-[#8c8580]">close 2x more leads</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#2c2825] rounded-2xl p-6 mb-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Connect your tools", detail: "Link Gmail or Outlook, your calendar, and SMS in under 5 minutes." },
              { step: "2", title: "Open any lead", detail: "Click Outreach. Templates are pre-filled with the buyer's profile data." },
              { step: "3", title: "Hit send", detail: "One click opens a ready-to-send draft in your connected email app. No copy-paste." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{s.title}</p>
                  <p className="text-xs text-white/55 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration sections by category */}
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

        {/* Zapier pre-built zaps */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">⚡</span>
            <p className="text-sm font-semibold text-[#2c2825]">Pre-built Zaps</p>
          </div>
          <p className="text-xs text-[#8c8580] mb-4">One-click templates to connect Home Match to your existing tools. Requires a free Zapier account.</p>
          <div className="space-y-2">
            {[
              { label: "New Lead -> Follow Up Boss", detail: "Auto-creates a contact in FUB when a buyer submits their profile" },
              { label: "New Lead -> Slack notification", detail: "Pings your team channel the moment a new lead comes in" },
              { label: "New Lead -> Google Contacts", detail: "Adds the buyer to your Google Contacts automatically" },
              { label: "Stage: Showing Booked -> Zoom meeting", detail: "Creates a Zoom link and emails it to the buyer" },
              { label: "Hot Lead -> SMS via Twilio", detail: "Texts you immediately when a Hot lead submits" },
            ].map((zap) => (
              <div key={zap.label} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[#e8e4de] hover:border-[#2c2825] transition-colors group">
                <div>
                  <p className="text-sm font-medium text-[#2c2825]">{zap.label}</p>
                  <p className="text-xs text-[#8c8580]">{zap.detail}</p>
                </div>
                <ArrowRight size={13} className="text-[#b8b4b0] group-hover:text-[#2c2825] transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Need something custom */}
        <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-[#2c2825] mb-1">Need a custom integration?</p>
          <p className="text-xs text-[#8c8580] mb-3">We can connect to Follow Up Boss, LionDesk, BoomTown, Chime, kvCORE, and most CRMs. Email us and we'll build it.</p>
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
