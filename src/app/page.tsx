import Link from "next/link";
import { ArrowRight, CheckCircle, LayoutDashboard, ClipboardList, Star, Users, Zap, Shield } from "lucide-react";

// ─── How It Works Steps ───────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    title: "Fill Out Your Profile",
    description:
      "Complete our elevated questionnaire — designed to capture your lifestyle, budget, timeline, and dream home preferences in under 8 minutes.",
  },
  {
    number: "02",
    title: "Your Realtor Reviews",
    description:
      "Your dedicated realtor receives your full profile and begins curating properties tailored specifically to your needs and priorities.",
  },
  {
    number: "03",
    title: "Receive Personalized Matches",
    description:
      "Get a hand-selected list of homes chosen for you — not an algorithm. Each recommendation comes with a personal note from your realtor.",
  },
  {
    number: "04",
    title: "Book Showings Instantly",
    description:
      "Request showings directly. No back-and-forth. No repeat explanations. Your realtor already knows exactly what you're looking for.",
  },
];

// ─── Buyer Benefits ───────────────────────────────────────────────────────────
const buyerBenefits = [
  "Say it once — your preferences are captured in full",
  "Skip repetitive calls and emails",
  "Get homes that actually match your lifestyle",
  "Feel heard and respected from day one",
  "Move faster through the process with less friction",
  "Partnered with realtors who take your search seriously",
];

// ─── Realtor Benefits ─────────────────────────────────────────────────────────
const realtorBenefits = [
  {
    icon: ClipboardList,
    title: "Qualify Leads Instantly",
    description:
      "Understand budget, timeline, pre-approval status, and motivation before you pick up the phone.",
  },
  {
    icon: Star,
    title: "Look Premium",
    description:
      "Offer a client intake experience that reflects your brand. Not a generic form — an elevated questionnaire.",
  },
  {
    icon: Users,
    title: "Organized in One Place",
    description:
      "Every buyer lead lives in your dashboard. Notes, status, score, and matched properties all in one view.",
  },
  {
    icon: Zap,
    title: "Reduce Back-and-Forth",
    description:
      "Your buyer tells you everything upfront. No more 'what was your budget again?' on the third call.",
  },
  {
    icon: LayoutDashboard,
    title: "Match Homes Smarter",
    description:
      "Send personalized property recommendations directly to buyer profiles with your own notes attached.",
  },
  {
    icon: Shield,
    title: "Close More Deals",
    description:
      "Better-qualified buyers. Faster decisions. Higher conversion from first contact to offer.",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: "8 min", label: "Average time to complete the questionnaire" },
  { value: "3x", label: "Faster qualification vs. traditional intake" },
  { value: "94%", label: "Of buyers say they felt truly understood" },
  { value: "60%", label: "Reduction in pre-showing back-and-forth" },
];

