import React, { useState } from 'react';
import { ApplicationPackage, ApplicationStatus } from '../types';
import { Copy, Check, Send, CheckCircle2, Bookmark, Briefcase } from 'lucide-react';

interface ApplicationPackageSectionProps {
  appPackage: ApplicationPackage;
  currentStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
}

export const ApplicationPackageSection: React.FC<ApplicationPackageSectionProps> = ({
  appPackage,
  currentStatus,
  onStatusChange,
}) => {
  const [copiedField, setCopiedField] = useState<'summary' | 'blurb' | null>(null);

  const handleCopy = (text: string, field: 'summary' | 'blurb') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interviewing'];

  return (
    <section id="step-[#F2A93B]" className="w-full py-10 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Ready to Apply
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Blueprint Card Container */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#F2F0E6]">
              Your Application Package
            </h3>
            <p className="font-body text-sm text-[#7C93AC]">
              Tailored blurbs ready to drop into your cover letter, job application portal, or email to recruiters.
            </p>
          </div>

          {/* Resume Highlight Summary Card */}
          <div className="p-5 bg-[#3D6FB4]/10 border border-[#3D6FB4] rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-sm text-[#F2A93B]">
                Tailored Resume Summary
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(appPackage.resumeHighlightSummary, 'summary')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-body font-semibold rounded bg-[#3D6FB4]/30 text-[#F2F0E6] border border-[#3D6FB4] hover:border-[#F2A93B] hover:text-[#F2A93B] transition-colors cursor-pointer"
              >
                {copiedField === 'summary' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4FA87B]" />
                    <span className="text-[#4FA87B]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-body text-sm text-[#F2F0E6] leading-relaxed select-all">
              {appPackage.resumeHighlightSummary}
            </p>
          </div>

          {/* "Why This Role" Blurb Card */}
          <div className="p-5 bg-[#3D6FB4]/10 border border-[#3D6FB4] rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-sm text-[#F2A93B]">
                "Why This Role" Blurb
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(appPackage.whyThisRoleBlurb, 'blurb')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-body font-semibold rounded bg-[#3D6FB4]/30 text-[#F2F0E6] border border-[#3D6FB4] hover:border-[#F2A93B] hover:text-[#F2A93B] transition-colors cursor-pointer"
              >
                {copiedField === 'blurb' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4FA87B]" />
                    <span className="text-[#4FA87B]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-body text-sm text-[#F2F0E6] leading-relaxed select-all">
              {appPackage.whyThisRoleBlurb}
            </p>
          </div>

          {/* Status Selector Below */}
          <div className="pt-4 border-t border-[#3D6FB4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h5 className="font-body text-xs font-semibold uppercase tracking-wider text-[#7C93AC]">
                Track Job Status
              </h5>
              <p className="font-body text-xs text-[#7C93AC]">
                Mark your application progress to keep your build plan organized
              </p>
            </div>

            {/* Three tappable pill buttons: "Saved", "Applied", "Interviewing" */}
            <div className="flex items-center gap-2">
              {statuses.map((status) => {
                const isSelected = currentStatus === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(status)}
                    className={`px-4 py-2 text-xs sm:text-sm font-body font-semibold rounded-full transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#F2A93B] text-[#10253F] border-[#F2A93B] shadow-sm font-bold'
                        : 'bg-transparent text-[#F2F0E6] border-[#3D6FB4] hover:border-[#F2A93B]/50'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
