import Header from "@/components/header";
import Footer from "@/components/footer";
import AIRecommendationsForm from "@/components/ai-recommendations-form";

export default function AIRecommendations() {
  return (
    <div className="min-h-screen">
      <Header />
      <AIRecommendationsForm />
      <Footer />
    </div>
  );
}