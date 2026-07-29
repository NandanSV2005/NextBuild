import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2, FileText, X } from 'lucide-react';
import { SAMPLE_RESUME_FILENAME } from '../data/sampleData';

interface ResumeUploadSectionProps {
  selectedResume: string | null;
  onResumeChange: (filename: string | null) => void;
  onUseSample: () => void;
}

export const ResumeUploadSection: React.FC<ResumeUploadSectionProps> = ({
  selectedResume,
  onResumeChange,
  onUseSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onResumeChange(e.target.files[0].name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onResumeChange(e.dataTransfer.files[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
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
                  accept=".pdf,.docx,.doc"
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
                  onClick={onUseSample}
                  className="font-body text-sm text-[#7C93AC] hover:text-[#F2F0E6] hover:underline transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4 text-[#3D6FB4]" />
                  <span>Use a sample resume instead</span>
                </button>
              </div>
            </>
          ) : (
            /* Selected File Display */
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
                        Uploaded
                      </span>
                    </div>
                    <p className="font-body text-xs text-[#7C93AC]">
                      Parsed 12 tech competencies & 3 experience entries
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onResumeChange(null)}
                  className="font-body text-xs text-[#7C93AC] hover:text-[#C4634F] flex items-center space-x-1 px-2.5 py-1 rounded border border-[#3D6FB4]/50 hover:border-[#C4634F]/50 transition-colors cursor-pointer shrink-0 ml-3"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="p-3 bg-[#10253F] border border-[#3D6FB4]/40 rounded text-xs font-body text-[#7C93AC] flex items-center justify-between">
                <span>
                  Resume parsed: {selectedResume === SAMPLE_RESUME_FILENAME
                    ? 'Alex Chen • B.S. Computer Science • Full-Stack Stack'
                    : `${selectedResume} • Parsed Tech Competencies & Experience Entries`}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#F2A93B] hover:underline font-medium text-xs cursor-pointer ml-2 shrink-0"
                >
                  Change file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
