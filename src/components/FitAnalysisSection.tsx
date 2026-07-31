import React, { useState } from 'react';
import { ProjectFit } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, Github, FileText } from 'lucide-react';

interface FitAnalysisSectionProps {
  overallScore: number; // e.g. 74
  githubScore?: number; // e.g. 78
  resumeAtsScore?: number; // e.g. 70
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  githubVerdict?: 'Strong Match' | 'Partial Match' | 'Needs Work';
  resumeVerdict?: 'Strong Match' | 'Partial Match' | 'Needs Work';
  projectFits: ProjectFit[];
  totalReposCount?: number;
}

const SAMPLE_RESUME_FITS: ProjectFit[] = [
  {
    id: 'res-fit-1',
    projectName: 'Resume Competency 1: Frontend & Component Architecture',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Your resume demonstrates 2+ years of production experience in React, TypeScript, and modern component state architectures matching target job requirements.',
  },
  {
    id: 'res-fit-2',
    projectName: 'Resume Competency 2: Backend Async APIs & REST Microservices',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Strong evidence of Python/FastAPI async endpoint design, SQL query optimization, and authentication middleware.',
  },
  {
    id: 'res-fit-3',
    projectName: 'Resume Competency 3: Relational Database Design & Query Tuning',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Explicitly demonstrates PostgreSQL schema indexing, ACID transactions, and complex SQL joins.',
  },
  {
    id: 'res-fit-4',
    projectName: 'Resume Competency 4: Cloud Infrastructure & Containerization',
    verdict: 'Partial Match',
    verdictColor: 'amber',
    reasoning: 'Demonstrates solid Docker container usage; target role requires hands-on Kubernetes cluster orchestration or Terraform deployment experience which is not yet listed on resume.',
  },
  {
    id: 'res-fit-5',
    projectName: 'Resume Competency 5: Distributed Messaging & Caching',
    verdict: 'Missing Tech',
    verdictColor: 'red',
    reasoning: 'Redis cache and Kafka/RabbitMQ queue architectures are highlighted in JD requirements but not yet explicitly documented on resume.',
  },
  {
    id: 'res-fit-6',
    projectName: 'Resume Competency 6: Automated Testing & CI/CD Pipelines',
    verdict: 'Partial Match',
    verdictColor: 'amber',
    reasoning: 'Mentions unit testing basics; lacks automated GitHub Actions CI/CD pipeline configuration or integration testing suites on candidate resume.',
  },
  {
    id: 'res-fit-7',
    projectName: 'Resume Competency 7: System Design & Microservice Design Patterns',
    verdict: 'Weak Match',
    verdictColor: 'red',
    reasoning: 'Lacks documented experience with distributed system design patterns, token-bucket rate limiters, or load balancers required for mid/senior level roles.',
  },
  {
    id: 'res-fit-8',
    projectName: 'Resume Competency 8: Quantified Business Impact & ATS Keywords',
    verdict: 'Partial Match',
    verdictColor: 'amber',
    reasoning: 'Strong technical skills listed; experience bullet points describe duty listings without quantified performance metrics (e.g., "reduced latency by 35%").',
  },
];

