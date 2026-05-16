import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";

export const metadata = {
  title: "Home Match Questionnaire — Home Match",
  description: "Tell us about your dream home in under 8 minutes.",
};

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-12 text-center">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-4">
            Buyer Profile
          </p>
          <h1 className="text-3xl font-semibold text-[#2c2825] mb-3">
            Your Home Match Questionnaire
          </h1>
          <p className="text-[#8c8580] text-base leading-relaxed">
            Takes about 8 minutes. Your answers help your realtor send homes
            that genuinely fit — not just listings that fit the price.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-[#e8e4de] rounded-3xl shadow-sm p-8 md:p-12">
          <QuestionnaireForm />
        </div>

        <p className="text-center text-[#8c8580] text-xs mt-6">
          Your information is private and only shared with your assigned realtor.
        </p>
      </div>
    </div>
  );
}
