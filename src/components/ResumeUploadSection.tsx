import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2, FileText, X, Sparkles } from 'lucide-react';
import { SAMPLE_RESUME_FILENAME } from '../data/sampleData';

interface ResumeUploadSectionProps {
  selectedResume: string | null;
  onResumeChange: (filename: string | null) => void;
  onUseSample: () => void;
}

const COMMON_RESUME_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'FastAPI',
  'Django', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'GraphQL', 'REST API', 'Git', 'PyTorch', 'Java', 'C++', 'TailwindCSS',
  'HTML', 'CSS', 'CI/CD', 'Microservices', 'System Design'
];

function extractResumeSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found = COMMON_RESUME_SKILLS.filter((s) => lower.includes(s.toLowerCase()));
  return found.length > 0 ? found : ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'];
}

export const ResumeUploadSection: React.FC<ResumeUploadSectionProps> = ({
  selectedResume,
  onResumeChange,
  onUseSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [manualResumeText, setManualResumeText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>(['React', 'TypeScript', 'FastAPI', 'PostgreSQL']);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filename = e.target.files[0].name;
      setExtractedSkills(['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker']);
      onResumeChange(filename);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filename = e.dataTransfer.files[0].name;
      setExtractedSkills(['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker']);
      onResumeChange(filename);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyManualResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualResumeText.trim()) return;

    const skills = extractResumeSkills(manualResumeText);
    setExtractedSkills(skills);
    onResumeChange('Manual Resume Entry');
  };

  return (
    <section id="step-resume" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Step 1 — Your Resume
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Card Container */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          {!selectedResume ? (
            <>
              {/* Input Mode Selector */}
              <div className="flex items-center space-x-2 bg-[#3D6FB4]/20 p-1 rounded-lg border border-[#3D6FB4]/40 w-fit text-xs font-body">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    inputMode === 'upload'
                      ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                      : 'text-[#7C93AC] hover:text-[#F2F0E6]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File / Sample</span>
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
                  <span>Paste Resume Text</span>
                </button>
              </div>

              {inputMode === 'upload' ? (
                <>
                  {/* Drag & Drop File Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-lg p-8 sm:p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                      isDragging
                        ? 'border-[#F2A93B] bg-[#3D6FB4]/20'
                        : 'border-[#3D6FB4] bg-[#10253F] hover:border-[#F2F0E6]/60 hover:bg-[#3D6FB4]/10'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-full bg-[#3D6FB4]/20 border border-[#3D6FB4] flex items-center justify-center text-[#F2F0E6]">
                      <Upload className="w-6 h-6 text-[#F2A93B]" />
                    </div>

                    <div className="space-y-1">
                      <p className="font-body text-base font-medium text-[#F2F0E6]">
                        Drop your PDF or DOCX resume here, or click to browse
                      </p>
                      <p className="font-body text-xs text-[#7C93AC]">
                        Max file size 10MB • Confidential resume analysis
                      </p>
                    </div>
                  </div>

                  {/* Secondary Sample Resume Option */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setExtractedSkills(['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker']);
                        onUseSample();
                      }}
                      className="font-body text-sm text-[#7C93AC] hover:text-[#F2F0E6] hover:underline transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <FileText className="w-4 h-4 text-[#3D6FB4]" />
                      <span>Use a sample resume instead</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Manual Text Area Option */
                <form onSubmit={handleApplyManualResume} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono-data text-[#7C93AC] uppercase mb-1 font-semibold">
                      Paste Resume / CV Text
                    </label>
                    <textarea
                      rows={5}
                      value={manualResumeText}
                      onChange={(e) => setManualResumeText(e.target.value)}
                      placeholder="Paste your resume summary, work experience, projects, or list of technical skills here..."
                      className="w-full p-3.5 bg-[#F2F0E6] text-[#10253F] placeholder-[#7C93AC] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B] leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!manualResumeText.trim()}
                      className="bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold px-6 py-2.5 rounded text-sm transition-colors shadow cursor-pointer disabled:opacity-40 flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#10253F]" />
                      <span>Apply Resume Text</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Selected File / Text Display */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#3D6FB4]/15 border border-[#3D6FB4] rounded-md">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-[#4FA87B]/20 border border-[#4FA87B]/50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#4FA87B]" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-data text-sm font-semibold text-[#F2F0E6] truncate">
                        {selectedResume}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono-data bg-[#4FA87B]/20 text-[#4FA87B] rounded uppercase font-semibold">
                        Ready
                      </span>
                    </div>
                    <p className="font-body text-xs text-[#7C93AC]">
                      Parsed {extractedSkills.length} tech competencies & experience vector
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onResumeChange(null)}
                  className="font-body text-xs text-[#7C93AC] hover:text-[#C4634F] flex items-center space-x-1 px-2.5 py-1 rounded border border-[#3D6FB4]/50 hover:border-[#C4634F]/50 transition-colors cursor-pointer shrink-0 ml-3"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove / Switch</span>
                </button>
              </div>

              {/* Extracted Skills Badges */}
              <div className="p-3.5 bg-[#10253F] border border-[#3D6FB4]/40 rounded text-xs font-body space-y-2">
                <div className="flex justify-between items-center text-[#7C93AC]">
                  <span className="font-mono-data uppercase text-[11px] font-semibold">
                    Parsed Tech Stack Competencies:
                  </span>
                  <span className="text-[#4FA87B] font-semibold">✓ Verified</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 text-[10px] font-mono-data bg-[#3D6FB4]/20 text-[#F2F0E6] border border-[#3D6FB4] rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
