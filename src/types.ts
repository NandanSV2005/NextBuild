export interface Repo {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  stars?: number;
  updatedAt?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  descriptionSnippet: string;
  requiredSkills: string[];
  seniorityLevel?: string;
  yearsOfExperienceRequired?: number;
}

export interface ExperienceEntry {
  role?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ParsedResumeProject {
  title?: string;
  description?: string;
  techUsed?: string[];
  approxDate?: string;
}

export interface ParsedResumeData {
  candidateName?: string;
  degree?: string;
  certifications?: string[];
  totalYearsExperience?: number;
  topSkills?: string[];
  experienceSummary?: string;
  experienceEntries?: ExperienceEntry[];
  projectsListed?: ParsedResumeProject[];
}

export interface EngineeringSignals {
  commitPattern?: string;
  hasTests?: boolean;
  hasCI?: boolean;
  hasDeployment?: boolean;
  appearsOriginal?: boolean;
  lastActive?: string;
}

export interface ProjectFit {
  id: string;
  projectName: string;
  verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech';
  verdictColor: 'green' | 'amber' | 'red';
  readmeSummary?: string;
  engineeringSignals?: EngineeringSignals;
  reasoning: string;
}

export interface ResumeGapAnalysis {
  matchSummary: string;
  missingRequirements: { requirement: string; whyItMatters: string }[];
  unbackedKeywords: { skill: string; whyThisIsAProblem: string }[];
  weakAreas: { area: string; issue: string }[];
  atsPhrasingGaps: { jdTerm: string; resumePhrasing: string; risk: string }[];
  resumeQualityNotes: string[];
}

export interface ConsistencyCheck {
  overclaimFlags: { resumeClaim: string; githubReality: string; severity: 'minor' | 'significant' }[];
  missingStrongProjects: { repoName: string; whyItShouldBeOnResume: string }[];
  dateInconsistencies: { projectName: string; resumeClaimedDate: string; githubActualDateRange: string; severity: 'minor' | 'significant' }[];
  overallConsistencyNote: string;
}

export interface FitEngineResult {
  overallScore: number;
  githubScore: number;
  resumeAtsScore: number;
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  githubVerdict?: 'Strong Match' | 'Partial Match' | 'Needs Work';
  resumeVerdict?: 'Strong Match' | 'Partial Match' | 'Needs Work';
  projectFits: ProjectFit[];
  disclaimer?: string;
}

export interface ResumeSkillRoadmapItem {
  stepNumber: number;
  topic: string;
  problemIdentified: string;
  actionPlan: string;
  recommendedResourceUrl: string;
}

export interface RoadmapMilestone {
  stepNumber: number;
  title: string;
  description: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
  addressesGap?: string;
  problemStatement: string;
  techStack: string[];
  estimatedBuildTime: string;
  milestones: RoadmapMilestone[];
}

export interface ApplicationPackage {
  resumeHighlightSummary: string;
  whyThisRoleBlurb: string;
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interviewing';
