import React, { useState } from 'react';
import { RecommendedProject } from '../types';
import { ChevronDown, ChevronUp, Clock, Wrench, CheckCircle2 } from 'lucide-react';

interface RoadmapSectionProps {
  recommendedProjects: RecommendedProject[];
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({ recommendedProjects }) => {
  const projectsToDisplay = Array.isArray(recommendedProjects) && recommendedProjects.length > 0
    ? recommendedProjects
    : SAMPLE_RECOMMENDED_PROJECTS;

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(projectsToDisplay[0]?.id || 'rec-1');

  const toggleExpand = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="step-roadmap" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Your Build Plan
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Blueprint Container */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#F2F0E6]">
              Recommended Projects to Close the Gap
            </h3>
            <p className="font-body text-sm text-[#7C93AC]">
              Click any project card to inspect the sequential milestone implementation roadmap.
            </p>
          </div>

          {/* Desktop Drafted Horizontal Path Container */}
          <div className="hidden lg:grid grid-cols-3 gap-6 relative pt-4">
            {/* Dashed connector line across columns */}
            <div className="absolute top-10 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-[#3D6FB4]/80 z-0 pointer-events-none" />

            {projectsToDisplay.map((project, index) => {
              const isExpanded = expandedProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className={`relative z-10 bg-[#10253F] border rounded-lg p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                    isExpanded
                      ? 'border-[#F2A93B] shadow-[0_0_15px_rgba(242,169,59,0.15)] ring-1 ring-[#F2A93B]/40'
                      : 'border-[#3D6FB4] hover:border-[#F2F0E6]/50'
                  }`}
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="space-y-3">
                    {/* Top Step Pill & Time */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[11px] font-mono-data font-bold bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] rounded-full">
                        Project #{index + 1}
                      </span>
                      <span className="font-body text-xs text-[#7C93AC] flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{project.estimatedBuildTime}</span>
                      </span>
                    </div>

                    {/* Title & Problem Statement */}
                    <div>
                      <h4 className="font-display font-medium text-base text-[#F2F0E6] mb-1 leading-snug">
                        {project.title}
                      </h4>
                      <p className="font-body text-xs text-[#7C93AC] line-clamp-3 leading-relaxed">
                        {project.problemStatement}
                      </p>
                    </div>
                  </div>

                  {/* Tech Stack Pills & Expand Indicator */}
                  <div className="pt-4 border-t border-[#3D6FB4]/30 space-y-3 mt-4">
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[10px] font-mono-data bg-[#7C93AC]/20 text-[#F2F0E6] rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-xs font-body font-semibold text-[#F2A93B] pt-1"
                    >
                      <span>{isExpanded ? 'Hide Milestones' : 'Inspect Milestones'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Stacked List */}
          <div className="lg:hidden flex flex-col space-y-4">
            {projectsToDisplay.map((project, index) => {
              const isExpanded = expandedProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className={`bg-[#10253F] border rounded-lg p-5 space-y-4 cursor-pointer transition-all ${
                    isExpanded ? 'border-[#F2A93B]' : 'border-[#3D6FB4]'
                  }`}
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[11px] font-mono-data font-bold bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] rounded-full">
                      Project #{index + 1}
                    </span>
                    <span className="font-body text-xs text-[#7C93AC] flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{project.estimatedBuildTime}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-medium text-lg text-[#F2F0E6] mb-1">
                      {project.title}
                    </h4>
                    <p className="font-body text-sm text-[#7C93AC] leading-relaxed">
                      {project.problemStatement}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-xs font-mono-data bg-[#7C93AC]/20 text-[#F2F0E6] rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-xs font-body font-semibold text-[#F2A93B] pt-2 border-t border-[#3D6FB4]/30"
                  >
                    <span>{isExpanded ? 'Hide Milestones' : 'Inspect Milestones'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Milestone Details Expansion Drawer for Selected Project */}
          {expandedProjectId && (
            <div className="p-6 bg-[#3D6FB4]/10 border border-[#F2A93B]/50 rounded-lg space-y-4 animate-in fade-in duration-200">
              {(() => {
                const project = recommendedProjects.find((p) => p.id === expandedProjectId);
                if (!project) return null;

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-[#3D6FB4]/40 pb-3">
                      <div>
                        <h4 className="font-display font-bold text-lg text-[#F2F0E6]">
                          Milestone Roadmap — {project.title}
                        </h4>
                        <p className="font-body text-xs text-[#7C93AC]">
                          Sequential build guide to prove competencies required for this role
                        </p>
                      </div>
                      <span className="font-mono-data text-xs text-[#F2A93B] font-semibold">
                        Estimated: {project.estimatedBuildTime}
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {project.milestones.map((milestone) => (
                        <div
                          key={milestone.stepNumber}
                          className="flex items-start space-x-3.5 p-3.5 bg-[#10253F] border border-[#3D6FB4]/60 rounded-md"
                        >
                          <div className="w-7 h-7 rounded bg-[#F2A93B] text-[#10253F] font-mono-data font-bold text-xs flex items-center justify-center shrink-0">
                            {milestone.stepNumber}
                          </div>
                          <div>
                            <h5 className="font-display font-semibold text-sm text-[#F2F0E6]">
                              {milestone.title}
                            </h5>
                            <p className="font-body text-xs text-[#7C93AC] mt-0.5 leading-relaxed">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
