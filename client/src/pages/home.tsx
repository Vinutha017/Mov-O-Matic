import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import HowItWorks from "@/components/how-it-works";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. Navbar */}
      <Header />
      
      {/* 2. Hero Section */}
      <HeroSection />
      
      {/* 3. Features Overview Section */}
      <FeaturesSection />
      
      {/* 4. How It Works Section */}
      <HowItWorks />
      
      {/* 5. Call-to-Action Section */}
      <CTASection />
      
      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
