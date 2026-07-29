import React from 'react';
import { HeroBlueprintDiagram } from './HeroBlueprintDiagram';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onGetStartedClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStartedClick }) => {
  return (
    <section className="w-full pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Main Headline & Lead Text */}
        <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#F2F0E6] tracking-tight leading-[1.15]">
            See exactly what to build next to land your target job
          </h1>
          <p className="font-body text-base sm:text-lg text-[#7C93AC] leading-relaxed max-w-2xl mx-auto">
            Connect your resume and GitHub. We'll show you how your projects stack up against the job you want, and exactly what to build to close the gap.
          </p>
          
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onGetStartedClick}
              className="inline-flex items-center space-x-2 bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold text-base px-6 py-3 rounded-md transition-all duration-200 shadow-md cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Signature Blueprint Diagram */}
        <div className="pt-4">
          <HeroBlueprintDiagram />
        </div>
      </div>
    </section>
  );
};
