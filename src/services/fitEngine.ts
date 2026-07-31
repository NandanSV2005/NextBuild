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
  githubScore: number;
  resumeAtsScore: number;
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  githubVerdict?: 'Strong Match' | 'Partial Match' | 'Needs Work';
  resumeVerdict?: 'Strong Match' | 'Partial Match' | 'Needs Work';
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

  const githubScore = Math.round(Math.min(95, Math.max(35, matchRatio * 100)));
  const resumeAtsScore = Math.max(30, Math.min(95, githubScore - 6));
  const overallScore = Math.round((githubScore + resumeAtsScore) / 2);

  const getVerdict = (s: number): 'Strong Match' | 'Partial Match' | 'Needs Work' =>
    s >= 80 ? 'Strong Match' : s >= 60 ? 'Partial Match' : 'Needs Work';

  const verdict = getVerdict(overallScore);
  const githubVerdict = getVerdict(githubScore);
  const resumeVerdict = getVerdict(resumeAtsScore);

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
    overallScore,
    githubScore,
    resumeAtsScore,
    verdict,
    githubVerdict,
    resumeVerdict,
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

    const repoNamesList = (repos || []).map((r) => r.name).filter(Boolean);

    const githubFitPrompt = `You are a strict, pragmatic senior software engineering hiring manager conducting a thorough technical review of a candidate's GitHub portfolio.

CRITICAL REQUIREMENT: The candidate provided exactly ${repos.length} repositories with the following EXACT names:
${JSON.stringify(repoNamesList)}
You MUST evaluate and return a ProjectFit entry for EVERY SINGLE ONE of these ${repos.length} repositories in the exact order listed above.
Do NOT invent repository names. Use the EXACT "name" provided for each project.

Candidate Repositories Data (includes real fetched evidence: readmeContent, recent commits, hasTests, hasCI, hasDocker, dependencyFile — null/empty means genuinely not found, do not guess):
${JSON.stringify(repos || [])}
Target Job Posting: ${JSON.stringify(job || {})}
Company Technical Context: ${hasCompanyResearch ? companyResearch : "None provided (use JD requirements only)"}

For EACH repository (all ${repos.length} of them), evaluate:
1. README claims vs reality: if readmeContent is present, what does it say the project does? If null, state "No README found" — do not infer purpose from the repo name.
2. Commit pattern: examine the commits array. Does it show incremental development over time or a single/few large commits suggesting a code dump? If commits is empty, state that commit history could not be analyzed.
3. Engineering maturity: use the real hasTests, hasCI, hasDocker fields directly.
4. Originality & recency: evaluate freshness and whether the repo appears original or a clone — state "cannot determine" if evidence is insufficient.
5. Relevance to the target job requirements specifically, not general competence.

CRITICAL SCORING RULES:
1. No meaningful skill overlap → verdict 'Weak Match' or 'Missing Tech'.
2. Substantive, README-and-commit-backed 80%+ requirement coverage → verdict 'Direct Match'.
3. Never default to 'Partial Match' when uncertain — state what's missing to resolve it.
4. Always cite specific evidence in reasoning — do not fabricate confidence when evidence (README, commits) is absent.

For EACH project, provide:
- id & projectName (must match exact candidate repo name)
- verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech'
- verdictColor: 'green' | 'amber' | 'red'
- readmeSummary: 1-2 sentences on what the README actually says, or "No README found" if null
- engineeringSignals: { commitPattern: string, hasTests: boolean, hasCI: boolean, hasDeployment: boolean, appearsOriginal: boolean, lastActive: string }
- reasoning: 3-5 sentences citing specific evidence, stating whether tech tags were backed up

Also provide:
- githubScore: 0-100 — this score MUST be based ONLY on the GitHub evidence above (code quality, commit history, tests/CI, README-backed relevance to the job). Do NOT attempt to factor in resume content, ATS keywords, or seniority — you have not been given the candidate's resume and must not guess at it.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: githubFitPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            githubScore: { type: Type.NUMBER },
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

    const rawGhScore = typeof parsed.githubScore === 'number'
      ? Math.min(100, Math.max(0, parsed.githubScore))
      : (typeof parsed.overallScore === 'number' ? Math.min(100, Math.max(0, parsed.overallScore)) : 78);

    const getV = (s: number): 'Strong Match' | 'Partial Match' | 'Needs Work' =>
      s >= 80 ? 'Strong Match' : s >= 60 ? 'Partial Match' : 'Needs Work';

    // Map 1-to-1 against candidate's actual input repositories using exact repo names
    const mappedFits: ProjectFit[] = (repos && repos.length > 0)
      ? repos.map((r, idx) => {
          // Strictly match by candidate's actual repo name (do NOT fall back to arbitrary index items with wrong names)
          const pf = Array.isArray(parsed.projectFits)
            ? parsed.projectFits.find((p: any) => p.projectName?.toLowerCase() === r.name?.toLowerCase() || p.id === r.id || p.id === `repo-${idx}`)
            : null;

          const verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech' =
            pf && ['Direct Match', 'Partial Match', 'Weak Match', 'Missing Tech'].includes(pf.verdict)
              ? pf.verdict
              : 'Partial Match';

          const verdictColor: 'green' | 'amber' | 'red' =
            pf && ['green', 'amber', 'red'].includes(pf.verdictColor)
              ? pf.verdictColor
              : (verdict === 'Direct Match' ? 'green' : verdict === 'Weak Match' || verdict === 'Missing Tech' ? 'red' : 'amber');

          return {
            id: r.id || `repo-${idx}`,
            projectName: r.name, // ALWAYS force exact candidate GitHub repository name
            verdict,
            verdictColor,
            readmeSummary: pf?.readmeSummary || (r.readmeContent ? `Repository focusing on ${(r.techStack || []).join(', ') || 'software engineering'}.` : 'No README found for this repository.'),
            engineeringSignals: pf?.engineeringSignals || {
              commitPattern: r.commits && r.commits.length > 0 ? 'Incremental commits' : 'Not determined',
              hasTests: typeof r.hasTests === 'boolean' ? r.hasTests : null,
              hasCI: typeof r.hasCI === 'boolean' ? r.hasCI : null,
              hasDeployment: null,
              appearsOriginal: null,
              lastActive: r.updatedAt || 'Unknown',
            },
            reasoning: pf?.reasoning && !pf.reasoning.includes('Apex Cloud') && !pf.reasoning.includes('ecommerce')
              ? pf.reasoning
              : `Repository "${r.name}" (${(r.techStack || []).join(', ') || 'Code'}) evaluated against target job requirements for ${job.title || 'software engineering role'}.`,
          };
        })
      : fallbackResult.projectFits;

    return {
      overallScore: rawGhScore,
      githubScore: rawGhScore,
      resumeAtsScore: Math.max(30, Math.min(100, rawGhScore - 6)),
      verdict: getV(rawGhScore),
      githubVerdict: getV(rawGhScore),
      resumeVerdict: getV(rawGhScore - 6),
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
export async function checkResumeGithubConsistency(
  resumeData: any,
  githubFitAnalysis: any,
  repos: RepoInput[] = [],
  aiClient?: any
): Promise<ConsistencyCheck> {
  const fallback: ConsistencyCheck = {
    overclaimFlags: [],
    missingStrongProjects: [],
    dateInconsistencies: [],
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

    const repoDateEvidence = (repos || []).map((r) => ({
      name: r.name,
      firstCommitDate: r.commits && r.commits.length > 0 ? r.commits[r.commits.length - 1].date : null,
      lastCommitDate: r.commits && r.commits.length > 0 ? r.commits[0].date : null,
      commitCount: r.commits?.length || 0,
    }));

    const consistencyCheckPrompt = `Cross-check the candidate's resume claims against their actual GitHub evidence. Your job is to catch embellishment and surface strong work that's missing from the resume.

