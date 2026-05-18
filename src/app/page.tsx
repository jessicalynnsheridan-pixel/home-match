import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

const vibes = [
  { emoji: "🏫", label: "Great schools nearby", sub: "Walk the kids, skip the commute" },
  { emoji: "🌳", label: "Real backyard", sub: "Room to breathe, not just a patio" },
  { emoji: "🤫", label: "Quiet street", sub: "Dead end or low traffic" },
  { emoji: "🚶", label: "Everything walkable", sub: "Coffee, groceries, parks" },
  { emoji: "🏠", label: "No condo fees", sub: "Freehold, yours outright" },
  { emoji: "🏡", label: "Family-friendly block", sub: "Neighbours with kids, safe streets" },
];

const matches = [
  {
    address: "14 Crescent Road, Rosedale",
    price: "$1,695,000",
    beds: "4 bed · 3 bath · 2,840 sqft",
    score: 96,
    tags: ["Private garden", "Chef's kitchen", "Top schools"],
    gradient: "from-[#c8b99a] to-[#9c8b74]",
  },
  {
    address: "88 Forest Hill Road",
    price: "$1,795,000",
    beds: "4 bed · 4 bath · 3,100 sqft",
    score: 91,
    tags: ["Home office", "Walkable village", "Primary ensuite"],
    gradient: "from-[#a8b8c0] to-[#7a9099]",
  },
  {
    address: "22 Douglas Drive, Moore Park",
    price: "$1,549,000",
    beds: "3 bed · 3 bath · 2,200 sqft",
    score: 87,
    tags: ["Quiet street", "Renovated kitchen", "Ravine lot"],
    gradient: "from-[#b8c4a8] to-[#8a9c7a]",
  },
];

