import { GoogleGenAI, Type } from "@google/genai";
import { EngineeringSignals, ProjectFit, ResumeGapAnalysis, ConsistencyCheck, RecommendedProject } from "../types";

export interface RepoInput {
  id?: string;
  name?: string;
  description?: string;
  techStack?: string[];
  stars?: number;
  updatedAt?: string;
  // NEW: real evidence data, fetched separately before this is passed in
  readmeContent?: string | null; // null = genuinely not found, distinct from empty string
  commits?: { date: string; message: string }[];
  hasTests?: boolean;
  hasCI?: boolean;
  hasDocker?: boolean;
  dependencyFile?: string | null;
}

export interface JobInput {
  id?: string;
  title?: string;
  company?: string;
  requiredSkills?: string[];
  domain?: string;
  descriptionSnippet?: string;
}

export interface FitEngineResult {
  overallScore: number;
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  projectFits: ProjectFit[];
  resumeGapAnalysis?: ResumeGapAnalysis;
  consistencyCheck?: ConsistencyCheck;
  informedByCompanyResearch: boolean;
  disclaimer: string;
}

export interface EvaluateFitParams {
  repos: RepoInput[];
  job: JobInput;
  resumeData?: any;
  companyResearch?: string | null;
  aiClient?: any;
}

// FIX #2/#3: heuristic fallback now reports unknowns as unknown, not false-positive claims
function computeHeuristicFit(repos: RepoInput[], job: JobInput, hasCompanyResearch: boolean): FitEngineResult {
  const reqSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
  const allRepoTech = (repos || []).flatMap((r) => r.techStack || []).map((t) => t.toLowerCase());

  const matched = reqSkills.filter((s) => allRepoTech.some((t) => t.includes(s) || s.includes(t)));
  const matchRatio = reqSkills.length > 0 ? matched.length / reqSkills.length : 0.6;

  const score = Math.round(Math.min(95, Math.max(35, matchRatio * 100)));
  const verdict: 'Strong Match' | 'Partial Match' | 'Needs Work' =
    score >= 80 ? 'Strong Match' : score >= 60 ? 'Partial Match' : 'Needs Work';

  const projectFits: ProjectFit[] = (repos || []).map((r, i) => {
    const repoTech = (r.techStack || []).map((t) => t.toLowerCase());
    const repoMatches = reqSkills.filter((s) => repoTech.some((t) => t.includes(s) || s.includes(t)));

    let projVerdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech' = 'Partial Match';
    let projColor: 'green' | 'amber' | 'red' = 'amber';

    if (repoMatches.length >= 2 || (repoMatches.length >= 1 && reqSkills.length <= 3)) {
      projVerdict = 'Direct Match';
      projColor = 'green';
    } else if (repoMatches.length === 0) {
      projVerdict = 'Weak Match';
      projColor = 'red';
    }

    return {
      id: r.id || `repo-${i}`,
      projectName: r.name || `Project ${i + 1}`,
      verdict: projVerdict,
      verdictColor: projColor,
      readmeSummary: r.readmeContent
        ? `README found — heuristic mode did not deep-read content (AI unavailable).`
        : `No README content available for this repository.`,
      engineeringSignals: {
        // FIX #3: unknown fields report null, not a fabricated favorable default
        commitPattern: r.commits && r.commits.length > 0 ? 'Not analyzed (heuristic fallback)' : 'Not determined',
        hasTests: typeof r.hasTests === 'boolean' ? r.hasTests : null,
        hasCI: typeof r.hasCI === 'boolean' ? r.hasCI : null,
        hasDeployment: null,
        appearsOriginal: null,
        lastActive: r.updatedAt || 'Unknown',
      },
      reasoning: repoMatches.length > 0
        ? `Demonstrates key required skills (${repoMatches.join(', ')}) matching target JD requirements based on tech-tag overlap only (AI deep analysis unavailable).`
        : `Repository technology stack does not directly reflect primary required job skills.`,
    };
  });

  return {
    overallScore: score,
    verdict,
    projectFits: projectFits.length > 0 ? projectFits : [
      {
        id: 'fit-default',
        projectName: 'Candidate Portfolio',
        verdict: 'Partial Match',
        verdictColor: 'amber',
        reasoning: 'Portfolio evaluated against job required competencies using heuristic fallback only.',
      }
    ],
    informedByCompanyResearch: hasCompanyResearch,
    disclaimer: 'This is AI-generated guidance to help you decide what to build next — not a guarantee of how a recruiter will see your profile.',
  };
}

