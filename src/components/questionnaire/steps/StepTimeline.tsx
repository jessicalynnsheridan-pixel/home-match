import { BuyingTimeline } from "@/types";
import { StepProps, StepHeader, NavButtons, FieldLabel, ToggleChip } from "./shared";
import { formatCurrency } from "@/lib/utils";

const TIMELINES: BuyingTimeline[] = ["ASAP", "1–3 months", "3–6 months", "6–12 months", "Just exploring"];

export default function StepTimeline({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Timeline & budget."
        subtitle="When are you looking to move, and what is your comfortable price range?"
      />

      {/* Timeline chips */}
      <div className="mb-8">
        <FieldLabel>When are you hoping to buy?</FieldLabel>
        <div className="flex flex-wrap gap-3 mt-1">
          {TIMELINES.map((t) => (
            <ToggleChip
              key={t}
              label={t}
              selected={answers.timeline === t}
              onClick={() => update("timeline", t)}
            />
          ))}
        </div>
      </div>

      {/* Budget slider */}
      <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
        <FieldLabel>Budget range</FieldLabel>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[#2c2825] font-semibold text-lg">
            {formatCurrency(answers.budgetMin)}
          </span>
          <span className="text-[#8c8580] text-sm">to</span>
          <span className="text-[#2c2825] font-semibold text-lg">
            {formatCurrency(answers.budgetMax)}
          </span>
        </div>

        {/* Min slider */}
        <div className="mb-4">
          <p className="text-[#8c8580] text-xs mb-2">Minimum</p>
          <input
            type="range"
            min={200000}
            max={5000000}
            step={25000}
            value={answers.budgetMin}
            onChange={(e) => {
              const val = Number(e.target.value);
              update("budgetMin", Math.min(val, answers.budgetMax - 100000));
            }}
            className="w-full"
          />
        </div>

        {/* Max slider */}
        <div>
          <p className="text-[#8c8580] text-xs mb-2">Maximum</p>
          <input
            type="range"
            min={200000}
            max={5000000}
            step={25000}
            value={answers.budgetMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              update("budgetMax", Math.max(val, answers.budgetMin + 100000));
            }}
            className="w-full"
          />
        </div>

        <div className="flex justify-between mt-3">
          <span className="text-[#8c8580] text-xs">{formatCurrency(200000)}</span>
          <span className="text-[#8c8580] text-xs">{formatCurrency(5000000)}+</span>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
