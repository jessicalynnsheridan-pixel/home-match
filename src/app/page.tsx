import Link from "next/link";
import { ArrowRight, CheckCircle, BookOpen, MapPin, ShieldCheck, Lightbulb, Search, Clock } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Tell us what matters to you",
    description:
      "Answer a few thoughtful questions about your lifestyle, budget, and ideal home, at your own pace, with no pressure and no sales calls.",
  },
  {
    number: "02",
    title: "Get instant insights",
    description:
      "See affordability estimates, neighbourhood matches, and hidden cost breakdowns the moment you complete your profile.",
  },
  {
    number: "03",
    title: "Explore homes that fit",
    description:
      "Browse properties matched to your real priorities, not a generic search. Every home shown aligns with what you actually told us.",
  },
  {
    number: "04",
    title: "Connect when you're ready",
    description:
      "When the time feels right, share your profile with a professional. No obligation, no cold calls. Just a warm, informed introduction.",
  },
];

const buyerBenefits = [
  "Understand your true budget before you fall in love with a home",
  "See hidden costs upfront: closing fees, taxes, and maintenance",
  "Explore neighbourhoods matched to your lifestyle, not just price",
  "Keep your preferences in one place, shareable when you're ready",
  "Get homes that fit your life, not just your square footage",
  "Move at your own pace. No pressure, no scripts, no sales tactics.",
];

const tools = [
  {
    icon: Lightbulb,
    title: "Affordability Insights",
    description:
      "See your estimated monthly payment, what a 20% down payment looks like, and how different price points affect your budget.",
  },
  {
    icon: BookOpen,
    title: "Hidden Cost Calculator",
    description:
      "Land transfer tax, closing costs, inspection fees: we surface the numbers most buyers don't see until it's too late.",
  },
  {
    icon: MapPin,
    title: "Neighbourhood Lifestyle Match",
    description:
      "Based on your vibe preferences, we highlight areas that suit how you actually want to live, not just where homes are listed.",
  },
  {
    icon: ShieldCheck,
    title: "Closing Checklist",
    description:
      "From accepted offer to keys in hand, a step-by-step guide keeps you informed and confident throughout the process.",
  },
  {
    icon: Search,
    title: "First-Time Buyer Guide",
    description:
      "Plain-language explanations of mortgage pre-approval, land transfer tax, freehold vs condo, and everything in between.",
  },
  {
    icon: Clock,
    title: "Connect When You're Ready",
    description:
      "When you want expert guidance, share your completed profile with a professional, on your terms, not theirs.",
  },
];

const stats = [
  { value: "8 min", label: "Average time to build your home profile" },
  { value: "94%", label: "Of buyers say they felt truly understood" },
  { value: "$0", label: "Cost to explore, always free for buyers" },
  { value: "No pressure", label: "Connect with a professional only when you're ready" },
];

export default function HomePage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 lg:px-8 pt-24 pb-32">
        <div aria-hidden className="absolute inset-x-0 -top-10 -z-10 flex justify-center">
          <div className="w-[900px] h-[500px] rounded-full bg-[#e8e4de]/40 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-6">
            Smart Home Search
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-[#2c2825] leading-tight tracking-tight mb-8">
            Find the home that
            <br />
            actually fits your life.
          </h1>
          <p className="text-[#8c8580] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Know your budget, understand the real costs, explore the right neighbourhoods, and connect with a professional only when you feel ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-8 py-4 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Build Your Home Profile
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              See Buyer Tools
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {[
            { label: "Budget", value: "$1.2M – $1.8M", tag: "✓ Saved to profile" },
            { label: "Neighbourhood", value: "Rosedale, Forest Hill", tag: "✓ Lifestyle matched" },
            { label: "Timeline", value: "1–3 Months", tag: "✓ Tools ready" },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-[#e8e4de] rounded-2xl px-6 py-5 shadow-sm">
              <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-2">{item.label}</p>
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
              From first visit to informed decision, at your pace, on your terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white border border-[#e8e4de] rounded-2xl p-8 shadow-sm">
                <p className="text-[#b8a88a] font-semibold text-4xl mb-6 font-mono">{step.number}</p>
                <h3 className="text-[#2c2825] font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-[#8c8580] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Buyer Tools ──────────────────────────────────────────────────── */}
      <section id="why-buyers" className="bg-[#2c2825] px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              Built for buyers
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Everything you need to buy with confidence
            </h2>
            <p className="text-[#e8e4de]/70 text-lg max-w-xl mx-auto">
              Most buyers go in blind. Home Match gives you the tools, insights, and clarity to make one of the biggest decisions of your life, without the pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {tools.map((tool) => (
              <div key={tool.title} className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <tool.icon size={22} className="text-[#b8a88a] mb-5" />
                <h3 className="text-white font-semibold text-base mb-2">{tool.title}</h3>
                <p className="text-[#e8e4de]/60 text-sm leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-white font-semibold text-xl mb-3">Why buyers love it</h3>
                <p className="text-[#e8e4de]/70 text-sm leading-relaxed mb-6">
                  Most buyers spend months repeating themselves and discovering costs they weren't prepared for. Home Match puts you in control from day one.
                </p>
                <Link
                  href="/questionnaire"
                  className="inline-flex items-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#c9b99b] transition-colors"
                >
                  Build Your Profile (Free)
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className="space-y-3">
                {buyerBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                    <CheckCircle size={16} className="text-[#b8a88a] mt-0.5 shrink-0" />
                    <p className="text-[#e8e4de] text-sm leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Smart Matching ───────────────────────────────────────────────── */}
      <section className="bg-[#f5f3f0] border-y border-[#e8e4de] px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            {[
              {
                address: "14 Crescent Road, Rosedale",
                price: "$1,695,000",
                beds: "4 bed · 3 bath · 2,840 sqft",
                tag: "Matches: Chef's kitchen, top schools, private garden",
              },
              {
                address: "88 Forest Hill Road",
                price: "$1,795,000",
                beds: "4 bed · 4 bath · 3,100 sqft",
                tag: "Matches: Home office, walkable village, primary ensuite",
              },
            ].map((card) => (
              <div key={card.address} className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm flex">
                <div className="w-28 shrink-0 bg-[#e8e4de]" />
                <div className="p-5">
                  <p className="text-[#2c2825] font-medium text-sm mb-1">{card.address}</p>
                  <p className="text-[#b8a88a] font-semibold text-base mb-1">{card.price}</p>
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
              Homes that mean something. Not just homes that are available.
            </h2>
            <p className="text-[#8c8580] text-lg leading-relaxed mb-6">
              Every property shown is chosen against your actual profile: your must-haves, your deal breakers, your neighbourhood priorities, your budget. Not a keyword search.
            </p>
            <p className="text-[#8c8580] text-lg leading-relaxed">
              This is what informed searching looks like: grounded in who you are, not just what you can afford.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
            Ready to Begin
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-6">
            Start informed. Search smarter.
            <br />
            Move when you&apos;re ready.
          </h2>
          <p className="text-[#8c8580] text-lg leading-relaxed mb-10">
            Build your home profile in under 8 minutes. Get instant affordability insights, neighbourhood matches, and a personalised home checklist, no sign-up, no obligation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-8 py-4 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Build Your Home Profile
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              Explore Buyer Tools
            </Link>
          </div>
          <p className="text-[#8c8580] text-sm">
            Are you a real estate professional?{" "}
            <Link href="/for-realtors" className="underline underline-offset-2 hover:text-[#2c2825] transition-colors">
              Learn how Home Match works for your practice →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
