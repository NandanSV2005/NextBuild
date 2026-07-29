import React, { useState } from 'react';
import { JobPosting } from '../types';
import { Link2, Briefcase, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { SAMPLE_JOBS } from '../data/sampleData';

interface JobDescriptionSectionProps {
  currentJob: JobPosting | null;
  onSelectJob: (job: JobPosting) => void;
}

export const JobDescriptionSection: React.FC<JobDescriptionSectionProps> = ({
  currentJob,
  onSelectJob,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      onSelectJob(SAMPLE_JOBS[0]);
      return;
    }
    // Simple custom job builder from typed URL
    const domainMatch = urlInput.match(/(linkedin|naukri|indeed|greenhouse|lever)/i);
    const domain = domainMatch ? domainMatch[0] : 'Job Portal';
    
    const customJob: JobPosting = {
      id: `custom-job-${Date.now()}`,
      title: 'Target Software Engineer Role',
      company: `Featured Organization via ${domain}`,
      location: 'San Francisco, CA / Remote',
      url: urlInput,
      descriptionSnippet: 'Target position requiring full-stack web development, API engineering, async messaging queues, and state management.',
      requiredSkills: ['React', 'TypeScript', 'FastAPI', 'Redis', 'PostgreSQL']
    };
    onSelectJob(customJob);
  };

  return (
    <section id="step-job" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Step 3 — The Job You Want
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Card */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          <form onSubmit={handleFetch} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C93AC]">
                  <Link2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste a job posting link (LinkedIn, Naukri, Indeed)"
                  className="w-full pl-10 pr-4 py-3 bg-[#F2F0E6] text-[#10253F] placeholder-[#7C93AC] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#3D6FB4] hover:bg-[#4b82cb] text-[#F2F0E6] font-body font-semibold px-6 py-3 rounded text-sm transition-colors cursor-pointer shrink-0"
              >
                Fetch Job
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-body text-xs text-[#7C93AC]">Try sample postings:</span>
              {SAMPLE_JOBS.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => onSelectJob(job)}
                  className={`text-xs font-mono-data px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                    currentJob?.id === job.id
                      ? 'bg-[#F2A93B] text-[#10253F] border-[#F2A93B] font-semibold'
                      : 'bg-[#3D6FB4]/20 text-[#F2F0E6] border-[#3D6FB4] hover:border-[#F2F0E6]/50'
                  }`}
                >
                  {job.company} — {job.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </form>

          {/* Display Fetched Job */}
          {currentJob && (
            <div className="p-5 bg-[#3D6FB4]/10 border border-[#3D6FB4] rounded-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3D6FB4]/30 pb-3">
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#F2F0E6]">
                    {currentJob.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-body text-sm text-[#7C93AC] flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 inline text-[#3D6FB4]" />
                      <span>{currentJob.company}</span>
                    </span>
                    <span className="text-[#3D6FB4]">•</span>
                    <span className="font-body text-xs text-[#7C93AC]">{currentJob.location}</span>
                  </div>
                </div>

                <a
                  href={currentJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 font-mono-data text-xs text-[#F2A93B] hover:underline shrink-0"
                >
                  <span>Original Link</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              <div>
                <p className="font-body text-xs text-[#7C93AC] uppercase tracking-wider mb-1 font-semibold">
                  Parsed Requirements Excerpt
                </p>
                <p className="font-body text-sm text-[#F2F0E6] leading-relaxed">
                  "{currentJob.descriptionSnippet}"
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                <span className="font-body text-xs text-[#7C93AC] mr-1">Extracted Stack:</span>
                {currentJob.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-[11px] font-mono-data bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
