import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import Step1Quick from "@/components/onboarding/Step1Quick";
import Step2Setup from "@/components/onboarding/Step2Setup";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { onboardingData } = useApp();
  const navigate = useNavigate();

  const totalSteps = 2;

  const steps = [
    <Step1Quick key={0} />,
    <Step2Setup key={1} />
  ];

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Step1Quick
        return onboardingData.habitType || onboardingData.habitCustom;
      case 1: // Step2Setup - validation handled in component
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1 && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center p-4 px-2 sm:px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <img
              src="/atom-logo.png"
              alt=""
              className="w-8 h-8 sm:w-12 sm:h-12 animate-float"
            />
            <span className="text-2xl sm:text-3xl font-bold gradient-text">atomicTrack</span>
          </div>
          
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} className="scale-75 sm:scale-100" />
        </div>

        {/* Content Card */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 shadow-2xl shadow-violet-900/20 animate-scale-in">
          <div className="min-h-[400px]">
            {steps[currentStep]}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="group text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="group text-sm sm:text-base"
            >
              {currentStep === totalSteps - 1 ? "Começar Jornada" : "Continuar"}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
