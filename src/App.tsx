import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { SavedPlansModal } from './components/SavedPlansModal';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ResumeUploadSection } from './components/ResumeUploadSection';
import { GithubConnectSection } from './components/GithubConnectSection';
import { JobDescriptionSection } from './components/JobDescriptionSection';
import { FitAnalysisSection } from './components/FitAnalysisSection';
import { RoadmapSection } from './components/RoadmapSection';
import { InterviewPrepSection } from './components/InterviewPrepSection';
import { ApplicationPackageSection } from './components/ApplicationPackageSection';
import { BlueprintLoadingAnimation } from './components/BlueprintLoadingAnimation';
import { saveBuildPlanToCloud } from './lib/firebase';
import { InterviewQuestionItem } from './services/fitEngine';
import {
  SAMPLE_RESUME_FILENAME,
  SAMPLE_REPOS,
  SAMPLE_JOBS,
  SAMPLE_PROJECT_FITS,
  SAMPLE_RECOMMENDED_PROJECTS,
  SAMPLE_APPLICATION_PACKAGE,
  SAMPLE_INTERVIEW_QUESTIONS,
} from './data/sampleData';
import { JobPosting, Repo, ProjectFit, RecommendedProject, ApplicationPackage, ApplicationStatus } from './types';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

function MainContent() {
  const { currentUser } = useAuth();

  // Page Navigation State ('landing' | 'intake' | 'results' | 'interview-prep')
  const [activePage, setActivePage] = useState<'landing' | 'intake' | 'results' | 'interview-prep'>('landing');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [savedPlansModalOpen, setSavedPlansModalOpen] = useState<boolean>(false);

  const handleNavigateToInterviewPrep = () => {
    setActivePage('results');
    setTimeout(() => {
      const el = document.getElementById('step-interview-prep');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // State management (starts clean without preloaded resume or GitHub)
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [connectedGithubUser, setConnectedGithubUser] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentJob, setCurrentJob] = useState<JobPosting>(SAMPLE_JOBS[0]);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('Saved');

  // Dynamic Fit Analysis State
  const [overallScore, setOverallScore] = useState<number>(74);
  const [githubScore, setGithubScore] = useState<number>(78);
  const [resumeAtsScore, setResumeAtsScore] = useState<number>(70);
  const [verdict, setVerdict] = useState<'Strong Match' | 'Partial Match' | 'Needs Work'>('Partial Match');
  const [githubVerdict, setGithubVerdict] = useState<'Strong Match' | 'Partial Match' | 'Needs Work'>('Partial Match');
  const [resumeVerdict, setResumeVerdict] = useState<'Strong Match' | 'Partial Match' | 'Needs Work'>('Partial Match');
  const [projectFits, setProjectFits] = useState<ProjectFit[]>(SAMPLE_PROJECT_FITS);
  const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProject[]>(SAMPLE_RECOMMENDED_PROJECTS);
  const [appPackage, setAppPackage] = useState<ApplicationPackage>(SAMPLE_APPLICATION_PACKAGE);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionItem[]>(SAMPLE_INTERVIEW_QUESTIONS);

  // Loading & status banners
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatusText, setAnalysisStatusText] = useState<string>('');

  // Process control state
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  // Handlers
  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleScrollToResume = () => {
    const el = document.getElementById('step-resume');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUseSampleResume = () => {
    setSelectedResume(SAMPLE_RESUME_FILENAME);
    if (!connectedGithubUser) {
      setConnectedGithubUser('alexdev-builds');
      setRepos(SAMPLE_REPOS);
    }
  };

  const handleResumeChange = (filename: string | null) => {
    setSelectedResume(filename);
  };

  const handleConnectGithub = async (username: string) => {
    const cleanUser = username.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    setConnectedGithubUser(cleanUser);
    setAnalysisStatusText(`Fetching @${cleanUser} public repositories...`);

    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.repos)) {
        setRepos(data.repos);
      } else {
        setRepos(SAMPLE_REPOS);
      }
    } catch (err) {
      console.warn('GitHub analyze fallback:', err);
      setRepos(SAMPLE_REPOS);
    }
  };

  const handleDisconnectGithub = () => {
    setConnectedGithubUser(null);
    setRepos([]);
  };

  const handleSelectJob = (job: JobPosting) => {
    setCurrentJob(job);
  };

  const handleSelectSavedPlan = (planData: any) => {
    if (!planData) return;
    setOverallScore(planData.overallScore || 74);
    setGithubScore(planData.githubScore || 78);
    setResumeAtsScore(planData.resumeAtsScore || 70);
    setVerdict(planData.verdict || 'Partial Match');
    setGithubVerdict(planData.githubVerdict || 'Partial Match');
    setResumeVerdict(planData.resumeVerdict || 'Partial Match');
    if (planData.projectFits) setProjectFits(planData.projectFits);
    if (planData.recommendedProjects) setRecommendedProjects(planData.recommendedProjects);
    if (planData.appPackage) setAppPackage(planData.appPackage);
    if (planData.interviewQuestions) setInterviewQuestions(planData.interviewQuestions);
    if (planData.job) setCurrentJob(planData.job);
    setHasAnalyzed(true);
    setActivePage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manual Trigger Handler: Opens dedicated Results Page and runs analysis
  const handleStartProcess = () => {
    setActivePage('results');
    setHasAnalyzed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const activeRepos = repos.length > 0 ? repos : SAMPLE_REPOS;
    runFullAnalysis(activeRepos, currentJob);
  };

  // Orchestrated AI Analysis
  const runFullAnalysis = async (currentRepos: Repo[], targetJob: JobPosting) => {
    setIsAnalyzing(true);
    setAnalysisStatusText(`Running Gemini Fit Engine for ${targetJob.company}...`);

    let companySignal = '';
    let currentFitAnalysis: any = null;

    const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs = 6000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return res;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    try {
      try {
        const compRes = await fetchWithTimeout('/api/company/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: targetJob.company }),
        }, 4000);
        if (compRes.ok) {
          const compData = await compRes.json();
          companySignal = compData.engineeringSignal || '';
        }
      } catch (e) {
        console.warn('Company research optional fallback:', e);
      }

      setAnalysisStatusText('Evaluating project match against job requirements & company tech stack...');
      let finalGhScore = githubScore;
      let finalResScore = resumeAtsScore;
      let finalOverallScore = overallScore;
      let finalVerdict = verdict;
      let finalFits = projectFits;

      try {
        const fitRes = await fetchWithTimeout('/api/analysis/fit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repos: currentRepos, job: targetJob, companyResearch: companySignal }),
        }, 8000);

        if (fitRes.ok) {
          const fitData = await fitRes.json();
          if (fitData.success && fitData.fitAnalysis) {
            currentFitAnalysis = fitData.fitAnalysis;
            finalOverallScore = fitData.fitAnalysis.overallScore || 74;
            finalGhScore = fitData.fitAnalysis.githubScore || 78;
            finalResScore = fitData.fitAnalysis.resumeAtsScore || 70;
            finalVerdict = fitData.fitAnalysis.verdict || 'Partial Match';

            setOverallScore(finalOverallScore);
            setGithubScore(finalGhScore);
            setResumeAtsScore(finalResScore);
            setVerdict(finalVerdict);
            setGithubVerdict(fitData.fitAnalysis.githubVerdict || 'Partial Match');
            setResumeVerdict(fitData.fitAnalysis.resumeVerdict || 'Partial Match');
            if (Array.isArray(fitData.fitAnalysis.projectFits) && fitData.fitAnalysis.projectFits.length > 0) {
              finalFits = fitData.fitAnalysis.projectFits;
              setProjectFits(finalFits);
            }
          }
        }
      } catch (e) {
        console.warn('Fit analysis fetch fallback:', e);
        const fallbackFits: ProjectFit[] = currentRepos.map((r, i) => ({
          id: r.id || `repo-${i}`,
          projectName: r.name,
          verdict: 'Partial Match',
          verdictColor: 'amber',
          readmeSummary: r.description || `Repository focusing on ${(r.techStack || []).join(', ') || 'software engineering'}.`,
          reasoning: `Repository "${r.name}" (${(r.techStack || []).join(', ') || 'code'}) evaluated against target job requirements for ${targetJob.title}.`,
        }));
        finalFits = fallbackFits;
        setProjectFits(fallbackFits);
      }

      let finalRoadmap = recommendedProjects;
      setAnalysisStatusText('Generating 3-step project build roadmap to close identified skill gaps...');
      try {
        const roadRes = await fetchWithTimeout('/api/roadmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repos: currentRepos,
            job: targetJob,
            companyResearch: companySignal,
            fitAnalysis: currentFitAnalysis,
          }),
        }, 8000);

        if (roadRes.ok) {
          const roadData = await roadRes.json();
          if (roadData.success && Array.isArray(roadData.recommendedProjects) && roadData.recommendedProjects.length > 0) {
            finalRoadmap = roadData.recommendedProjects;
            setRecommendedProjects(finalRoadmap);
          }
        }
      } catch (e) {
        console.warn('Roadmap fetch fallback:', e);
      }

      setAnalysisStatusText('Generating 5 target job technical interview questions & STAR answers...');
      let finalQuestions = interviewQuestions;
      try {
        const qRes = await fetchWithTimeout('/api/interview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: targetJob, repos: currentRepos }),
        }, 8000);

        if (qRes.ok) {
          const qData = await qRes.json();
          if (qData.success && Array.isArray(qData.questions) && qData.questions.length > 0) {
            finalQuestions = qData.questions;
            setInterviewQuestions(finalQuestions);
          }
        }
      } catch (e) {
        console.warn('Interview prep fetch fallback:', e);
      }

      let finalPkg = appPackage;
      setAnalysisStatusText('Drafting tailored cold email & LinkedIn recruiter outreach message...');
      try {
        const pkgRes = await fetchWithTimeout('/api/package/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: targetJob, repos: currentRepos }),
        }, 8000);

        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          if (pkgData.success && pkgData.applicationPackage) {
            finalPkg = pkgData.applicationPackage;
            setAppPackage(finalPkg);
          }
        }
      } catch (e) {
        console.warn('Outreach package fetch fallback:', e);
      }

      // Auto-save to Cloud Firestore if signed in
      if (currentUser) {
        saveBuildPlanToCloud(currentUser.uid, {
          companyName: targetJob.company || 'Target Company',
          jobTitle: targetJob.title || 'Software Engineer',
          overallScore: finalOverallScore,
          githubScore: finalGhScore,
          resumeAtsScore: finalResScore,
          verdict: finalVerdict,
          data: {
            overallScore: finalOverallScore,
            githubScore: finalGhScore,
            resumeAtsScore: finalResScore,
            verdict: finalVerdict,
            githubVerdict,
            resumeVerdict,
            projectFits: finalFits,
            recommendedProjects: finalRoadmap,
            appPackage: finalPkg,
            interviewQuestions: finalQuestions,
            job: targetJob,
          },
        });
      }

    } finally {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#10253F] text-[#F2F0E6] flex flex-col font-body selection:bg-[#F2A93B] selection:text-[#10253F]">
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        hasAnalyzed={hasAnalyzed}
        onNavigate={setActivePage}
        onNavigateToInterviewPrep={handleNavigateToInterviewPrep}
        onSignInClick={() => openAuthModal('signin')}
        onSignUpClick={() => openAuthModal('signup')}
        onOpenSavedPlans={() => setSavedPlansModalOpen(true)}
      />

      {/* Analysis Loading Indicator Banner */}
      {isAnalyzing && (
        <div className="sticky top-[65px] z-40 w-full bg-[#F2A93B] text-[#10253F] px-4 py-2.5 shadow-lg border-b border-[#F2A93B]/80 flex items-center justify-center space-x-3 text-xs sm:text-sm font-body font-semibold animate-in fade-in duration-150">
          <Loader2 className="w-4 h-4 animate-spin text-[#10253F]" />
          <span>{analysisStatusText || 'Gemini AI Engine is evaluating your portfolio...'}</span>
        </div>
      )}

      {/* Main Content Pages */}
      <main className="flex-1">
        {activePage === 'landing' ? (
          <LandingPage
            onGetStarted={() => openAuthModal('signup')}
            onSignInClick={() => openAuthModal('signin')}
            onExploreGuest={() => setActivePage('intake')}
          />
        ) : activePage === 'intake' ? (
          <>
            <HeroSection onGetStartedClick={handleScrollToResume} />

            <ResumeUploadSection
              selectedResume={selectedResume}
              onResumeChange={handleResumeChange}
              onUseSample={handleUseSampleResume}
            />

            <GithubConnectSection
              connectedUser={connectedGithubUser}
              repos={repos}
              onConnect={handleConnectGithub}
              onDisconnect={handleDisconnectGithub}
            />

            <JobDescriptionSection
              currentJob={currentJob}
              onSelectJob={handleSelectJob}
            />

            {/* Action Trigger */}
            <section className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30 bg-[#3D6FB4]/10">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#F2A93B]">
                    Step 4 — Generate Plan
                  </span>
                  <div className="h-[1px] flex-1 bg-[#F2A93B]/40" />
                </div>

                <div className="bg-[#10253F] border-2 border-[#F2A93B] rounded-lg p-6 sm:p-8 space-y-6 shadow-xl text-center">
                  <div className="max-w-2xl mx-auto space-y-2">
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#F2F0E6]">
                      Ready to Analyze Your Build Plan?
                    </h3>
                    <p className="font-body text-sm sm:text-base text-[#7C93AC]">
                      Once you've uploaded your resume, connected your GitHub profile, and selected your target job posting, click below to open your custom build plan on a dedicated results page.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-xs font-mono-data">
                    <span className={`px-3 py-1 rounded-full border ${selectedResume ? 'bg-[#4FA87B]/20 text-[#4FA87B] border-[#4FA87B]/40 font-semibold' : 'bg-[#3D6FB4]/20 text-[#7C93AC] border-[#3D6FB4]'}`}>
                      {selectedResume ? `✓ Resume: ${selectedResume}` : 'Resume: Sample Ready'}
                    </span>
                    <span className={`px-3 py-1 rounded-full border ${connectedGithubUser ? 'bg-[#4FA87B]/20 text-[#4FA87B] border-[#4FA87B]/40 font-semibold' : 'bg-[#3D6FB4]/20 text-[#7C93AC] border-[#3D6FB4]'}`}>
                      {connectedGithubUser ? `✓ GitHub: @${connectedGithubUser}` : 'GitHub: Sample Ready'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#4FA87B]/20 text-[#4FA87B] border border-[#4FA87B]/40 font-semibold">
                      ✓ Job: {currentJob.company} — {currentJob.title.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleStartProcess}
                      disabled={isAnalyzing}
                      className="bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold px-8 py-4 rounded-md text-base transition-all shadow-[0_0_20px_rgba(242,169,59,0.3)] hover:shadow-[0_0_25px_rgba(242,169,59,0.5)] cursor-pointer inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Analyze Fit & Generate Build Plan</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Results Page */
          <div className="py-8 space-y-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3D6FB4]/40 pb-6">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActivePage('intake')}
                  className="text-xs font-mono-data text-[#7C93AC] hover:text-[#F2A93B] flex items-center space-x-1 mb-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Resume, GitHub & Job Input</span>
                </button>
                <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#F2F0E6] tracking-tight">
                  Portfolio Fit & Build Plan Results
                </h2>
                <p className="font-body text-xs sm:text-sm text-[#7C93AC]">
                  Target Posting: <span className="text-[#F2A93B] font-semibold">{currentJob.title}</span> at <span className="text-[#F2F0E6] font-semibold">{currentJob.company}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => runFullAnalysis(repos.length > 0 ? repos : SAMPLE_REPOS, currentJob)}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-[#3D6FB4]/20 hover:bg-[#3D6FB4]/40 border border-[#3D6FB4] text-[#F2F0E6] font-body text-xs font-semibold rounded transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Loader2 className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Re-Analyze Portfolio</span>
                </button>
              </div>
            </div>

            {isAnalyzing ? (
              <BlueprintLoadingAnimation />
            ) : (
              <>
                <FitAnalysisSection
                  overallScore={overallScore}
                  githubScore={githubScore}
                  resumeAtsScore={resumeAtsScore}
                  verdict={verdict}
                  githubVerdict={githubVerdict}
                  resumeVerdict={resumeVerdict}
                  projectFits={projectFits}
                  totalReposCount={repos.length}
                  githubUser={connectedGithubUser}
                />

                <RoadmapSection
                  recommendedProjects={recommendedProjects}
                  overallScore={overallScore}
                />

                <InterviewPrepSection questions={interviewQuestions.length > 0 ? interviewQuestions : SAMPLE_INTERVIEW_QUESTIONS} />

                <ApplicationPackageSection
                  appPackage={appPackage}
                  currentStatus={applicationStatus}
                  onStatusChange={setApplicationStatus}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Blueprint Footer */}
      <footer className="w-full border-t border-[#3D6FB4]/40 py-8 px-4 sm:px-6 lg:px-8 bg-[#10253F]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-[#7C93AC]">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-sm text-[#F2F0E6]">NextBuild</span>
            <span>— Turn your resume into a concrete build plan</span>
          </div>

          <div className="flex items-center space-x-6">
            <span>Built for student job seekers</span>
            <span className="text-[#3D6FB4]">•</span>
            <span className="font-mono-data text-[11px]">NextBuild v1.0</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        onAuthSuccess={() => setActivePage('intake')}
      />

      <SavedPlansModal
        isOpen={savedPlansModalOpen}
        onClose={() => setSavedPlansModalOpen(false)}
        onSelectPlan={handleSelectSavedPlan}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