export default function HomePage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 lg:px-8 pt-24 pb-32">
        {/* Soft background gradient blob */}
        <div
          aria-hidden
          className="absolute inset-x-0 -top-10 -z-10 flex justify-center"
        >
          <div className="w-[900px] h-[500px] rounded-full bg-[#e8e4de]/40 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-6">
            Luxury Home Matching
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-[#2c2825] leading-tight tracking-tight mb-8">
            Find the home that
            <br />
            actually fits your life.
          </h1>
          <p className="text-[#8c8580] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            A smarter way for buyers to share what they want, what they need,
            and where they see themselves living next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-8 py-4 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Start Your Home Match
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/for-realtors"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              For Realtors
            </Link>
          </div>
        </div>

        {/* Hero property preview card */}
        <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 px-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {[
            { label: "Budget", value: "$1.2M – $1.8M", tag: "Qualified" },
            { label: "Preferred Area", value: "Rosedale, Forest Hill", tag: "Captured" },
            { label: "Timeline", value: "1–3 Months", tag: "Motivated" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#e8e4de] rounded-2xl px-6 py-5 shadow-sm"
            >
              <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-2">
                {item.label}
              </p>
              <p className="text-[#2c2825] font-medium text-base">{item.value}</p>
              <span className="inline-block mt-3 text-xs text-[#b8a88a] border border-[#e8e4de] rounded-full px-3 py-1">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#e8e4de] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-semibold text-[#2c2825] mb-2">{s.value}</p>
                <p className="text-[#8c8580] text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              The Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight">
              How it works
            </h2>
            <p className="text-[#8c8580] mt-4 text-lg max-w-xl mx-auto">
              From first visit to personalized home list — in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white border border-[#e8e4de] rounded-2xl p-8 shadow-sm"
              >
                <p className="text-[#b8a88a] font-semibold text-4xl mb-6 font-mono">
                  {step.number}
                </p>
                <h3 className="text-[#2c2825] font-semibold text-lg mb-3">
                  {step.title}
                </h3>
                <p className="text-[#8c8580] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Buyers Love It ───────────────────────────────────────────── */}
      <section id="why-buyers" className="bg-[#2c2825] px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              For Buyers
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-6">
              Why buyers love it
            </h2>
            <p className="text-[#e8e4de]/70 text-lg leading-relaxed mb-10">
              Most buyers spend months repeating themselves. Home Match captures
              your full picture in one place — so every recommendation actually
              makes sense for your life.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#c9b99b] transition-colors"
            >
              Start Your Profile
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="space-y-4">
            {buyerBenefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4"
              >
                <CheckCircle size={18} className="text-[#b8a88a] mt-0.5 shrink-0" />
                <p className="text-[#e8e4de] text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Realtors Use It ──────────────────────────────────────────── */}
      <section id="why-realtors" className="px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              For Realtors
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight">
              Why realtors use it
            </h2>
            <p className="text-[#8c8580] mt-4 text-lg max-w-xl mx-auto">
              Your intake process is your first impression. Make it count.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {realtorBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white border border-[#e8e4de] rounded-2xl p-7 shadow-sm"
              >
                <benefit.icon size={22} className="text-[#b8a88a] mb-5" />
                <h3 className="text-[#2c2825] font-semibold text-base mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[#8c8580] text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/for-realtors"
              className="inline-flex items-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-7 py-3.5 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              See the Full Realtor Overview
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Modern Home Matching ─────────────────────────────────────────── */}
      <section className="bg-[#f5f3f0] border-y border-[#e8e4de] px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Property card mockup */}
          <div className="space-y-4">
            {[
              {
                address: "14 Crescent Road, Rosedale",
                price: "$1,695,000",
                beds: "4 bed · 3 bath · 2,840 sqft",
                tag: "Matched: Chef's kitchen, top schools, private garden",
              },
              {
                address: "88 Forest Hill Road",
                price: "$1,795,000",
                beds: "4 bed · 4 bath · 3,100 sqft",
                tag: "Matched: Home office, walkable village, primary ensuite",
              },
            ].map((card) => (
              <div
                key={card.address}
                className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm flex"
              >
                {/* Image placeholder */}
                <div className="w-28 shrink-0 bg-[#e8e4de]" />
                <div className="p-5">
                  <p className="text-[#2c2825] font-medium text-sm mb-1">
                    {card.address}
                  </p>
                  <p className="text-[#b8a88a] font-semibold text-base mb-1">
                    {card.price}
                  </p>
                  <p className="text-[#8c8580] text-xs mb-3">{card.beds}</p>
                  <span className="inline-block text-xs text-[#2c2825] bg-[#f5f3f0] border border-[#e8e4de] rounded-full px-3 py-1">
                    {card.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              Smart Matching
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-6">
              Home recommendations
              <br />
              that mean something.
            </h2>
            <p className="text-[#8c8580] text-lg leading-relaxed mb-6">
              Every property your realtor sends is chosen with your profile in mind
              — not pulled from a generic search. Your must-haves, your deal breakers,
              your budget, your life.
            </p>
            <p className="text-[#8c8580] text-lg leading-relaxed">
              This is what smart matching looks like: human-curated, profile-driven,
              and genuinely personalized.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Lead Capture CTA ─────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
            Ready to Begin
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-6">
            Your dream home is waiting.
            <br />
            Let&apos;s find it together.
          </h2>
          <p className="text-[#8c8580] text-lg leading-relaxed mb-10">
            Fill out your profile in under 8 minutes. Your realtor will review it
            and send hand-picked recommendations — no guesswork required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-8 py-4 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Start Your Home Match
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/for-realtors"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              I&apos;m a Realtor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
