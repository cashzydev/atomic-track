import React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { PreviewBenefits } from "@/components/landing/PreviewBenefits";
import { FounderStory } from "@/components/landing/FounderStory";
import { FourLawsSection } from "@/components/landing/FourLawsSection";
import { FeaturesCarousel } from "@/components/landing/FeaturesCarousel";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      <LandingHeader />
      
      {/* 1. PROBLEMA + SOLUÇÃO */}
      <HeroSection />
      
      {/* 2. PROVA VISUAL IMEDIATA */}
      <FeaturesCarousel />
      
      {/* 3. CONEXÃO EMOCIONAL */}
      <FounderStory />
      
      {/* 4. POR QUE É DIFERENTE */}
      <PreviewBenefits />
      
      {/* 5. CREDIBILIDADE CIENTÍFICA */}
      <FourLawsSection />
      
      {/* 6. CTA FINAL COM URGÊNCIA */}
      <FinalCTA />
      
      <LandingFooter />
    </div>
  );
};

export default Landing;
