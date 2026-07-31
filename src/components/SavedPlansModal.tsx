import React, { useEffect, useState } from 'react';
import { SavedPlanRecord, fetchSavedBuildPlans, deleteSavedBuildPlan } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, ArrowRight, Trash2, ShieldCheck, FolderKanban } from 'lucide-react';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planData: any) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<SavedPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      setLoading(true);
      fetchSavedBuildPlans(currentUser.uid).then((res) => {
        setPlans(res);
        setLoading(false);
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleDelete = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    await deleteSavedBuildPlan(currentUser.uid, planId);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#10253F] border border-[#3D6FB4] rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3D6FB4]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#F2A93B]/20 border border-[#F2A93B]/40 flex items-center justify-center text-[#F2A93B]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#F2F0E6]">
                My Saved Build Plans
              </h3>
              <p className="font-body text-xs text-[#7C93AC]">
                {currentUser?.displayName || currentUser?.email} — Cloud Firestore Sync
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#7C93AC] hover:text-[#F2F0E6] p-1.5 rounded-lg hover:bg-[#3D6FB4]/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs font-body text-[#7C93AC] animate-pulse">
              Fetching saved build plans from Cloud Firestore...
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#3D6FB4]/10 border border-[#3D6FB4]/30 rounded-lg p-6">
              <FolderKanban className="w-10 h-10 text-[#7C93AC] mx-auto opacity-50" />
              <p className="font-body text-sm font-semibold text-[#F2F0E6]">
                No Saved Build Plans Found
              </p>
              <p className="font-body text-xs text-[#7C93AC] max-w-sm mx-auto">
                Run a portfolio analysis for any target job posting to automatically save and sync your build plan here!
              </p>
            </div>
          ) : (
            plans.map((plan) => {
              let verdictBadge = 'bg-[#F2A93B]/20 text-[#F2A93B] border-[#F2A93B]/40';
              if (plan.verdict === 'Strong Match') {
                verdictBadge = 'bg-[#4FA87B]/20 text-[#4FA87B] border-[#4FA87B]/40';
              } else if (plan.verdict === 'Needs Work') {
                verdictBadge = 'bg-[#C4634F]/20 text-[#C4634F] border-[#C4634F]/40';
              }

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    onSelectPlan(plan.data);
                    onClose();
                  }}
                  className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B] rounded-lg p-4 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-base text-[#F2F0E6] group-hover:text-[#F2A93B] transition-colors">
                        {plan.jobTitle}
                      </h4>
                      <span className="font-body text-xs font-semibold text-[#7C93AC]">
                        {plan.companyName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-xs font-mono-data font-bold border rounded-full ${verdictBadge}`}>
                        {plan.verdict}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(plan.id, e)}
                        title="Delete Plan"
                        className="text-[#7C93AC] hover:text-[#C4634F] p-1 rounded hover:bg-[#C4634F]/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-data border-t border-[#3D6FB4]/30 pt-2 text-[#7C93AC]">
                    <div className="flex items-center space-x-4">
                      <span>GitHub: <strong className="text-[#F2F0E6]">{plan.githubScore}%</strong></span>
                      <span>ATS: <strong className="text-[#F2F0E6]">{plan.resumeAtsScore}%</strong></span>
                      <span>Overall: <strong className="text-[#F2A93B]">{plan.overallScore}%</strong></span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
