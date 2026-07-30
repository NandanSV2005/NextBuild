import React, { useState } from 'react';
import { ProjectFit } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, Github, FileText } from 'lucide-react';

interface FitAnalysisSectionProps {
  overallScore: number; // e.g. 74
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  projectFits: ProjectFit[];
  totalReposCount?: number;
}

const SAMPLE_RESUME_FITS: ProjectFit[] = [
  {
    id: 'res-fit-1',
    projectName: 'Resume Competency: Frontend & State Management',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Your resume demonstrates 2+ years of production experience in React, TypeScript, and modern component state architectures.',
  },
  {
    id: 'res-fit-2',
    projectName: 'Resume Competency: Backend Microservices & REST APIs',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Strong evidence of Python/FastAPI async endpoint design, SQL query optimization, and authentication middleware.',
  },
  {
    id: 'res-fit-[#3]',
    projectName: 'Resume Competency: Cloud Infrastructure & Containerization',
    verdict: 'Partial Match',
    verdictColor: 'amber',
    reasoning: 'Demonstrates solid Docker container usage; target role prefers hands-on Kubernetes or Terraform deployment experience.',
  },
  {
    id: 'res-fit-[#4]',
    projectName: 'Resume Competency: Distributed Messaging & Caching',
    verdict: 'Missing Tech',
    verdictColor: 'red',
    reasoning: 'Redis and Kafka queue architectures are highlighted in JD requirements but not yet explicitly documented on resume.',
  },
];

export const FitAnalysisSection: React.FC<FitAnalysisSectionProps> = ({
  overallScore,
  verdict,
  projectFits,
  totalReposCount,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'resume'>('github');

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

  const repoCountToDisplay = totalReposCount && totalReposCount > 0 ? totalReposCount : projectFits.length;
  const matchCount = projectFits.filter((f) => f.verdictColor === 'green').length;
  const gapCount = projectFits.filter((f) => f.verdictColor === 'amber' || f.verdictColor === 'red').length;

  const fitsToDisplay = activeTab === 'github' ? projectFits : SAMPLE_RESUME_FITS;

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
                Overall Portfolio & Resume Fit Rating
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
              Analyzed {repoCountToDisplay} public repositories & resume entries against job requirements. Evaluated {matchCount} direct matches and {gapCount} skill gaps.
            </div>
          </div>

          {/* Tab Switcher: GitHub Repositories vs Resume Competencies */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3D6FB4]/30 pb-3">
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-[#7C93AC]">
              Detailed Evaluation Breakdown
            </h4>

            <div className="flex items-center space-x-2 bg-[#3D6FB4]/20 p-1 rounded-lg border border-[#3D6FB4]/40 text-xs font-body">
              <button
                type="button"
                onClick={() => setActiveTab('github')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'github'
                    ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                    : 'text-[#7C93AC] hover:text-[#F2F0E6]'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repositories ({projectFits.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resume')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'resume'
                    ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                    : 'text-[#7C93AC] hover:text-[#F2F0E6]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume Competencies (4)</span>
              </button>
            </div>
          </div>

          {/* List of Evaluated Items */}
          <div className="space-y-3">
            {fitsToDisplay.map((fit) => {
              let tagStyle = 'bg-[#F2A93B]/20 text-[#F2A93B] border-[#F2A93B]/40';
              if (fit.verdictColor === 'green') {
                tagStyle = 'bg-[#4FA87B]/20 text-[#4FA87B] border-[#4FA87B]/40';
              } else if (fit.verdictColor === 'red') {
                tagStyle = 'bg-[#C4634F]/20 text-[#C4634F] border-[#C4634F]/40';
              }

              return (
                <div
                  key={fit.id}
                  className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#3D6FB4]/80 rounded-md p-4 space-y-3 transition-colors"
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

                  {/* README Claims vs Reality */}
                  {fit.readmeSummary && (
                    <div className="text-xs font-body text-[#7C93AC] italic border-l-2 border-[#3D6FB4] pl-2 py-0.5">
                      README Overview: "{fit.readmeSummary}"
                    </div>
                  )}

                  <p className="font-body text-sm text-[#F2F0E6] leading-relaxed">
                    {fit.reasoning}
                  </p>

                  {/* Engineering Signals Breakdown */}
                  {fit.engineeringSignals && activeTab === 'github' && (
                    <div className="pt-2 border-t border-[#3D6FB4]/30 flex flex-wrap gap-2 text-[11px] font-mono-data text-[#7C93AC]">
                      <span className="px-2 py-0.5 rounded bg-[#3D6FB4]/20 text-[#F2F0E6]">
                        Commit Pattern: {fit.engineeringSignals.commitPattern || 'Incremental development'}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${fit.engineeringSignals.hasTests ? 'bg-[#4FA87B]/20 text-[#4FA87B]' : 'bg-[#3D6FB4]/10 text-[#7C93AC]'}`}>
                        {fit.engineeringSignals.hasTests ? '✓ Tests Included' : 'No Automated Tests'}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${fit.engineeringSignals.hasCI ? 'bg-[#4FA87B]/20 text-[#4FA87B]' : 'bg-[#3D6FB4]/10 text-[#7C93AC]'}`}>
                        {fit.engineeringSignals.hasCI ? '✓ CI Configured' : 'No CI Pipeline'}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${fit.engineeringSignals.appearsOriginal ? 'bg-[#4FA87B]/20 text-[#4FA87B]' : 'bg-[#F2A93B]/20 text-[#F2A93B]'}`}>
                        {fit.engineeringSignals.appearsOriginal ? '✓ Original Work' : 'Fork / Bootcamp Project'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
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