export async function evaluateFit(params: EvaluateFitParams): Promise<FitEngineResult> {
  const { repos, job, resumeData, companyResearch, aiClient } = params;

  const hasCompanyResearch = Boolean(companyResearch && companyResearch.trim().length > 0);
  const fallbackResult = computeHeuristicFit(repos, job, hasCompanyResearch);

  try {
    let ai = aiClient;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || "MISSING_KEY";
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }

    // FIX #1: prompt now explicitly built around REAL fetched evidence (readme, commits, tests/CI/docker,
    // dependency file) instead of asking the model to reason about data it was never given.
    // FIX #2: explicit instruction to state "not found" rather than infer/hallucinate when data is missing.
    const githubFitPrompt = `You are a strict, pragmatic senior software engineering hiring manager conducting a thorough technical review. Read and reason through each project's ACTUAL fetched evidence before scoring — do not pattern-match on tech tags alone, and do NOT invent details for evidence that is missing.

Candidate Repositories (each includes real fetched data: readmeContent, recent commits, hasTests, hasCI, hasDocker, dependencyFile — if a field is null/empty, that means it genuinely was not found, not that you should guess): ${JSON.stringify(repos || [])}
Target Job: ${JSON.stringify(job || {})}
Company Technical Context: ${hasCompanyResearch ? companyResearch : "None provided (use JD requirements only)"}

For EACH project, work through:
1. README claims vs. reality: if readmeContent is present, what does it say the project does? Does the language/tech stack and dependencyFile support that claim? If readmeContent is null, explicitly state "No README found" rather than inferring purpose from the repo name.
2. Commit pattern: look at the actual commits array. Does it show incremental development over time (multiple commits with meaningfully different dates/messages), or a single/few large commits suggesting the code was written elsewhere and uploaded? If commits data is empty, state that commit history could not be analyzed.
3. Engineering maturity: use the real hasTests, hasCI, hasDocker fields directly — do not guess. Their presence suggests production-minded habits; their absence in an otherwise complex project is worth noting.
4. Originality: based on the README and file structure, does this look like a fork, a close clone of a known tutorial/bootcamp project, or original work? State your confidence plainly, and say "cannot determine" if there isn't enough evidence either way.
5. Recency: use the real lastActive/updatedAt date.
6. Relevance to this specific JD (and company context, if provided) — not general competence.

CRITICAL SCORING RULES:
1. No meaningful skill overlap → score <50, verdict 'Needs Work'.
2. Substantive, README-and-commit-backed 80%+ requirement coverage → score 80-100, verdict 'Strong Match'.
3. Tags unsupported by README/commits/dependencies must be called out, not silently trusted.
4. Never default to 'Partial Match' when uncertain — state what's missing to resolve the uncertainty.
5. If evidence for a project is almost entirely absent (no README, no commits, no dependency file), say so explicitly in the reasoning and score conservatively — do not fabricate confidence.

For EACH project, provide:
- id & projectName
- verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech'
- verdictColor: 'green' | 'amber' | 'red'
- readmeSummary: 1-2 sentences on what the README actually says, or "No README found" if null
- engineeringSignals: { commitPattern: string, hasTests: boolean, hasCI: boolean, hasDeployment: boolean, appearsOriginal: boolean, lastActive: string }
- reasoning: 3-5 sentences citing specific evidence, stating whether tags were actually backed up, and whether company research or JD-only informed the verdict`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: githubFitPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            projectFits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  projectName: { type: Type.STRING },
                  verdict: { type: Type.STRING },
                  verdictColor: { type: Type.STRING },
                  readmeSummary: { type: Type.STRING },
                  engineeringSignals: {
                    type: Type.OBJECT,
                    properties: {
                      commitPattern: { type: Type.STRING },
                      hasTests: { type: Type.BOOLEAN },
                      hasCI: { type: Type.BOOLEAN },
                      hasDeployment: { type: Type.BOOLEAN },
                      appearsOriginal: { type: Type.BOOLEAN },
                      lastActive: { type: Type.STRING },
                    },
                  },
                  reasoning: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    const score = typeof parsed.overallScore === 'number' ? Math.min(100, Math.max(0, parsed.overallScore)) : 50;
    const overallVerdict: 'Strong Match' | 'Partial Match' | 'Needs Work' =
      ['Strong Match', 'Partial Match', 'Needs Work'].includes(parsed.verdict)
        ? parsed.verdict
        : (score >= 80 ? 'Strong Match' : score >= 60 ? 'Partial Match' : 'Needs Work');

    const mappedFits: ProjectFit[] = Array.isArray(parsed.projectFits) && parsed.projectFits.length > 0
      ? parsed.projectFits.map((pf: any, idx: number) => ({
          id: pf.id || repos[idx]?.id || `fit-${idx}`,
          projectName: pf.projectName || repos[idx]?.name || `Project ${idx + 1}`,
          verdict: ['Direct Match', 'Partial Match', 'Weak Match', 'Missing Tech'].includes(pf.verdict) ? pf.verdict : 'Partial Match',
          verdictColor: ['green', 'amber', 'red'].includes(pf.verdictColor) ? pf.verdictColor : 'amber',
          readmeSummary: pf.readmeSummary || (repos[idx]?.readmeContent ? `Repository focusing on ${repos[idx]?.techStack?.join(', ') || 'software engineering'}.` : 'No README found for this repository.'),
          // FIX #3: default to null/unknown, never a fabricated favorable claim, when the model omits a field
          engineeringSignals: pf.engineeringSignals || {
            commitPattern: 'Not determined',
            hasTests: null,
            hasCI: null,
            hasDeployment: null,
            appearsOriginal: null,
            lastActive: repos[idx]?.updatedAt || 'Unknown',
          },
          reasoning: pf.reasoning || 'Project evaluated against required job skills.',
        }))
      : fallbackResult.projectFits;

    return {
      overallScore: score,
      verdict: overallVerdict,
      projectFits: mappedFits,
      informedByCompanyResearch: hasCompanyResearch,
      disclaimer: fallbackResult.disclaimer,
    };
  } catch (err) {
    console.warn("Fit engine evaluation fallback:", err);
    return fallbackResult;
  }
}

