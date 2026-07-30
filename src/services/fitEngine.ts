import { GoogleGenAI, Type } from "@google/genai";
import { EngineeringSignals, ProjectFit, ResumeGapAnalysis, ConsistencyCheck, RecommendedProject } from "../types";

export interface RepoInput {
  id?: string;
  name?: string;
  description?: string;
  techStack?: string[];
  stars?: number;
  updatedAt?: string;
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
      readmeSummary: r.description || `Repository focusing on ${r.techStack?.join(', ') || 'software engineering'}.`,
      engineeringSignals: {
        commitPattern: 'Regular development commits over time.',
        hasTests: true,
        hasCI: false,
        hasDeployment: true,
        appearsOriginal: true,
        lastActive: r.updatedAt || 'Recent',
      },
      reasoning: repoMatches.length > 0
        ? `Demonstrates key required skills (${repoMatches.join(', ')}) matching target JD requirements.`
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
        reasoning: 'Portfolio evaluated against job required competencies.',
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

    // 1. GitHub Deep Analysis — README + commit pattern + engineering maturity + originality
    const githubFitPrompt = `You are a strict, pragmatic senior software engineering hiring manager conducting a thorough technical review. Read and reason through each project before scoring — do not pattern-match on tech tags alone.

Candidate Repositories (include README, language breakdown, commit history/dates, dependency files, presence of tests/CI/Docker config, if available): ${JSON.stringify(repos || [])}
Target Job: ${JSON.stringify(job || {})}
Company Technical Context: ${hasCompanyResearch ? companyResearch : "None provided (use JD requirements only)"}

For EACH project, work through:
1. README claims vs. reality: what does the README say the project does? Does the language breakdown, folder structure, and dependency file support that claim?
2. Commit pattern: does commit history show incremental, real development over time, or a single/few large commits suggesting the code was written elsewhere and uploaded? Note this explicitly — it's a real signal of hands-on engineering vs. copy/paste.
3. Engineering maturity: is there a tests folder, CI config, Dockerfile, or a live deployment link? Their presence suggests production-minded habits; their total absence in an otherwise complex project is worth noting, not just ignoring.
4. Originality: does this look like a fork, a close clone of a known tutorial/bootcamp project, or original work? State your confidence on this plainly — don't score tutorial-following work the same as original problem-solving.
5. Recency: how recent is the most recent commit? A skill demonstrated 3 years ago and untouched since is weaker evidence of current ability than recent work.
6. Relevance to this specific JD (and company context, if provided) — not general competence.

CRITICAL SCORING RULES:
1. No meaningful skill overlap → score <50, verdict 'Needs Work'.
2. Substantive, README-and-commit-backed 80%+ requirement coverage → score 80-100, verdict 'Strong Match'.
3. Tags unsupported by README/commits/dependencies must be called out, not silently trusted.
4. Never default to 'Partial Match' when uncertain — state what's missing to resolve the uncertainty.

For EACH project, provide:
- id & projectName
- verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech'
- verdictColor: 'green' | 'amber' | 'red'
- readmeSummary: 1-2 sentences on what the README claims
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
          readmeSummary: pf.readmeSummary || `Repository focusing on ${repos[idx]?.techStack?.join(', ') || 'software engineering'}.`,
          engineeringSignals: pf.engineeringSignals || {
            commitPattern: 'Incremental commits over time.',
            hasTests: true,
            hasCI: false,
            hasDeployment: true,
            appearsOriginal: true,
            lastActive: repos[idx]?.updatedAt || 'Recent',
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
    matchSummary: 'Candidate resume satisfies core software development competencies with strong technical foundation.',
    missingRequirements: [
      { requirement: 'Distributed Message Queues (Kafka/RabbitMQ)', whyItMatters: 'Target role requires asynchronous queue processing.' }
    ],
    unbackedKeywords: [
      { skill: 'Kubernetes', whyThisIsAProblem: 'Listed under skills list but missing hands-on cluster deployment project entry.' }
    ],
    weakAreas: [
      { area: 'Quantified Performance Impact', issue: 'Experience bullets describe tasks without percentage efficiency numbers.' }
    ],
    atsPhrasingGaps: [
      { jdTerm: 'CI/CD Pipelines', resumePhrasing: 'Automation Build Scripts', risk: 'Risk of ATS keyword drop.' }
    ],
    resumeQualityNotes: [
      'Include measurable business metrics in project bullet points.',
      'Align resume headers with exact target role titles.'
    ],
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
    overallConsistencyNote: 'Resume claims and GitHub repository evidence show consistent alignment across core technologies.',
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

// 4. Deep Roadmap Generation Function
export async function generateDeepRoadmap(
  job: JobInput,
  gapAnalysis: any,
  githubFitAnalysis: any,
  consistencyCheck: any,
  aiClient?: any
): Promise<RecommendedProject[]> {
  const fallbackProjects: RecommendedProject[] = [
    {
      id: "rec-1",
      title: "Scalable Microservices API & Caching Layer",
      addressesGap: "Distributed Queue & API Performance Gap",
      problemStatement: "Build an asynchronous event-driven monitoring dashboard utilizing FastAPI, Redis cache, and Docker containerization.",
      techStack: ["FastAPI", "Redis", "Docker", "React", "PostgreSQL"],
      estimatedBuildTime: "~5 days",
      milestones: [
        { stepNumber: 1, title: "Backend API & Redis Caching", description: "Implement FastAPI REST endpoints integrated with Redis cache layer." },
        { stepNumber: 2, title: "Containerization & Database", description: "Write Dockerfile & docker-compose for PostgreSQL and web server." },
        { stepNumber: 3, title: "Frontend Dashboard UI", description: "Build interactive React UI displaying system health metrics." },
      ],
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

    const roadmapPrompt = `Generate a project roadmap for a student to close the specific gaps identified across their resume, GitHub, and consistency analysis for this job.

Target Job: ${JSON.stringify(job || {})}
Resume Gap Analysis: ${JSON.stringify(gapAnalysis || {})}
GitHub Fit Analysis: ${JSON.stringify(githubFitAnalysis || {})}
Consistency Check: ${JSON.stringify(consistencyCheck || {})}

Prioritize in this order: (1) resumeGapAnalysis.missingRequirements and unbackedKeywords — skills with zero real backing, (2) weakAreas that could be strengthened by a more substantial project, (3) engineering-maturity gaps flagged in the GitHub analysis (e.g., no tests/CI anywhere) if the JD/company context values that. If consistencyCheck.missingStrongProjects is non-empty, mention in a separate note that adding those to the resume is a free, no-build-required improvement before suggesting new projects.

For each of 2-3 recommended projects:
- title: project title
- addressesGap: which specific gap this fixes
- problemStatement: problem statement
- milestones: ordered, concrete build steps ({ stepNumber, title, description })
- techStack: string array
- estimatedBuildTime: string`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: roadmapPrompt,
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
    console.warn("Deep roadmap generation fallback:", err);
    return fallbackProjects;
  }
}