const stats = [
  { value: "8 min", label: "to build your profile" },
  { value: "94%", label: "feel truly understood" },
  { value: "$0", label: "always free for buyers" },
  { value: "No pressure", label: "connect only when ready" },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative gradient-animated min-h-[92vh] flex flex-col items-center justify-center px-6 lg:px-8 pt-24 pb-20">

        {/* Ambient floating orbs */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-up relative z-10">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-10 text-xs font-medium text-[#b8956a] tracking-wide uppercase" style={{ background: "rgba(184,149,106,0.10)", border: "1px solid rgba(184,149,106,0.25)" }}>
            <Sparkles size={11} />
            Matched to your lifestyle
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-7">
            <span className="text-[#1a1512]">More than listings.</span>
            <br />
            <span className="text-gradient-gold">A lifestyle match.</span>
          </h1>

          <p className="text-[#6b6560] text-lg sm:text-xl leading-relaxed max-w-md mx-auto mb-10">
            Not a filter, a match. Built around how you actually live.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-8 py-4 rounded-full transition-all hover:opacity-90 hover:-translate-y-0.5 btn-press"
              style={{ background: "#1a1512", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)" }}
            >
              Discover my matches
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center justify-center gap-2 text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:bg-[#f0ece6] transition-all btn-press"
              style={{ background: "white", border: "1.5px solid #d8d4ce" }}
            >
              See buyer tools
            </Link>
          </div>
          <p className="text-[#b8b4b0] text-sm">Takes 8 minutes · No sign-up · No pressure</p>

          <div className="mt-6 pt-6 border-t border-[#e8e4de] flex items-center justify-center gap-4">
            <Link
              href="/realtor-signup"
              className="inline-flex items-center gap-2 text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors group"
            >
              <span className="w-6 h-6 rounded-full bg-[#f0ece6] flex items-center justify-center text-xs font-bold text-[#b8a88a] group-hover:bg-[#2c2825] group-hover:text-white transition-all">R</span>
              Are you a realtor?
              <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
            <span className="text-[#e8e4de]">·</span>
            <Link
              href="/login"
              className="text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Vibe chips */}
        <div className="mt-16 max-w-3xl mx-auto animate-fade-up relative z-10" style={{ animationDelay: "0.12s" }}>
          <p className="text-center text-[#b8b4b0] text-xs font-medium tracking-widest uppercase mb-5">
            We match on things like
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {vibes.map((v, i) => (
              <div
                key={v.label}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 animate-fade-up bg-white"
                style={{ border: "1.5px solid #e8e4de", animationDelay: `${0.18 + i * 0.06}s` }}
              >
                <span className="text-base">{v.emoji}</span>
                <div>
                  <p className="text-[#2c2825] text-xs font-medium leading-none">{v.label}</p>
                  <p className="text-[#8c8580] text-[10px] mt-0.5">{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soft bottom fade into next section */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-[#e8e4de] bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-semibold text-[#2c2825] mb-1">{s.value}</p>
                <p className="text-[#8c8580] text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Match preview, product in action ───────────────────────────── */}
      <section className="px-6 lg:px-8 py-28 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Tilt match cards */}
          <div className="space-y-4">
            {matches.map((m, i) => (
              <TiltCard
                key={m.address}
                className={`rounded-2xl overflow-hidden shadow-warm-md animate-fade-up stagger-${i + 1}`}
              >
                <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden flex">
                  {/* Cinematic colour swatch */}
                  <div className={`w-24 shrink-0 bg-gradient-to-br ${m.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 ken-burns opacity-40 bg-[#2c2825]/10" />
                  </div>

                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-[#2c2825] font-medium text-sm leading-snug">{m.address}</p>
                      {/* Match score badge */}
                      <div className="shrink-0 flex items-center gap-1 bg-[#f5f3f0] border border-[#e8e4de] rounded-full px-2.5 py-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              m.score >= 90 ? "#22c55e" : m.score >= 80 ? "#b8a88a" : "#8c8580",
                          }}
                        />
                        <span className="text-[10px] font-semibold text-[#2c2825]">{m.score}%</span>
                      </div>
                    </div>
                    <p className="text-[#b8a88a] font-semibold text-sm mb-1">{m.price}</p>
                    <p className="text-[#8c8580] text-xs mb-3">{m.beds}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-[#2c2825] bg-[#f5f3f0] border border-[#e8e4de] rounded-full px-2.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}

            <p className="text-center text-[#8c8580] text-xs pt-2">
              Scores update as your profile evolves
            </p>
          </div>

          {/* Copy */}
          <div>
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              Personality-driven matching
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-6 leading-tight">
              Homes that mean something.{" "}
              <span className="text-[#8c8580] font-normal">Not just homes that are available.</span>
            </h2>
            <p className="text-[#8c8580] text-lg leading-relaxed mb-5">
              Every property is scored against your actual profile, your must-haves, your morning routine, your neighbourhood priorities, your budget.
            </p>
            <p className="text-[#8c8580] text-lg leading-relaxed mb-8">
              Not a filter. Not a keyword. A match score built around who you are.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 text-[#1a1512] font-semibold text-sm px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 btn-press"
              style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 28px rgba(201,168,112,0.28), 0 2px 8px rgba(201,168,112,0.16)" }}
            >
              Build my profile
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How it works, dark cinematic section ────────────────────────── */}
      <section className="gradient-dark-animated px-6 lg:px-8 py-28 relative overflow-hidden">
        {/* Ambient orbs on dark bg */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-[15%] w-80 h-80 rounded-full bg-[#b8a88a]/06 blur-3xl" />
          <div className="absolute bottom-1/4 right-[10%] w-96 h-96 rounded-full bg-[#b8a88a]/04 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
              The process
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Three steps to homes you&apos;ll actually love
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                emoji: "✨",
                title: "Tell us who you are",
                description:
                  "Answer questions about your lifestyle, vibe, and priorities, not just price and bedrooms. Takes 8 minutes.",
              },
              {
                number: "02",
                emoji: "🏡",
                title: "See homes that fit",
                description:
                  "Get a curated feed of properties matched to your personality, budget, and non-negotiables.",
              },
              {
                number: "03",
                emoji: "🔒",
                title: "Connect when you're ready",
                description:
                  "When the time feels right, share your profile with a professional. No cold calls. No obligation.",
              },
            ].map((step, i) => (
              <TiltCard
                key={step.number}
                className={`rounded-2xl animate-fade-up stagger-${i + 1}`}
              >
                <div className="glass-dark rounded-2xl p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-gradient-gold font-mono font-semibold text-3xl">{step.number}</span>
                    <span className="text-2xl">{step.emoji}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-[#e8e4de]/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:bg-[#c9b99b] transition-all hover:-translate-y-0.5 shadow-gold-lg btn-press"
            >
              Discover my matches
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why it feels different ───────────────────────────────────────── */}
      <section className="bg-[#f5f3f0] border-y border-[#e8e4de] px-6 lg:px-8 py-28">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
            Built differently
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-6 leading-tight">
            Most searches feel like work.
            <br />
            <span className="text-[#8c8580] font-normal">This one feels like discovery.</span>
          </h2>
          <p className="text-[#8c8580] text-lg leading-relaxed max-w-2xl mx-auto mb-14">
            HomeMatch learns what lights you up, the morning light, the neighbourhood rhythm, the feeling of walking in, and finds homes that deliver it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { before: "Endless scrolling", after: "Curated matches", icon: "🔍" },
              { before: "Repeat yourself every time", after: "One profile, remembered", icon: "💬" },
              { before: "Surprised by hidden costs", after: "Full picture upfront", icon: "💰" },
            ].map((item, i) => (
              <TiltCard
                key={item.before}
                className={`rounded-2xl animate-fade-up stagger-${i + 1}`}
              >
                <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 text-left shadow-warm-sm h-full">
                  <div className="text-2xl mb-4">{item.icon}</div>
                  <p className="text-[#8c8580] text-sm line-through mb-1">{item.before}</p>
                  <p className="text-[#2c2825] font-medium text-sm">{item.after}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-28 bg-[#faf9f7] relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="orb orb-1" style={{ opacity: 0.4 }} />
          <div className="orb orb-3" style={{ opacity: 0.3 }} />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] tracking-tight mb-6 leading-tight">
            Your matches are waiting.
          </h2>
          <p className="text-[#8c8580] text-lg leading-relaxed mb-10">
            Build your profile in 8 minutes. See homes scored to your life. Free, private, and pressure-free, always.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 text-[#1a1512] font-semibold text-sm px-8 py-4 rounded-full transition-all hover:-translate-y-1 btn-press"
              style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 32px rgba(201,168,112,0.32), 0 2px 8px rgba(201,168,112,0.20)" }}
            >
              Discover my matches
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm font-medium px-8 py-4 rounded-full hover:border-[#2c2825] transition-colors bg-white"
            >
              Explore buyer tools
            </Link>
          </div>

          <p className="text-[#8c8580] text-sm">
            Are you a real estate professional?{" "}
            <Link
              href="/for-realtors"
              className="underline underline-offset-2 hover:text-[#2c2825] transition-colors"
            >
              Learn how HomeMatch works for your practice →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