export const FitAnalysisSection: React.FC<FitAnalysisSectionProps> = ({
  overallScore,
  githubScore = 78,
  resumeAtsScore = 70,
  verdict,
  githubVerdict = 'Partial Match',
  resumeVerdict = 'Partial Match',
  projectFits,
  totalReposCount,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'resume'>('github');

  const getVerdictStyle = (v: string) => {
    if (v === 'Strong Match') return 'bg-[#4FA87B] text-[#10253F]';
    if (v === 'Needs Work') return 'bg-[#C4634F] text-[#F2F0E6]';
    return 'bg-[#F2A93B] text-[#10253F]';
  };

  const getProgressColor = (s: number) => {
    if (s >= 80) return 'bg-[#4FA87B]';
    if (s >= 60) return 'bg-[#F2A93B]';
    return 'bg-[#C4634F]';
  };

  // Overall Verdict styling
  let badgeBg = getVerdictStyle(verdict);
  let badgeIcon = AlertTriangle;
  if (verdict === 'Strong Match') badgeIcon = CheckCircle2;
  if (verdict === 'Needs Work') badgeIcon = XCircle;
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
          {/* Composite Overall Verdict Header */}
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

          {/* DUAL SCORE SPLIT BREAKDOWN: GitHub Score vs Resume ATS Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: GitHub Code Score */}
            <div
              className={`p-4 bg-[#10253F] border rounded-lg space-y-3 cursor-pointer transition-all ${
                activeTab === 'github'
                  ? 'border-[#F2A93B] shadow-[0_0_12px_rgba(242,169,59,0.15)] ring-1 ring-[#F2A93B]/40'
                  : 'border-[#3D6FB4] hover:border-[#3D6FB4]/80'
              }`}
              onClick={() => setActiveTab('github')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded bg-[#F2A93B]/20 border border-[#F2A93B]/50 flex items-center justify-center">
                    <Github className="w-4 h-4 text-[#F2A93B]" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-[#F2F0E6]">
                      GitHub Code Score
                    </h5>
                    <span className="font-body text-[11px] text-[#7C93AC]">
                      Repository Code Evidence
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono-data font-bold text-xl text-[#F2F0E6] block">
                    {githubScore}%
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono-data font-semibold rounded-full ${getVerdictStyle(githubVerdict)}`}>
                    {githubVerdict}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#3D6FB4]/20 rounded-full h-2 overflow-hidden border border-[#3D6FB4]/40">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor(githubScore)}`}
                  style={{ width: `${githubScore}%` }}
                />
              </div>

              <p className="font-body text-xs text-[#7C93AC] leading-relaxed">
                Evaluates commit frequency, test coverage, CI configurations, and tech stack alignment in public repos.
              </p>
            </div>

            {/* Card 2: Resume ATS Score */}
            <div
              className={`p-4 bg-[#10253F] border rounded-lg space-y-3 cursor-pointer transition-all ${
                activeTab === 'resume'
                  ? 'border-[#F2A93B] shadow-[0_0_12px_rgba(242,169,59,0.15)] ring-1 ring-[#F2A93B]/40'
                  : 'border-[#3D6FB4] hover:border-[#3D6FB4]/80'
              }`}
              onClick={() => setActiveTab('resume')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded bg-[#3D6FB4]/30 border border-[#3D6FB4] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#F2A93B]" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-[#F2F0E6]">
                      Resume ATS Score
                    </h5>
                    <span className="font-body text-[11px] text-[#7C93AC]">
                      Keyword & Seniority Match
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono-data font-bold text-xl text-[#F2F0E6] block">
                    {resumeAtsScore}%
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono-data font-semibold rounded-full ${getVerdictStyle(resumeVerdict)}`}>
                    {resumeVerdict}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#3D6FB4]/20 rounded-full h-2 overflow-hidden border border-[#3D6FB4]/40">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor(resumeAtsScore)}`}
                  style={{ width: `${resumeAtsScore}%` }}
                />
              </div>

              <p className="font-body text-xs text-[#7C93AC] leading-relaxed">
                Evaluates ATS keyword match, seniority alignment, experience metrics, and certification coverage.
              </p>
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
                <span>Resume Competencies ({SAMPLE_RESUME_FITS.length})</span>
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

                  {/* Explicit "Why" Explanation Callout Box for Partial/Weak/Missing Matches */}
                  {fit.verdictColor === 'amber' && (
                    <div className="p-3 bg-[#F2A93B]/10 border border-[#F2A93B]/40 rounded-md text-xs font-body text-[#F2F0E6] flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-[#F2A93B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#F2A93B] block font-mono-data uppercase text-[11px]">
                          Why Partial Match:
                        </span>
                        <span>{fit.reasoning}</span>
                      </div>
                    </div>
                  )}

                  {fit.verdictColor === 'red' && (
                    <div className="p-3 bg-[#C4634F]/10 border border-[#C4634F]/40 rounded-md text-xs font-body text-[#F2F0E6] flex items-start space-x-2">
                      <XCircle className="w-4 h-4 text-[#C4634F] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#C4634F] block font-mono-data uppercase text-[11px]">
                          Why {fit.verdict}:
                        </span>
                        <span>{fit.reasoning}</span>
                      </div>
                    </div>
                  )}

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
