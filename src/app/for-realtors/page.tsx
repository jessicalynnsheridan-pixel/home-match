import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Star,
  Users,
  Zap,
  LayoutDashboard,
  Shield,
  CheckCircle,
  TrendingUp,
  Clock,
  MessageSquare,
  Mail,
  Quote,
} from "lucide-react";
import RealtorEmailTemplates from "@/components/RealtorEmailTemplates";

const features = [
  {
    icon: ClipboardList,
    title: "Capture higher-quality leads",
    description:
      "Every buyer who submits a profile has already told you their budget, timeline, pre-approval status, must-haves, and deal breakers. You show up to every conversation prepared.",
  },
  {
    icon: TrendingUp,
    title: "Understand buyer motivation faster",
    description:
      "Is this buyer ready to move in 30 days or just exploring? Are they pre-approved or not yet started? Home Match answers these questions before you make your first call.",
  },
  {
    icon: Star,
    title: "Look more professional",
    description:
      "Replace the generic intake email with a branded, elevated experience. Buyers immediately see you as a serious, organized professional before you've even spoken.",
  },
  {
    icon: MessageSquare,
    title: "Reduce back-and-forth messages",
    description:
      "How many times have you asked a buyer the same question three times? Home Match captures everything once, so your conversations can skip straight to the good part.",
  },
  {
    icon: Zap,
    title: "Create a premium client experience",
    description:
      "The intake experience sets the tone for your entire working relationship. Home Match helps you deliver a boutique-level first impression that luxury buyers expect.",
  },
  {
    icon: LayoutDashboard,
    title: "Organize leads in one place",
    description:
      "Every buyer lead lives in your dashboard with their full profile, score, status, your private notes, and your matched property recommendations, all in one clean view.",
  },
];

const testimonials = [
  {
    quote:
      "Home Match completely changed how I handle new buyer inquiries. I know more about a lead before our first call than I used to know after three meetings.",
    name: "Sarah M.",
    title: "Luxury Realtor, Toronto",
  },
  {
    quote:
      "My buyers actually comment on how professional the intake process feels. It's become a competitive advantage I didn't expect.",
    name: "Daniel R.",
    title: "Top Producer, GTA",
  },
  {
    quote:
      "I closed two deals last quarter from leads that came through Home Match profiles. The quality of information made a huge difference in how quickly I could match them.",
    name: "Priya T.",
    title: "Boutique Realtor, Mississauga",
  },
];

const howItHelps = [
  { icon: Clock, stat: "8 min", label: "Average buyer intake time" },
  { icon: TrendingUp, stat: "3x", label: "Faster lead qualification" },
  { icon: Shield, stat: "60%", label: "Less back-and-forth per buyer" },
  { icon: Users, stat: "94%", label: "Buyer satisfaction with intake" },
];

const comparisonRows = [
  {
    topic: "First impression",
    without: "Generic email or phone call",
    with: "Elevated branded questionnaire",
  },
  {
    topic: "Budget captured",
    without: "Awkward early conversation",
    with: "Slider input, submitted upfront",
  },
  {
    topic: "Timeline known",
    without: "Discovered after 2nd meeting",
    with: "Captured on day one",
  },
  {
    topic: "Pre-approval status",
    without: "Often never directly asked",
    with: "Required field in the profile",
  },
  {
    topic: "Must-haves & deal breakers",
    without: "Discovered after wasted showings",
    with: "Fully listed before any search",
  },
  {
    topic: "Lead organization",
    without: "Spreadsheet, notes app, memory",
    with: "Centralized dashboard with scores",
  },
  {
    topic: "Property recommendations",
    without: "Generic MLS search link",
    with: "Curated cards with match reasons",
  },
];