Candidate Resume: ${JSON.stringify(resumeData || {})}
GitHub Fit Analysis (prose-level project evaluation): ${JSON.stringify(githubFitAnalysis || {})}
GitHub Repo Date Evidence (real commit dates, use THIS for date comparisons, not the prose above): ${JSON.stringify(repoDateEvidence)}

Check:
1. Overclaiming: does the resume describe a project (scale, architecture, impact) in a way the actual GitHub repo doesn't support? (e.g., resume says "scalable microservices architecture," repo is a single-file monolith)
2. Missing wins: does GitHub show a strong, relevant project that ISN'T mentioned on the resume at all? This is a free improvement the student should make.
3. Date consistency: compare each resume project's approxDate (and any experienceEntries dates) against that repo's firstCommitDate/lastCommitDate in the Repo Date Evidence above. Flag any project where the resume claims a timeframe that doesn't align with when the repo was actually active (e.g., resume says "built in 2024" but the repo's commits are all from 2022). If a repo has no commit data (commitCount: 0), state that date comparison wasn't possible for that one rather than guessing.

Produce:
- overclaimFlags: { resumeClaim, githubReality, severity: 'minor'|'significant' }[]
- missingStrongProjects: { repoName, whyItShouldBeOnResume }[]
- dateInconsistencies: { projectName, resumeClaimedDate, githubActualDateRange, severity: 'minor'|'significant' }[]
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
            dateInconsistencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectName: { type: Type.STRING },
                  resumeClaimedDate: { type: Type.STRING },
                  githubActualDateRange: { type: Type.STRING },
                  severity: { type: Type.STRING },
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
      dateInconsistencies: Array.isArray(parsed.dateInconsistencies) ? parsed.dateInconsistencies : [],
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

// -----------------------------------------------------------------------------
// NEW: combineScores — computes the real composite score in code, using BOTH
// the GitHub score (from evaluateFit) and the resume gap analysis (from evaluateResumeDeep).
// -----------------------------------------------------------------------------
export function combineScores(
  githubScore: number,
  resumeGapAnalysis?: ResumeGapAnalysis
): {
  githubScore: number;
  resumeAtsScore: number;
  overallScore: number;
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  githubVerdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  resumeVerdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
} {
  const missingReqs = Array.isArray(resumeGapAnalysis?.missingRequirements)
    ? resumeGapAnalysis.missingRequirements.length
    : 1;
  const unbackedKw = Array.isArray(resumeGapAnalysis?.unbackedKeywords)
    ? resumeGapAnalysis.unbackedKeywords.length
    : 1;
  const weakAreas = Array.isArray(resumeGapAnalysis?.weakAreas)
    ? resumeGapAnalysis.weakAreas.length
    : 1;

  const penalty = missingReqs * 12 + unbackedKw * 8 + weakAreas * 4;
  const resumeAtsScore = Math.max(0, Math.min(100, 100 - penalty));

  const overallScore = Math.round(githubScore * 0.6 + resumeAtsScore * 0.4);

  const getV = (s: number): 'Strong Match' | 'Partial Match' | 'Needs Work' =>
    s >= 80 ? 'Strong Match' : s >= 60 ? 'Partial Match' : 'Needs Work';

  return {
    githubScore,
    resumeAtsScore,
    overallScore,
    verdict: getV(overallScore),
    githubVerdict: getV(githubScore),
    resumeVerdict: getV(resumeAtsScore),
  };
}
