import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ResumeUploadSection } from './components/ResumeUploadSection';
import { GithubConnectSection } from './components/GithubConnectSection';
import { JobDescriptionSection } from './components/JobDescriptionSection';
import { FitAnalysisSection } from './components/FitAnalysisSection';
import { RoadmapSection } from './components/RoadmapSection';
import { ApplicationPackageSection } from './components/ApplicationPackageSection';
import {
  SAMPLE_RESUME_FILENAME,
  SAMPLE_REPOS,
  SAMPLE_JOBS,
  SAMPLE_PROJECT_FITS,
  SAMPLE_RECOMMENDED_PROJECTS,
  SAMPLE_APPLICATION_PACKAGE,
} from './data/sampleData';
import { JobPosting, Repo, ProjectFit, RecommendedProject, ApplicationPackage, ApplicationStatus } from './types';
import { X, Github, Mail, ShieldCheck, Sparkles, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function App() {
  // Page Navigation State ('intake' or 'results')
  const [activePage, setActivePage] = useState<'intake' | 'results'>('intake');

  // State management (starts clean without preloaded resume or GitHub)
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [connectedGithubUser, setConnectedGithubUser] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentJob, setCurrentJob] = useState<JobPosting>(SAMPLE_JOBS[0]);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('Saved');
  const [signInModalOpen, setSignInModalOpen] = useState<boolean>(false);

  // Dynamic Fit Analysis State
  const [overallScore, setOverallScore] = useState<number>(74);
  const [verdict, setVerdict] = useState<'Strong Match' | 'Partial Match' | 'Needs Work'>('Partial Match');
  const [projectFits, setProjectFits] = useState<ProjectFit[]>(SAMPLE_PROJECT_FITS);
  const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProject[]>(SAMPLE_RECOMMENDED_PROJECTS);
  const [appPackage, setAppPackage] = useState<ApplicationPackage>(SAMPLE_APPLICATION_PACKAGE);

  // Loading & status banners
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatusText, setAnalysisStatusText] = useState<string>('');

  // Process control state
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  // Handlers (Updating inputs without auto-running heavy pipeline)
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

    try {
      // Step 1: Research company signal (optional enrichment)
      try {
        const compRes = await fetch('/api/company/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: targetJob.company }),
        });
        const compData = await compRes.json();
        companySignal = compData.engineeringSignal || '';
      } catch (e) {
        console.warn('Company research optional fallback:', e);
      }

      // Step 2: Fit Analysis
      setAnalysisStatusText('Evaluating project match against job requirements & company tech stack...');
      try {
        const fitRes = await fetch('/api/analysis/fit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repos: currentRepos, job: targetJob, companyResearch: companySignal }),
        });
        const fitData = await fitRes.json();

        if (fitData.success && fitData.fitAnalysis) {
          currentFitAnalysis = fitData.fitAnalysis;
          setOverallScore(fitData.fitAnalysis.overallScore || 75);
          setVerdict(fitData.fitAnalysis.verdict || 'Partial Match');
          if (Array.isArray(fitData.fitAnalysis.projectFits) && fitData.fitAnalysis.projectFits.length > 0) {
            setProjectFits(fitData.fitAnalysis.projectFits);
          }
        }
      } catch (e) {
        console.warn('Fit analysis fetch fallback:', e);
      }

      // Step 3: Roadmap Generation
      setAnalysisStatusText('Generating 3-step project build roadmap to close identified skill gaps...');
      try {
        const roadRes = await fetch('/api/roadmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: targetJob, fitAnalysis: currentFitAnalysis, companyResearch: companySignal }),
        });
        const roadData = await roadRes.json();
        if (roadData.success && Array.isArray(roadData.recommendedProjects) && roadData.recommendedProjects.length > 0) {
          setRecommendedProjects(roadData.recommendedProjects);
        }
      } catch (e) {
        console.warn('Roadmap generate fetch fallback:', e);
      }

      // Step 4: Application Package Generation
      setAnalysisStatusText('Drafting tailored resume highlight & "why this role" blurb...');
      try {
        const pkgRes = await fetch('/api/package/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: targetJob,
            candidateInfo: { candidateName: 'Alex Chen', degree: 'B.S. Computer Science' },
            fitAnalysis: currentFitAnalysis,
          }),
        });
        const pkgData = await pkgRes.json();
        if (pkgData.success && pkgData.appPackage) {
          setAppPackage({
            resumeHighlightSummary: pkgData.appPackage.resumeHighlightSummary || SAMPLE_APPLICATION_PACKAGE.resumeHighlightSummary,
            whyThisRoleBlurb: pkgData.appPackage.whyThisRoleBlurb || SAMPLE_APPLICATION_PACKAGE.whyThisRoleBlurb,
          });
        }
      } catch (e) {
        console.warn('Package generate fetch fallback:', e);
      }
    } catch (err) {
      console.error('Full AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatusText('');
      setHasAnalyzed(true);
      setTimeout(() => {
        const el = document.getElementById('step-fit');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#10253F] text-[#F2F0E6] flex flex-col font-body selection:bg-[#F2A93B] selection:text-[#10253F]">
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        hasAnalyzed={hasAnalyzed}
        onNavigate={setActivePage}
        onSignInClick={() => setSignInModalOpen(true)}
      />

      {/* Analysis Loading Indicator Banner */}
      {isAnalyzing && (
        <div className="sticky top-[65px] z-40 w-full bg-[#F2A93B] text-[#10253F] px-4 py-2.5 shadow-lg border-b border-[#F2A93B]/80 flex items-center justify-center space-x-3 text-xs sm:text-sm font-body font-semibold animate-in fade-in duration-150">
          <Loader2 className="w-4 h-4 animate-spin text-[#10253F]" />
          <span>{analysisStatusText || 'Gemini AI Engine is evaluating your portfolio...'}</span>
        </div>
      )}

      {/* Main Content Sections */}
      <main className="flex-1">
        {activePage === 'intake' ? (
          <>
            {/* Section 2: Hero */}
            <HeroSection onGetStartedClick={handleScrollToResume} />

            {/* Section 3: Step 1 - Resume Upload */}
            <ResumeUploadSection
              selectedResume={selectedResume}
              onResumeChange={handleResumeChange}
              onUseSample={handleUseSampleResume}
            />

            {/* Section 4: Step 2 - GitHub Connect */}
            <GithubConnectSection
              connectedUser={connectedGithubUser}
              repos={repos}
              onConnect={handleConnectGithub}
              onDisconnect={handleDisconnectGithub}
            />

            {/* Section 5: Step 3 - Job Description */}
            <JobDescriptionSection
              currentJob={currentJob}
              onSelectJob={handleSelectJob}
            />

            {/* Section 6: Action Step — Trigger Process */}
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

                  {/* Input Readiness Indicators */}
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

                  {/* Primary Action Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleStartProcess}
                      disabled={isAnalyzing}
                      className="inline-flex items-center space-x-2 bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold text-base sm:text-lg px-8 py-4 rounded-md transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5 text-[#10253F]" />
                      <span>Analyze Fit & Generate Build Plan</span>
                      <ArrowRight className="w-5 h-5 text-[#10253F]" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Dedicated Results Page View */
          <div className="w-full">
            {/* Page Header Bar */}
            <section className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-[#10253F] border-b border-[#3D6FB4]/30">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#F2A93B]">
                      Analysis Results
                    </span>
                    <span className="text-[#3D6FB4]">•</span>
                    <span className="font-mono-data text-xs text-[#7C93AC]">
                      {currentJob.company} — {currentJob.title}
                    </span>
                  </div>
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F2F0E6]">
                    Your Customized Build Plan & Fit Rating
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('intake')}
                  className="inline-flex items-center space-x-2 bg-[#3D6FB4]/20 hover:bg-[#3D6FB4]/40 text-[#F2F0E6] border border-[#3D6FB4] px-4 py-2 rounded text-xs font-body font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#F2A93B]" />
                  <span>Modify Inputs (Intake Form)</span>
                </button>
              </div>
            </section>

            {/* Loading Card during active analysis */}
            {isAnalyzing && (
              <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#3D6FB4]/10 border-b border-[#3D6FB4]/30">
                <div className="max-w-2xl mx-auto bg-[#10253F] border border-[#F2A93B] rounded-lg p-8 sm:p-10 text-center space-y-4 shadow-2xl relative overflow-hidden blueprint-grid">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#F2A93B]" />
                  </div>
                  <h4 className="font-display font-bold text-xl sm:text-2xl text-[#F2F0E6]">
                    Evaluating Candidate Portfolio & Building Roadmap
                  </h4>
                  <p className="font-mono-data text-xs sm:text-sm text-[#F2A93B]">
                    {analysisStatusText || 'Gemini AI Engine is processing project repositories...'}
                  </p>
                </div>
              </section>
            )}

            {/* Results Content */}
            <FitAnalysisSection
              overallScore={overallScore}
              verdict={verdict}
              projectFits={projectFits}
            />

            <RoadmapSection recommendedProjects={recommendedProjects} />

            <ApplicationPackageSection
              appPackage={appPackage}
              currentStatus={applicationStatus}
              onStatusChange={setApplicationStatus}
            />
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

      {/* Sign In Modal */}
      {signInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10253F]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSignInModalOpen(false)}
              className="absolute top-4 right-4 text-[#7C93AC] hover:text-[#F2F0E6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-[#F2F0E6]">
                Sign in to NextBuild
              </h3>
              <p className="font-body text-xs text-[#7C93AC]">
                Save your target job roadmaps and track build milestones across sessions.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSignInModalOpen(false)}
                className="w-full bg-[#3D6FB4] hover:bg-[#4b82cb] text-[#F2F0E6] font-body font-semibold px-4 py-3 rounded text-sm transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Github className="w-4 h-4 text-[#F2A93B]" />
                <span>Continue with GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => setSignInModalOpen(false)}
                className="w-full bg-transparent hover:bg-[#3D6FB4]/20 text-[#F2F0E6] border border-[#3D6FB4] font-body font-semibold px-4 py-3 rounded text-sm transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4 text-[#7C93AC]" />
                <span>Continue with Email</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#3D6FB4]/30 flex items-center justify-center space-x-1.5 text-[11px] font-body text-[#7C93AC]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4FA87B]" />
              <span>We never modify your public repos or private data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