// 2. Resume Deep Analysis Function
export async function evaluateResumeDeep(resumeData: any, job: JobInput, aiClient?: any): Promise<ResumeGapAnalysis> {
  const fallback: ResumeGapAnalysis = {
    matchSummary: 'Resume analysis unavailable — AI service could not be reached. Showing placeholder result; retry when possible.',
    missingRequirements: [],
    unbackedKeywords: [],
    weakAreas: [],
    atsPhrasingGaps: [],
    resumeQualityNotes: ['Automated analysis failed — please retry.'],
  };

  try {
    let ai = aiClient;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || "MISSING_KEY";
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }

    const resumeGapAnalysisPrompt = `You are a strict, pragmatic hiring manager reviewing a resume against a specific job description. Identify concrete gaps — do not write flattering copy.

Candidate Resume: ${JSON.stringify(resumeData || {})}
Target Job: ${JSON.stringify(job || {})}

Check ALL of the following, separately:
1. Keyword presence vs. backing evidence: for every required skill, is it mentioned at all, and separately, is there a real project/experience entry demonstrating it?
2. Seniority/experience-level match: does the resume's actual experience level (fresher, 1-2 yrs, etc.) match what the JD is asking for? State this plainly if there's a mismatch.
3. Education/certification match: does the JD require a specific degree, certification, or coursework the resume does or doesn't show?
4. Quantified outcomes: do experience/project bullets include real numbers or measurable impact, or are they vague duty-listings ("worked on backend features" vs "reduced API response time by 40%")?
5. ATS phrasing: does the resume use the JD's actual terminology (e.g., JD says "CI/CD pipelines," resume says "automation scripts") — note where a real skill might get missed by an ATS keyword filter due to phrasing mismatch alone.

Produce:
- matchSummary: 2-3 sentences, including the ratio of backed vs. keyword-only required skills and the seniority-level fit
- missingRequirements: { requirement, whyItMatters }[] — not present anywhere in the resume
- unbackedKeywords: { skill, whyThisIsAProblem }[] — present as a keyword, no real project/experience backing
- weakAreas: { area, issue }[] — backed but weakly (vague, no depth/outcome)
- atsPhrasingGaps: { jdTerm, resumePhrasing, risk }[] — real skill likely present but phrased differently than the JD, risking ATS filtering
- resumeQualityNotes: string[] — craft issues independent of the JD (missing metrics, vague bullets, etc.)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: resumeGapAnalysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchSummary: { type: Type.STRING },
            missingRequirements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  requirement: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                },
              },
            },
            unbackedKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  whyThisIsAProblem: { type: Type.STRING },
                },
              },
            },
            weakAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  issue: { type: Type.STRING },
                },
              },
            },
            atsPhrasingGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jdTerm: { type: Type.STRING },
                  resumePhrasing: { type: Type.STRING },
                  risk: { type: Type.STRING },
                },
              },
            },
            resumeQualityNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      matchSummary: parsed.matchSummary || fallback.matchSummary,
      missingRequirements: Array.isArray(parsed.missingRequirements) ? parsed.missingRequirements : fallback.missingRequirements,
      unbackedKeywords: Array.isArray(parsed.unbackedKeywords) ? parsed.unbackedKeywords : fallback.unbackedKeywords,
      weakAreas: Array.isArray(parsed.weakAreas) ? parsed.weakAreas : fallback.weakAreas,
      atsPhrasingGaps: Array.isArray(parsed.atsPhrasingGaps) ? parsed.atsPhrasingGaps : fallback.atsPhrasingGaps,
      resumeQualityNotes: Array.isArray(parsed.resumeQualityNotes) ? parsed.resumeQualityNotes : fallback.resumeQualityNotes,
    };
  } catch (err) {
    console.warn("Resume gap analysis fallback:", err);
    return fallback;
  }
}

// 3. Resume/GitHub Consistency Check Function
export async function checkResumeGithubConsistency(resumeData: any, githubFitAnalysis: any, aiClient?: any): Promise<ConsistencyCheck> {
  const fallback: ConsistencyCheck = {
    overclaimFlags: [],
    missingStrongProjects: [],
    overallConsistencyNote: 'Consistency check unavailable — AI service could not be reached.',
  };

  try {
    let ai = aiClient;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || "MISSING_KEY";
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }

    const consistencyCheckPrompt = `Cross-check the candidate's resume claims against their actual GitHub evidence. Your job is to catch embellishment and surface strong work that's missing from the resume.

Candidate Resume: ${JSON.stringify(resumeData || {})}
GitHub Project Analysis: ${JSON.stringify(githubFitAnalysis || {})}

Check:
1. Overclaiming: does the resume describe a project (scale, architecture, impact) in a way the actual GitHub repo doesn't support? (e.g., resume says "scalable microservices architecture," repo is a single-file monolith)
2. Missing wins: does GitHub show a strong, relevant project that ISN'T mentioned on the resume at all? This is a free improvement the student should make.
3. Consistency of claimed dates/roles: do resume project dates roughly align with the repo's commit history?

Produce:
- overclaimFlags: { resumeClaim, githubReality, severity: 'minor'|'significant' }[]
- missingStrongProjects: { repoName, whyItShouldBeOnResume }[]
- overallConsistencyNote: 1-2 sentences`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: consistencyCheckPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overclaimFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  resumeClaim: { type: Type.STRING },
                  githubReality: { type: Type.STRING },
                  severity: { type: Type.STRING },
                },
              },
            },
            missingStrongProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  repoName: { type: Type.STRING },
                  whyItShouldBeOnResume: { type: Type.STRING },
                },
              },
            },
            overallConsistencyNote: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      overclaimFlags: Array.isArray(parsed.overclaimFlags) ? parsed.overclaimFlags : fallback.overclaimFlags,
      missingStrongProjects: Array.isArray(parsed.missingStrongProjects) ? parsed.missingStrongProjects : fallback.missingStrongProjects,
      overallConsistencyNote: parsed.overallConsistencyNote || fallback.overallConsistencyNote,
    };
  } catch (err) {
    console.warn("Consistency check fallback:", err);
    return fallback;
  }
}

// 4. Distinct GitHub Project Build Roadmap Generator
export async function generateGithubRoadmap(
  job: JobInput,
  githubFitAnalysis: any,
  aiClient?: any
): Promise<RecommendedProject[]> {
  const fallbackProjects: RecommendedProject[] = [
    {
      id: "rec-1",
      title: "Roadmap generation unavailable",
      addressesGap: "AI service could not be reached — please retry.",
      problemStatement: "Automated roadmap generation failed.",
      techStack: [],
      estimatedBuildTime: "Unknown",
      milestones: [],
    },
  ];

  try {
    let ai = aiClient;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || "MISSING_KEY";
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }

    const githubRoadmapPrompt = `Generate a dedicated hands-on GitHub Project Build Roadmap for a student to close code and engineering maturity gaps.

Target Job: ${JSON.stringify(job || {})}
GitHub Fit Analysis: ${JSON.stringify(githubFitAnalysis || {})}

Generate 2-3 hands-on software project recommendations to close repository code & engineering maturity gaps (tests, CI/CD, microservices, async processing) — base these on the ACTUAL gaps found in the fit analysis above, not generic suggestions.

For each project:
- title: project title
- addressesGap: which specific gap this fixes
- problemStatement: problem statement
- milestones: ordered, concrete build steps ({ stepNumber, title, description })
- techStack: string array
- estimatedBuildTime: string`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: githubRoadmapPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  addressesGap: { type: Type.STRING },
                  problemStatement: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedBuildTime: { type: Type.STRING },
                  milestones: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (Array.isArray(parsed.recommendedProjects) && parsed.recommendedProjects.length > 0) {
      return parsed.recommendedProjects;
    }
    return fallbackProjects;
  } catch (err) {
    console.warn("GitHub roadmap generation fallback:", err);
    return fallbackProjects;
  }
}

// 5. Distinct Resume Skill & Career Mastery Roadmap Generator
// FIX #5: no longer asks the model to invent resource URLs (hallucination risk). Returns a topic
// name instead; map to a small set of verified, hardcoded doc URLs where possible.
const VERIFIED_RESOURCE_LINKS: Record<string, string> = {
  "fastapi": "https://fastapi.tiangolo.com/",
  "react": "https://react.dev",
  "typescript": "https://www.typescriptlang.org/docs/",
  "docker": "https://docs.docker.com/",
  "redis": "https://redis.io/docs/latest/",
  "kubernetes": "https://kubernetes.io/docs/home/",
  "postgresql": "https://www.postgresql.org/docs/",
  "kafka": "https://kafka.apache.org/documentation/",
};

function resolveVerifiedLink(topic: string): string | null {
  const key = Object.keys(VERIFIED_RESOURCE_LINKS).find((k) => topic.toLowerCase().includes(k));
  return key ? VERIFIED_RESOURCE_LINKS[key] : null;
}

export async function generateResumeRoadmap(
  job: JobInput,
  gapAnalysis: any,
  consistencyCheck: any,
  aiClient?: any
): Promise<any[]> {
  const fallbackResumeRoadmap = [
    {
      stepNumber: 1,
      topic: "Resume roadmap generation unavailable",
      problemIdentified: "AI service could not be reached — please retry.",
      actionPlan: "Retry the analysis once the service is available.",
      recommendedResourceTopic: null,
      recommendedResourceUrl: null,
    },
  ];

  try {
    let ai = aiClient;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || "MISSING_KEY";
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }

    const resumeRoadmapPrompt = `Generate a dedicated Resume & Skill Mastery Roadmap for a candidate applying to "${job?.title || "Software Engineer"}" at "${job?.company || "Target Company"}".

Resume Gap Analysis: ${JSON.stringify(gapAnalysis || {})}
Consistency Check: ${JSON.stringify(consistencyCheck || {})}
Target Job: ${JSON.stringify(job || {})}

Provide a structured 4-step Resume & Career Action Roadmap addressing:
1. ATS Phrasing & Keyword Alignment: exact terms to rephrase on resume.
2. Quantified Impact & Bullet Point Rewrites: how to rewrite vague duty listings into metric-driven bullets.
3. Core Technical Concepts to Master: specific skills to study (name the technology/topic only — do NOT invent a URL).
4. Resume/GitHub Consistency Action: free resume wins (adding missing GitHub repos or fixing overclaim risks).

For each step, provide:
- stepNumber: number
- topic: string
- problemIdentified: string
- actionPlan: string
- recommendedResourceTopic: string — the name of the technology/concept to study (e.g., "FastAPI dependency injection"), NOT a URL`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: resumeRoadmapPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumeRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  topic: { type: Type.STRING },
                  problemIdentified: { type: Type.STRING },
                  actionPlan: { type: Type.STRING },
                  recommendedResourceTopic: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (Array.isArray(parsed.resumeRoadmap) && parsed.resumeRoadmap.length > 0) {
      // FIX #5: attach a verified URL only if we have one on file; otherwise null (frontend should
      // render "search official docs for {topic}" rather than a possibly-broken link)
      return parsed.resumeRoadmap.map((step: any) => ({
        ...step,
        recommendedResourceUrl: resolveVerifiedLink(step.recommendedResourceTopic || ""),
      }));
    }
    return fallbackResumeRoadmap;
  } catch (err) {
    console.warn("Resume roadmap generation fallback:", err);
    return fallbackResumeRoadmap;
  }
}
