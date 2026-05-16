import { StepProps, StepHeader, NavButtons, FieldLabel, TextInput } from "./shared";

export default function StepContact({ answers, update, onNext, onBack, onSubmit }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Let's start with you."
        subtitle="Your information is private and secure — never sold, never shared without your permission."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>First name</FieldLabel>
          <TextInput
            value={answers.firstName}
            onChange={(v) => update("firstName", v)}
            placeholder="Alexandra"
          />
        </div>
        <div>
          <FieldLabel>Last name</FieldLabel>
          <TextInput
            value={answers.lastName}
            onChange={(v) => update("lastName", v)}
            placeholder="Chen"
          />
        </div>
        <div>
          <FieldLabel>Email address</FieldLabel>
          <TextInput
            value={answers.email}
            onChange={(v) => update("email", v)}
            placeholder="you@email.com"
            type="email"
          />
        </div>
        <div>
          <FieldLabel>Phone number</FieldLabel>
          <TextInput
            value={answers.phone}
            onChange={(v) => update("phone", v)}
            placeholder="(416) 555-0100"
            type="tel"
          />
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} onSubmit={onSubmit} isFirst isLast={false} />
    </div>
  );
}
