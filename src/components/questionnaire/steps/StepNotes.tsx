import { StepProps, StepHeader, NavButtons, FieldLabel } from "./shared";

export default function StepNotes({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Anything we should know about you?"
        subtitle="The stuff that doesn't fit a checkbox. Your story, your situation, what you really need."
      />

      <div className="space-y-5">
        <div>
          <FieldLabel>Additional notes for your realtor</FieldLabel>
          <textarea
            value={answers.additionalNotes}
            onChange={(e) => update("additionalNotes", e.target.value)}
            placeholder="e.g. We're relocating from out of province and need to close by September. We love the mid-century modern aesthetic and would prefer not to do a full renovation. Our dog needs a fenced yard..."
            rows={6}
            className="w-full bg-white border border-[#e0dbd4] rounded-xl px-4 py-3.5 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a] focus:bg-white transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Review summary card */}
        <div className="rounded-2xl p-6 space-y-3" style={{ background: "#ffffff", border: "1px solid #e0dbd4", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p className="text-[#2c2825] font-medium text-sm mb-4">Your profile at a glance</p>

          {[
            { label: "Name", value: `${answers.firstName} ${answers.lastName}`.trim() || "-" },
            { label: "Timeline", value: answers.timeline || "-" },
            { label: "Location", value: answers.preferredCity || "-" },
            { label: "Property type", value: answers.propertyType || "-" },
            { label: "Bedrooms", value: answers.bedrooms ? `${answers.bedrooms}+` : "-" },
            { label: "Pre-approval", value: answers.preApprovalStatus || "-" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-[#8c8580]">{row.label}</span>
              <span className="text-[#2c2825] font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast />
    </div>
  );
}
