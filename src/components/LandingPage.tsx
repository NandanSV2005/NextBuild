import React from 'react';
import { HeroBlueprintDiagram } from './HeroBlueprintDiagram';
import {
  Github,
  FileText,
  Compass,
  Send,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  Layers,
  Code2,
  Briefcase
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignInClick: () => void;
  onExploreGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignInClick,
  onExploreGuest,
}) => {
  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#3D6FB4]/20 border border-[#3D6FB4]/50 text-xs font-mono-data text-[#F2A93B]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NextBuild v1.0 — AI Portfolio & Career Build Engine</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-[#F2F0E6] tracking-tight leading-[1.1]">
            Turn Your Resume & GitHub into a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2A93B] via-[#f5c378] to-[#F2F0E6]">
              Concrete Build Plan
            </span>
          </h1>
          <p className="font-body text-base sm:text-xl text-[#7C93AC] max-w-2xl mx-auto leading-relaxed">
            Stop guessing what recruiters want. NextBuild analyzes your real code evidence, parses job descriptions, and gives you exact projects to build to land interviews.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold rounded-lg text-base transition-all shadow-[0_0_20px_rgba(242,169,59,0.25)] hover:shadow-[0_0_25px_rgba(242,169,59,0.4)] flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onExploreGuest}
            className="w-full sm:w-auto px-7 py-4 bg-[#10253F] hover:bg-[#10253F]/80 text-[#F2F0E6] font-body font-semibold rounded-lg text-base border border-[#3D6FB4] hover:border-[#F2A93B]/50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#F2A93B]" />
            <span>Try Demo as Guest</span>
          </button>
        </div>

        {/* Micro Guarantee Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-body text-[#7C93AC] pt-2">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#4FA87B]" />
            <span>No Credit Card Required</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#4FA87B]" />
            <span>Free Forever for Students</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#4FA87B]" />
            <span>Real GitHub & PDF Parser</span>
          </span>
        </div>

        {/* Blueprint Visual Diagram */}
        <div className="pt-8 max-w-5xl mx-auto">
          <HeroBlueprintDiagram />
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 STEPS) */}
      <section className="py-12 bg-[#10253F]/60 border-y border-[#3D6FB4]/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono-data text-xs uppercase tracking-widest text-[#F2A93B]">
              Simple 3-Step Process
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#F2F0E6]">
              How NextBuild Gets You Job Ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#10253F] border border-[#3D6FB4] rounded-xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-lg bg-[#3D6FB4]/20 border border-[#3D6FB4] flex items-center justify-center font-mono-data font-bold text-[#F2A93B] text-lg">
                01
              </div>
              <h3 className="font-display font-bold text-lg text-[#F2F0E6]">
                Upload Resume & Connect GitHub
              </h3>
              <p className="font-body text-sm text-[#7C93AC] leading-relaxed">
                Drop your resume PDF and enter your GitHub handle. NextBuild inspects your actual commit patterns, test coverage, and tech stack.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#10253F] border border-[#3D6FB4] rounded-xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-lg bg-[#3D6FB4]/20 border border-[#3D6FB4] flex items-center justify-center font-mono-data font-bold text-[#F2A93B] text-lg">
                02
              </div>
              <h3 className="font-display font-bold text-lg text-[#F2F0E6]">
                Target Any Job Posting
              </h3>
              <p className="font-body text-sm text-[#7C93AC] leading-relaxed">
                Paste the target Job Description URL or text snippet. Our Gemini AI engine extracts required skills, domain demands, and seniority level.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#10253F] border border-[#3D6FB4] rounded-xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-lg bg-[#3D6FB4]/20 border border-[#3D6FB4] flex items-center justify-center font-mono-data font-bold text-[#F2A93B] text-lg">
                03
              </div>
              <h3 className="font-display font-bold text-lg text-[#F2F0E6]">
                Get Your Custom Build Roadmap
              </h3>
              <p className="font-body text-sm text-[#7C93AC] leading-relaxed">
                Receive dual fit scores (GitHub vs ATS), step-by-step skill roadmap with time estimates, and tailored recruiter outreach templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono-data text-xs uppercase tracking-widest text-[#F2A93B]">
            Built for Engineers
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#F2F0E6]">
            Everything You Need to Stand Out
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/60 rounded-xl p-6 space-y-4 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-[#F2A93B]/20 border border-[#F2A93B]/40 flex items-center justify-center text-[#F2A93B]">
              <Github className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-[#F2F0E6]">
              Real Code Evidence
            </h4>
            <p className="font-body text-xs text-[#7C93AC] leading-relaxed">
              Analyzes actual commit recency, unit tests, Docker files, and CI configurations — not just high-level tags.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/60 rounded-xl p-6 space-y-4 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-[#3D6FB4]/30 border border-[#3D6FB4] flex items-center justify-center text-[#F2A93B]">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-[#F2F0E6]">
              Deep Resume ATS Parser
            </h4>
            <p className="font-body text-xs text-[#7C93AC] leading-relaxed">
              Detects missing certifications, vague experience metrics, and keyword gaps before recruiters filter you out.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/60 rounded-xl p-6 space-y-4 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-[#4FA87B]/20 border border-[#4FA87B]/40 flex items-center justify-center text-[#4FA87B]">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-[#F2F0E6]">
              Guided Skill Roadmap
            </h4>
            <p className="font-body text-xs text-[#7C93AC] leading-relaxed">
              Actionable step-by-step roadmap with study durations, learning bullet points, and official documentation links.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/60 rounded-xl p-6 space-y-4 transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-[#F2A93B]/20 border border-[#F2A93B]/40 flex items-center justify-center text-[#F2A93B]">
              <Send className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-[#F2F0E6]">
              Recruiter Outreach Generator
            </h4>
            <p className="font-body text-xs text-[#7C93AC] leading-relaxed">
              Auto-generates tailored LinkedIn & email cold outreach messages highlighting your exact code evidence.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-[#10253F] via-[#1b3b64] to-[#10253F] border border-[#F2A93B]/40 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#F2F0E6]">
              Ready to Build Your Proof-Backed Portfolio?
            </h2>
            <p className="font-body text-sm sm:text-base text-[#7C93AC] max-w-xl mx-auto">
              Join students and junior engineers using NextBuild to bridge the gap between academic projects and industry demands.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              type="button"
              onClick={onGetStarted}
              className="px-8 py-3.5 bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold rounded-lg text-sm transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSignInClick}
              className="px-6 py-3.5 bg-transparent hover:bg-[#3D6FB4]/20 text-[#F2F0E6] font-body font-semibold rounded-lg text-sm border border-[#3D6FB4] transition-colors cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
