import React, { useState } from 'react';
import { InterviewQuestionItem } from '../services/fitEngine';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';

interface InterviewPrepSectionProps {
  questions: InterviewQuestionItem[];
}

export const InterviewPrepSection: React.FC<InterviewPrepSectionProps> = ({ questions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3D6FB4]/40 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#F2A93B]/20 border border-[#F2A93B]/40 text-xs font-mono-data text-[#F2A93B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Code-Backed Technical Screen Prep</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-[#F2F0E6]">
            Target Job Technical Interview Questions
          </h3>
          <p className="font-body text-xs sm:text-sm text-[#7C93AC]">
            5 high-probability technical questions interviewers will ask about your GitHub code, complete with model STAR answers.
          </p>
        </div>
      </div>

      {/* Questions Accordion */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id || `q-${idx}`}
              className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#3D6FB4]/80 rounded-lg p-4 sm:p-5 space-y-4 transition-all"
            >
              {/* Question Header Bar */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded bg-[#F2A93B]/20 border border-[#F2A93B]/40 flex items-center justify-center font-mono-data font-bold text-xs text-[#F2A93B] shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 text-[10px] font-mono-data uppercase font-semibold bg-[#3D6FB4]/30 text-[#7C93AC] rounded border border-[#3D6FB4]/50">
                      {q.targetCategory}
                    </span>
                    <h4 className="font-display font-bold text-base text-[#F2F0E6] leading-snug">
                      {q.question}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-[#7C93AC] hover:text-[#F2F0E6] p-1 rounded-md bg-[#3D6FB4]/20 transition-colors shrink-0 mt-1"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Rationale Blurb */}
              <p className="font-body text-xs text-[#7C93AC] border-l-2 border-[#F2A93B] pl-3 py-0.5 italic">
                Why Recruiters Ask This: {q.recruiterRationale}
              </p>

              {/* Expandable Model STAR Answer */}
              {isExpanded && (
                <div className="pt-2 border-t border-[#3D6FB4]/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center space-x-1.5 text-xs font-mono-data text-[#4FA87B] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#4FA87B]" />
                    <span>Model STAR Answer Structure</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body">
                    <div className="p-3 bg-[#3D6FB4]/10 border border-[#3D6FB4]/30 rounded space-y-1">
                      <span className="font-mono-data font-bold text-[#F2A93B] uppercase text-[10px] block">
                        S — Situation
                      </span>
                      <p className="text-[#F2F0E6]">{q.starAnswer.situation}</p>
                    </div>

                    <div className="p-3 bg-[#3D6FB4]/10 border border-[#3D6FB4]/30 rounded space-y-1">
                      <span className="font-mono-data font-bold text-[#F2A93B] uppercase text-[10px] block">
                        T — Task
                      </span>
                      <p className="text-[#F2F0E6]">{q.starAnswer.task}</p>
                    </div>

                    <div className="p-3 bg-[#3D6FB4]/10 border border-[#3D6FB4]/30 rounded space-y-1">
                      <span className="font-mono-data font-bold text-[#4FA87B] uppercase text-[10px] block">
                        A — Action
                      </span>
                      <p className="text-[#F2F0E6]">{q.starAnswer.action}</p>
                    </div>

                    <div className="p-3 bg-[#3D6FB4]/10 border border-[#3D6FB4]/30 rounded space-y-1">
                      <span className="font-mono-data font-bold text-[#4FA87B] uppercase text-[10px] block">
                        R — Result
                      </span>
                      <p className="text-[#F2F0E6]">{q.starAnswer.result}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
