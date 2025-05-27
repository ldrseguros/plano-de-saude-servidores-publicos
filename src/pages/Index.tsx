import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PlansSection from "@/components/PlansSection";
import CoverageSection from "@/components/CoverageSection";
import BenefitsSection from "@/components/BenefitsSection";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import FloatingButton from "@/components/FloatingButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="w-full">
        <HeroSection />
        <PlansSection />
        <CoverageSection />
        <BenefitsSection />
        <AboutSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
      <FloatingButton />
    </div>
  );
};

export default Index;
