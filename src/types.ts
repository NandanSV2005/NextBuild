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
}

export interface ProjectFit {
  id: string;
  projectName: string;
  verdict: 'Direct Match' | 'Partial Match' | 'Missing Tech';
  verdictColor: 'green' | 'amber' | 'red';
  reasoning: string;
}

export interface RoadmapMilestone {
  stepNumber: number;
  title: string;
  description: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
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
