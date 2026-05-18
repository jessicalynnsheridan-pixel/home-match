import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";

export const metadata = {
  title: "Find Your Match · Home Match",
  description: "Tell us how you want to feel at home. Takes 8 minutes.",
};

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f8f5f0 0%, #faf9f7 60%, #f5f2ec 100%)" }}>
      <div className="max-w-xl mx-auto px-6 lg:px-8 py-14 pb-20">
        <QuestionnaireForm />
      </div>
    </div>
  );
}