export default function ForRealtorsPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 pt-24 pb-24 text-center">
        <div className="max-w-3xl mx-auto animate-fade-up">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-5">
            For Realtors
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold text-[#2c2825] tracking-tight leading-tight mb-6">
            A luxury client intake and home-matching tool for modern realtors.
          </h1>
          <p className="text-[#8c8580] text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            Stop collecting buyer information in emails, phone calls, and sticky
            notes. Home Match gives you a premium intake flow and a clean dashboard
            to manage every lead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-8 py-4 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              View Demo Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              Preview Buyer Experience
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#e8e4de] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {howItHelps.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon size={20} className="text-[#b8a88a] mx-auto mb-3" />
                <p className="text-3xl font-semibold text-[#2c2825] mb-2">{s.stat}</p>
                <p className="text-[#8c8580] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              Everything You Need
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight">
              Built around how great realtors work
            </h2>
            <p className="text-[#8c8580] mt-4 text-lg max-w-xl mx-auto">
              Every feature exists to help you capture better leads, close
              faster, and deliver a client experience that earns referrals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[#e8e4de] rounded-2xl p-7 shadow-sm"
              >
                <f.icon size={22} className="text-[#b8a88a] mb-5" />
                <h3 className="text-[#2c2825] font-semibold text-base mb-3">{f.title}</h3>
                <p className="text-[#8c8580] text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison table ─────────────────────────────────────────────── */}
      <section className="bg-[#f5f3f0] border-y border-[#e8e4de] px-6 lg:px-8 py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              The Difference
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight">
              Without Home Match vs. with it
            </h2>
          </div>

          <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-3 border-b border-[#e8e4de]">
              <div className="px-6 py-4">
                <p className="text-[#8c8580] text-xs uppercase tracking-wider">Area</p>
              </div>
              <div className="px-6 py-4 border-l border-[#e8e4de] bg-[#faf9f7]">
                <p className="text-[#8c8580] text-xs uppercase tracking-wider">
                  Without Home Match
                </p>
              </div>
              <div className="px-6 py-4 border-l border-[#e8e4de] bg-[#2c2825]">
                <p className="text-[#b8a88a] text-xs uppercase tracking-wider font-medium">
                  With Home Match
                </p>
              </div>
            </div>

            {comparisonRows.map((row, i) => (
              <div
                key={row.topic}
                className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? "border-b border-[#e8e4de]" : ""}`}
              >
                <div className="px-6 py-4">
                  <p className="text-[#2c2825] text-sm font-medium">{row.topic}</p>
                </div>
                <div className="px-6 py-4 border-l border-[#e8e4de] bg-[#faf9f7]">
                  <p className="text-[#8c8580] text-sm">{row.without}</p>
                </div>
                <div className="px-6 py-4 border-l border-[#e8e4de] bg-[#2c2825]">
                  <p className="text-white text-sm flex items-start gap-2">
                    <CheckCircle size={14} className="text-[#b8a88a] mt-0.5 shrink-0" />
                    {row.with}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              From the Field
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight">
              What realtors are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-[#e8e4de] rounded-2xl p-7 shadow-sm"
              >
                <p className="text-[#2c2825] text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-5 border-t border-[#e8e4de]">
                  <p className="text-[#2c2825] text-sm font-semibold">{t.name}</p>
                  <p className="text-[#8c8580] text-xs mt-0.5">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How to explain it ───────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              The Pitch
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-4">
              How to explain Home Match to a buyer
            </h2>
            <p className="text-[#8c8580] text-lg max-w-xl mx-auto">
              Three ways to frame it, depending on the conversation.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                scenario: "In a first call or intro message",
                prompt: "\"Before we start searching, I use a tool that helps me really understand what you're looking for. Not just bedrooms and budget, but your lifestyle, priorities, and deal breakers. It takes about 8 minutes, and it means every home I send you will actually make sense for your life. I'll send you the link now.\"",
                why: "Sets professional expectations immediately. Frames it as being for their benefit, not yours.",
              },
              {
                scenario: "When a buyer asks what makes you different",
                prompt: "\"Most realtors ask the same questions over and over, on calls, in emails, at every showing. I built a different process. My buyers complete one structured profile upfront, and I use that to curate everything from there. You tell me once, I remember it every time.\"",
                why: "Positions you as organized, premium, and respectful of their time. All things buyers value.",
              },
              {
                scenario: "When explaining it to a skeptical buyer",
                prompt: "\"Think of it like a really well-designed intake form, except the results actually get used. It's not going into a database nobody reads. I review every answer personally before I reach out. It just means our first conversation can skip the basics and get straight to the good stuff.\"",
                why: "Addresses the 'just another form' objection. Reassures them it's personal, not automated.",
              },
            ].map((item) => (
              <div key={item.scenario} className="bg-white border border-[#e8e4de] rounded-2xl p-6">
                <p className="text-xs font-medium text-[#b8a88a] uppercase tracking-wider mb-3">{item.scenario}</p>
                <div className="flex gap-3 mb-4">
                  <Quote size={16} className="text-[#e8e4de] shrink-0 mt-0.5" />
                  <p className="text-[#2c2825] text-sm leading-relaxed italic">{item.prompt}</p>
                </div>
                <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-2.5">
                  <p className="text-[#8c8580] text-xs leading-relaxed"><span className="font-medium text-[#2c2825]">Why it works: </span>{item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Email templates ──────────────────────────────────────────────── */}
      <section className="bg-[#f5f3f0] border-y border-[#e8e4de] px-6 lg:px-8 py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              Email Templates
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail size={22} className="text-[#2c2825]" />
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight">
                Ready-to-send follow-up emails
              </h2>
            </div>
            <p className="text-[#8c8580] text-lg max-w-xl mx-auto">
              Copy, personalise, and send. Every template is written to feel human, not like it came from a CRM.
            </p>
          </div>

          <RealtorEmailTemplates />
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-[#2c2825] px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-5">
            Ready to Elevate Your Practice
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-6">
            Your next great client is
            <br />
            already out there searching.
          </h2>
          <p className="text-[#e8e4de]/70 text-lg leading-relaxed mb-10">
            Give them a first impression worth talking about. Home Match turns your
            intake process into a competitive advantage, without adding complexity
            to your workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:bg-[#c9b99b] transition-colors"
            >
              Explore the Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white text-sm font-medium px-8 py-4 rounded-full hover:border-white/50 transition-colors"
            >
              See the Buyer Experience
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
