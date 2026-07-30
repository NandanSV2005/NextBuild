import React, { useState } from 'react';
import { JobPosting } from '../types';
import { Link2, Briefcase, Building2, FileText, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { SAMPLE_JOBS } from '../data/sampleData';

interface JobDescriptionSectionProps {
  currentJob: JobPosting | null;
  onSelectJob: (job: JobPosting) => void;
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'FastAPI',
  'Django', 'Flask', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'GCP', 'Azure', 'GraphQL', 'REST API', 'Git',
  'PyTorch', 'TensorFlow', 'Java', 'C++', 'Go', 'Rust', 'TailwindCSS',
  'HTML', 'CSS', 'CI/CD', 'Kafka', 'Microservices', 'System Design'
];

function extractSkillsFromText(text: string): string[] {
  const textLower = text.toLowerCase();
  const found = COMMON_SKILLS.filter((skill) =>
    textLower.includes(skill.toLowerCase())
  );
  return found.length > 0 ? found : ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL'];
}

export const JobDescriptionSection: React.FC<JobDescriptionSectionProps> = ({
  currentJob,
  onSelectJob,
}) => {
  const [inputMode, setInputMode] = useState<'link' | 'manual'>('link');
  const [urlInput, setUrlInput] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualJdText, setManualJdText] = useState('');

  const handleFetchUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      onSelectJob(SAMPLE_JOBS[0]);
      return;
    }
    const domainMatch = urlInput.match(/(linkedin|naukri|indeed|greenhouse|lever)/i);
    const domain = domainMatch ? domainMatch[0] : 'Job Portal';

    const customJob: JobPosting = {
      id: `custom-job-${Date.now()}`,
      title: 'Target Software Engineer Role',
      company: `Featured Organization via ${domain}`,
      location: 'San Francisco, CA / Remote',
      url: urlInput,
      descriptionSnippet: 'Target position requiring full-stack web development, API engineering, async messaging queues, and state management.',
      requiredSkills: ['React', 'TypeScript', 'FastAPI', 'Redis', 'PostgreSQL'],
    };
    onSelectJob(customJob);
  };

  const handleApplyManualJd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJdText.trim()) return;

    const detectedSkills = extractSkillsFromText(manualJdText);
    const title = manualTitle.trim() || 'Software Engineer (Custom Target)';
    const company = manualCompany.trim() || 'Direct Hiring Organization';

    const customJob: JobPosting = {
      id: `manual-jd-${Date.now()}`,
      title,
      company,
      location: 'Direct Application',
      url: '#',
      descriptionSnippet: manualJdText.trim().slice(0, 220) + (manualJdText.length > 220 ? '...' : ''),
      requiredSkills: detectedSkills,
    };

    onSelectJob(customJob);
  };

  return (
    <section id="step-job" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Step 3 — Target Job Position
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Card */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          {/* Mode Switcher Pills */}
          <div className="flex items-center space-x-2 bg-[#3D6FB4]/20 p-1 rounded-lg border border-[#3D6FB4]/40 w-fit text-xs font-body">
            <button
              type="button"
              onClick={() => setInputMode('link')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                inputMode === 'link'
                  ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                  : 'text-[#7C93AC] hover:text-[#F2F0E6]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Paste Job Link / Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                inputMode === 'manual'
                  ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                  : 'text-[#7C93AC] hover:text-[#F2F0E6]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste JD Text Manually</span>
            </button>
          </div>

          {/* Mode A: URL Paste or Sample Presets */}
          {inputMode === 'link' ? (
            <form onSubmit={handleFetchUrl} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C93AC]">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste job posting link (LinkedIn, Naukri, Indeed, Glassdoor...)"
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
                <span className="font-body text-xs text-[#7C93AC]">Or try sample postings:</span>
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
          ) : (
            /* Mode B: Manual Text Paste Box */
            <form onSubmit={handleApplyManualJd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-data text-[#7C93AC] uppercase mb-1 font-semibold">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Backend Engineer / Full Stack Developer"
                    className="w-full px-3.5 py-2.5 bg-[#F2F0E6] text-[#10253F] placeholder-[#7C93AC] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-data text-[#7C93AC] uppercase mb-1 font-semibold">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full px-3.5 py-2.5 bg-[#F2F0E6] text-[#10253F] placeholder-[#7C93AC] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data text-[#7C93AC] uppercase mb-1 font-semibold">
                  Paste Full Job Description / Requirements Text
                </label>
                <textarea
                  rows={4}
                  value={manualJdText}
                  onChange={(e) => setManualJdText(e.target.value)}
                  placeholder="Paste complete Job Description requirements, role responsibilities, or required tech stack here..."
                  className="w-full p-3.5 bg-[#F2F0E6] text-[#10253F] placeholder-[#7C93AC] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B] leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!manualJdText.trim()}
                  className="bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold px-6 py-2.5 rounded text-sm transition-colors shadow cursor-pointer disabled:opacity-40 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-[#10253F]" />
                  <span>Apply Manual Job Description</span>
                </button>
              </div>
            </form>
          )}

          {/* Display Currently Selected / Applied Job */}
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

                {currentJob.url && currentJob.url !== '#' && (
                  <a
                    href={currentJob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 font-mono-data text-xs text-[#F2A93B] hover:underline shrink-0"
                  >
                    <span>Original Link</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <p className="font-body text-xs text-[#7C93AC] uppercase tracking-wider mb-1 font-semibold">
                  Parsed Job Overview
                </p>
                <p className="font-body text-sm text-[#F2F0E6] leading-relaxed">
                  "{currentJob.descriptionSnippet}"
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                <span className="font-body text-xs text-[#7C93AC] mr-1">Extracted Required Stack:</span>
                {currentJob.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 text-[11px] font-mono-data bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30 rounded-full font-medium"
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
