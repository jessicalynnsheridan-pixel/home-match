import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e4de] bg-[#faf9f7] mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-[#2c2825] font-semibold text-lg tracking-tight mb-3">
              Home<span className="text-[#b8a88a]"> Match</span>
            </div>
            <p className="text-[#8c8580] text-sm leading-relaxed max-w-xs">
              A luxury client intake and home-matching tool for modern realtors.
              Built to elevate the buyer experience from day one.
            </p>
          </div>

          {/* Buyers */}
          <div>
            <p className="text-[#2c2825] text-sm font-medium mb-4">Buyers</p>
            <ul className="space-y-2.5">
              {[
                { label: "Start Questionnaire", href: "/questionnaire" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Why Buyers Love It", href: "/#why-buyers" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#8c8580] hover:text-[#2c2825] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Realtors */}
          <div>
            <p className="text-[#2c2825] text-sm font-medium mb-4">Realtors</p>
            <ul className="space-y-2.5">
              {[
                { label: "Realtor Dashboard", href: "/dashboard" },
                { label: "Why Use HomeMatch", href: "/for-realtors" },
                { label: "View Demo Leads", href: "/dashboard" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[#8c8580] hover:text-[#2c2825] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#e8e4de] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#8c8580] text-xs">
            &copy; {new Date().getFullYear()} HomeMatch. All rights reserved.
          </p>
          <p className="text-[#8c8580] text-xs">
            Privacy Policy &middot; Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
