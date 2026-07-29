import React from 'react';
import { ProjectFit } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from 'lucide-react';

interface FitAnalysisSectionProps {
  overallScore: number; // e.g. 74
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  projectFits: ProjectFit[];
}

export const FitAnalysisSection: React.FC<FitAnalysisSectionProps> = ({
  overallScore,
  verdict,
  projectFits,
}) => {
  // Determine verdict badge styling
  let badgeBg = 'bg-[#F2A93B] text-[#10253F]';
  let badgeIcon = AlertTriangle;

  if (verdict === 'Strong Match') {
    badgeBg = 'bg-[#4FA87B] text-[#10253F]';
    badgeIcon = CheckCircle2;
  } else if (verdict === 'Needs Work') {
    badgeBg = 'bg-[#C4634F] text-[#F2F0E6]';
    badgeIcon = XCircle;
  }

  const BadgeIcon = badgeIcon;

  const matchCount = projectFits.filter((f) => f.verdictColor === 'green').length;
  const gapCount = projectFits.filter((f) => f.verdictColor === 'amber' || f.verdictColor === 'red').length;

  return (
    <section id="step-fit" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Your Fit Analysis
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Card Container */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          {/* Top Overall Verdict Banner */}
          <div className="p-5 bg-[#3D6FB4]/15 border border-[#3D6FB4] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#7C93AC]">
                Overall Portfolio Fit Rating
              </span>
              <div className="flex items-center space-x-3">
                {/* Large Overall Verdict Badge */}
                <div className={`px-4 py-1.5 rounded-full font-display font-bold text-base sm:text-lg flex items-center space-x-2 ${badgeBg}`}>
                  <BadgeIcon className="w-5 h-5 stroke-[2.2]" />
                  <span>{verdict}</span>
                </div>

                <div className="font-mono-data text-2xl font-bold text-[#F2F0E6]">
                  {overallScore}%
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs font-body text-[#7C93AC] max-w-xs">
              Analyzed {projectFits.length} repositories against job requirements. Evaluated {matchCount} direct matches and {gapCount} skill gaps.
            </div>
          </div>

          {/* List of Existing Projects as Cards */}
          <div className="space-y-4">
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-[#7C93AC]">
              Project-by-Project Evaluation
            </h4>

            <div className="space-y-3">
              {projectFits.map((fit) => {
                let tagStyle = 'bg-[#F2A93B]/20 text-[#F2A93B] border-[#F2A93B]/40';
                if (fit.verdictColor === 'green') {
                  tagStyle = 'bg-[#4FA87B]/20 text-[#4FA87B] border-[#4FA87B]/40';
                } else if (fit.verdictColor === 'red') {
                  tagStyle = 'bg-[#C4634F]/20 text-[#C4634F] border-[#C4634F]/40';
                }

                return (
                  <div
                    key={fit.id}
                    className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#3D6FB4]/80 rounded-md p-4 space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-data font-semibold text-sm text-[#F2F0E6]">
                        {fit.projectName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-mono-data font-bold border rounded-full ${tagStyle}`}
                      >
                        {fit.verdict}
                      </span>
                    </div>

                    <p className="font-body text-sm text-[#F2F0E6] leading-relaxed">
                      {fit.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Required Caption at bottom */}
          <div className="pt-2 border-t border-[#3D6FB4]/30 flex items-start space-x-2 text-xs font-body text-[#7C93AC]">
            <Info className="w-4 h-4 text-[#3D6FB4] shrink-0 mt-0.5" />
            <p className="leading-snug">
              This is AI-generated guidance to help you decide what to build next — not a guarantee of how a recruiter will see your profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
