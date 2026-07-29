import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FileCode, Briefcase, Target, Map, CheckCircle2 } from 'lucide-react';

export const HeroBlueprintDiagram: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // 5 exact steps required
  const stages = [
    {
      id: 'step-1',
      title: 'Resume + GitHub',
      subtitle: 'Add your resume and GitHub',
      icon: FileCode,
      isActive: false,
    },
    {
      id: 'step-2',
      title: 'Job Description',
      subtitle: 'We read the job posting',
      icon: Briefcase,
      isActive: false,
    },
    {
      id: 'step-3',
      title: 'Fit Analysis',
      subtitle: "See what matches, what's missing",
      icon: Target,
      isActive: true, // "You are here" active step highlighted with Signal Amber
    },
    {
      id: 'step-4',
      title: 'Roadmap',
      subtitle: 'Get a build plan for the gaps',
      icon: Map,
      isActive: false,
    },
    {
      id: 'step-5',
      title: 'Applied',
      subtitle: 'Ready to apply',
      icon: CheckCircle2,
      isActive: false,
    },
  ];

  return (
    <div className="w-full bg-[#10253F] border border-[#3D6FB4] rounded-lg p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-lg blueprint-grid">
      {/* Corner crosshair drafting marks */}
      <div className="absolute top-2 left-2 text-[#3D6FB4]/60 font-mono-data text-xs">+ 01</div>
      <div className="absolute top-2 right-2 text-[#3D6FB4]/60 font-mono-data text-xs">+ 05</div>

      {/* SVG Connector Lines and Nodes Container */}
      <div className="w-full max-w-5xl mx-auto py-2 sm:py-4">
        {/* Desktop / Tablet Horizontal View */}
        <div className="hidden lg:grid grid-cols-5 gap-3 relative">
          {/* Horizontal Connector Dashed Line overlaying behind nodes */}
          <div className="absolute top-10 left-[10%] right-[10%] h-[2px] z-0">
            <svg className="w-full h-full overflow-visible">
              <motion.line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#3D6FB4"
                strokeWidth="2"
                strokeDasharray="6 4"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const delay = shouldReduceMotion ? 0 : 0.2 + index * 0.35;

            return (
              <motion.div
                key={stage.id}
                initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Node Box */}
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 border ${
                    stage.isActive
                      ? 'bg-[#10253F] border-[#F2A93B] text-[#F2A93B] shadow-[0_0_15px_rgba(242,169,59,0.25)] ring-2 ring-[#F2A93B]/30'
                      : 'bg-[#10253F] border-[#3D6FB4] text-[#F2F0E6] group-hover:border-[#F2F0E6]/60'
                  }`}
                >
                  <Icon className="w-7 h-7 stroke-[1.75]" />
                </div>

                {/* Active Indicator Badge if step-3 */}
                {stage.isActive && (
                  <motion.span
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.2 }}
                    className="mt-2 inline-block px-2 py-0.5 text-[10px] font-mono-data uppercase tracking-wider bg-[#F2A93B] text-[#10253F] font-bold rounded"
                  >
                    Active Focus
                  </motion.span>
                )}

                {/* Stage Title */}
                <h4
                  className={`mt-2 font-display font-semibold text-sm sm:text-base ${
                    stage.isActive ? 'text-[#F2A93B]' : 'text-[#F2F0E6]'
                  }`}
                >
                  {stage.title}
                </h4>

                {/* Stage Subtitle */}
                <p className="mt-1 font-body text-xs text-[#7C93AC] leading-snug max-w-[140px]">
                  {stage.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile / Vertical Stacked View */}
        <div className="flex lg:hidden flex-col space-y-6 relative pl-4 border-l-2 border-dashed border-[#3D6FB4]/80 ml-4 py-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const delay = shouldReduceMotion ? 0 : 0.1 * index;

            return (
              <motion.div
                key={stage.id}
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay }}
                className="relative flex items-start space-x-4"
              >
                {/* Node Icon on left border */}
                <div
                  className={`-ml-[33px] w-12 h-12 rounded flex items-center justify-center shrink-0 border ${
                    stage.isActive
                      ? 'bg-[#10253F] border-[#F2A93B] text-[#F2A93B] ring-2 ring-[#F2A93B]/30'
                      : 'bg-[#10253F] border-[#3D6FB4] text-[#F2F0E6]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>

                <div className="pt-0.5">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`font-display font-bold text-base ${
                        stage.isActive ? 'text-[#F2A93B]' : 'text-[#F2F0E6]'
                      }`}
                    >
                      {stage.title}
                    </h4>
                    {stage.isActive && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono-data font-bold bg-[#F2A93B] text-[#10253F] rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-[#7C93AC] mt-0.5">{stage.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
