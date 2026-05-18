import { StepProps } from "./shared";
import { ArrowRight } from "lucide-react";

function DarkField({
  label, value, onChange, placeholder, type = "text", optional = false,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder: string; type?: string; optional?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-white/80">{label}</label>
        {optional && <span className="text-[10px] text-white/25 uppercase tracking-wider">optional</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#b8a88a] focus:bg-white/12 transition-all"
      />
    </div>
  );
}

export default function StepContact({ answers, update, onNext }: StepProps) {
  const canContinue = !!answers.firstName.trim() && !!answers.email.trim();

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          <span className="text-white">Now let&apos;s put a name</span><br />
          <span className="text-gradient-gold">to that vibe.</span>
        </h2>
        <p className="text-white/45 text-sm leading-relaxed">
          Your realtor shared this link with you. Your profile goes directly to them, no one else.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <DarkField label="First name" value={answers.firstName}
          onChange={(v) => update("firstName", v)} placeholder="Alexandra" />
        <DarkField label="Email address" value={answers.email}
          onChange={(v) => update("email", v)} placeholder="you@email.com" type="email" />
        <div className="grid grid-cols-2 gap-4 pt-1">
          <DarkField label="Last name" value={answers.lastName}
            onChange={(v) => update("lastName", v)} placeholder="Chen" optional />
          <DarkField label="Phone" value={answers.phone}
            onChange={(v) => update("phone", v)} placeholder="(416) 555-0100" type="tel" optional />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-4 rounded-2xl transition-all btn-press ${
          canContinue ? "text-[#1a1512]" : "bg-white/8 text-white/20 cursor-not-allowed border border-white/8"
        }`}
        style={canContinue ? { background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 8px 32px rgba(201,168,112,0.30), 0 2px 8px rgba(201,168,112,0.18)" } : undefined}
      >
        Continue <ArrowRight size={15} />
      </button>

      <p className="text-center text-white/20 text-xs mt-4">No spam. No cold calls. Ever.</p>
    </div>
  );
}
