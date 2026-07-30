import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, Terminal, CheckCircle2, Loader2, Search } from 'lucide-react';

interface BlueprintLoadingAnimationProps {
  statusText?: string;
  companyName?: string;
  githubUser?: string | null;
  reposCount?: number;
}

export const BlueprintLoadingAnimation: React.FC<BlueprintLoadingAnimationProps> = ({
  statusText,
  companyName = 'Target Company',
  githubUser = 'candidate',
  reposCount = 16,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(20);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Starting Gemini AI Fit Engine evaluation...',
    '[RESUME] Extracted competency vector & experience entries.',
  ]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgressPercent(45);
      setActiveStep(2);
      setLogs((prev) => [
        ...prev,
        `[GITHUB] Indexed ${reposCount} public repositories for @${githubUser || 'candidate'}...`,
        `[AST] Analyzing code patterns: TypeScript, Python, React, FastAPI...`,
      ]);
    }, 1200);

    const t2 = setTimeout(() => {
      setProgressPercent(78);
      setActiveStep(3);
      setLogs((prev) => [
        ...prev,
        `[COMPANY] Researching architecture & tech stack signal for ${companyName}...`,
        `[ENGINE] Evaluating project match & calculating skill gap vector...`,
      ]);
    }, 2800);

    const t3 = setTimeout(() => {
      setProgressPercent(96);
      setActiveStep(4);
      setLogs((prev) => [
        ...prev,
        `[ROADMAP] Drafting 3-step project build roadmap to close skill gaps...`,
        `[PACKAGE] Generating resume highlight & "why this role" blurb...`,
      ]);
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [companyName, githubUser, reposCount]);

  const steps = [
    { num: 1, label: 'Resume & Skills Parsing', icon: CheckCircle2 },
    { num: 2, label: 'GitHub Code Indexing', icon: Cpu },
    { num: 3, label: 'Company Signal Research', icon: Search },
    { num: 4, label: 'Synthesizing Roadmap', icon: Sparkles },
  ];

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30 bg-[#10253F]">
      <div className="max-w-3xl mx-auto bg-[#10253F] border-2 border-[#F2A93B] rounded-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden blueprint-grid animate-pulse-glow">
        {/* Animated Laser Scanline */}
        <div className="animate-scanline" />

        {/* Blueprint Top Badge & Status Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F2A93B]/15 border border-[#F2A93B]/40 text-[#F2A93B] text-xs font-mono-data uppercase font-bold tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#F2A93B]" />
            <span>GEMINI AI FIT ENGINE — COMPILING BUILD PLAN</span>
          </div>

          <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#F2F0E6] tracking-tight">
            Analyzing Portfolio & Building Custom Roadmap
          </h3>

          <p className="font-mono-data text-xs sm:text-sm text-[#F2A93B] min-h-[20px] transition-all">
            {statusText || logs[logs.length - 1] || 'Evaluating candidate project repositories...'}
          </p>
        </div>

        {/* Central Radar Circle & Core Scanner */}
        <div className="my-8 flex items-center justify-center relative">
          <div className="relative w-36 h-36 rounded-full border-2 border-[#3D6FB4]/60 flex items-center justify-center bg-[#10253F]/80 shadow-inner">
            {/* Rotating Radar Sweep */}
            <div className="absolute inset-0 rounded-full border border-[#F2A93B]/40 animate-radar overflow-hidden pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#F2A93B]/40 to-transparent origin-bottom-right" />
            </div>

            {/* Concentric rings */}
            <div className="w-24 h-24 rounded-full border border-[#3D6FB4]/40 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#F2A93B]/20 border border-[#F2A93B] flex items-center justify-center animate-pulse">
                <Cpu className="w-7 h-7 text-[#F2A93B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
          {steps.map((step) => {
            const isDone = activeStep > step.num;
            const isCurrent = activeStep === step.num;
            const StepIcon = step.icon;

            let pillStyle = 'bg-[#3D6FB4]/10 border-[#3D6FB4]/30 text-[#7C93AC]';
            if (isDone) {
              pillStyle = 'bg-[#4FA87B]/20 border-[#4FA87B]/40 text-[#4FA87B] font-semibold';
            } else if (isCurrent) {
              pillStyle = 'bg-[#F2A93B]/20 border-[#F2A93B] text-[#F2A93B] font-bold shadow-md';
            }

            return (
              <div
                key={step.num}
                className={`p-3 rounded-md border text-xs font-mono-data flex items-center space-x-2 transition-all ${pillStyle}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4FA87B] shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#F2A93B] shrink-0" />
                ) : (
                  <StepIcon className="w-4 h-4 text-[#7C93AC] shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2 my-6">
          <div className="flex justify-between items-center text-xs font-mono-data text-[#7C93AC]">
            <span>AI SYNTHESIS PROGRESS</span>
            <span className="text-[#F2F0E6] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-[#3D6FB4]/30 rounded-full overflow-hidden border border-[#3D6FB4]/50 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#3D6FB4] via-[#F2A93B] to-[#F2F0E6] rounded-full transition-all duration-500 animate-stripe"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Terminal Log Output Window */}
        <div className="bg-[#0b1728] border border-[#3D6FB4]/60 rounded-md p-4 space-y-2 font-mono-data text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-[#3D6FB4]/30 text-[#7C93AC] text-[11px]">
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#F2A93B]" />
              <span>TERMINAL STREAM LOGS</span>
            </div>
            <span className="text-[#4FA87B] font-bold">STATUS: COMPILING</span>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pt-1 text-left">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-[#3D6FB4] select-none">&gt;</span>
                <span className={idx === logs.length - 1 ? 'text-[#F2A93B] font-semibold' : 'text-[#7C93AC]'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
