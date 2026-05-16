import { StepProps, StepHeader, NavButtons, FieldLabel } from "./shared";

export default function StepNotes({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Anything else to share?"
        subtitle="This is your space to share what hasn't been captured yet: story, nuance, context."
      />

      <div className="space-y-5">
        <div>
          <FieldLabel>Additional notes for your realtor</FieldLabel>
          <textarea
            value={answers.additionalNotes}
            onChange={(e) => update("additionalNotes", e.target.value)}
            placeholder="e.g. We're relocating from out of province and need to close by September. We love the mid-century modern aesthetic and would prefer not to do a full renovation. Our dog needs a fenced yard..."
            rows={6}
            className="w-full border border-[#e8e4de] rounded-xl px-4 py-3.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] transition-colors bg-white resize-none leading-relaxed"
          />
        </div>

        {/* Review summary card */}
        <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-6 space-y-3">
          <p className="text-[#2c2825] font-medium text-sm mb-4">Your profile at a glance</p>

          {[
            { label: "Name", value: `${answers.firstName} ${answers.lastName}` || "-" },
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

          {answers.mustHaves.length > 0 && (
            <div className="pt-2 border-t border-[#e8e4de]">
              <span className="text-[#8c8580] text-xs">Must-haves: </span>
              <span className="text-[#2c2825] text-xs">{answers.mustHaves.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast />
    </div>
  );
}
