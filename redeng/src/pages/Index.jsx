import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import SolutionSection from "@/components/landing/SolutionSection";
import KitSection from "@/components/landing/KitSection";
import TrustSection from "@/components/landing/TrustSection";
import CtaSection from "@/components/landing/CtaSection";
import NavBar from "@/components/landing/NavBar";
import { ArrowRight } from "lucide-react";

export default function Index() {
  return (
    <div className="bg-[#111214] min-h-screen font-sans">
      <NavBar />
      <HeroSection />
      <PainSection />
      <SolutionSection />
      <KitSection />
      <TrustSection />
      <CtaSection />

      {/* Floating CTA button */}
      <a
        href="#cta"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-3.5 rounded-full shadow-lg shadow-red-900/40 transition-all duration-200"
      >
        Получить расчёт
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
}