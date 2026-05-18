import { StepProps, StepHeader, NavButtons, FieldLabel, TextInput } from "./shared";

export default function StepLocation({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Where does your life feel right?"
        subtitle="Tell us which city or neighbourhoods you're drawn to."
      />

      <div className="space-y-5">
        <div>
          <FieldLabel>Preferred city or area</FieldLabel>
          <TextInput
            value={answers.preferredCity}
            onChange={(v) => update("preferredCity", v)}
            placeholder="e.g. St. Catharines, Niagara-on-the-Lake, Grimsby..."
          />
        </div>

        <div>
          <FieldLabel>Preferred neighbourhoods</FieldLabel>
          <TextInput
            value={answers.preferredNeighbourhoods}
            onChange={(v) => update("preferredNeighbourhoods", v)}
            placeholder="e.g. Port Dalhousie, Old Town NOTL, Lakeshore..."
          />
          <p className="text-[#8c8580] text-xs mt-1.5">Separate multiple with a comma.</p>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst={false} isLast={false} />
    </div>
  );
}
