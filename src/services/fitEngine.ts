import { GoogleGenAI, Type } from "@google/genai";

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

export interface ProjectFit {
  id: string;
  projectName: string;
  verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech';
  verdictColor: 'green' | 'amber' | 'red';
  reasoning: string;
}

export interface FitEngineResult {
  overallScore: number;
  verdict: 'Strong Match' | 'Partial Match' | 'Needs Work';
  projectFits: ProjectFit[];
  informedByCompanyResearch: boolean;
  disclaimer: string;
}

export interface EvaluateFitParams {
  repos: RepoInput[];
  job: JobInput;
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
  const { repos, job, companyResearch, aiClient } = params;
  
  const hasCompanyResearch = Boolean(companyResearch && companyResearch.trim().length > 0);
  const fallbackResult = computeHeuristicFit(repos, job, hasCompanyResearch);

  try {
    // If a mock or custom aiClient is passed, use it. Otherwise create default client.
    let ai = aiClient;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || "MISSING_KEY";
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }

    const prompt = `You are a strict, pragmatic software engineering hiring assistant.
    Compare the candidate's GitHub projects against the job description requirements and company technical context.
    
    Candidate Repositories: ${JSON.stringify(repos || [])}
    Target Job: ${JSON.stringify(job || {})}
    Company Technical Context: ${hasCompanyResearch ? companyResearch : "None provided (use JD requirements only)"}
    Company Research Provided: ${hasCompanyResearch}
    
    CRITICAL SCORING RULES:
    1. If candidate projects have NO skill overlap with required skills (e.g. frontend React projects vs deep ML/PyTorch JD), overall score MUST be low (<50) and verdict MUST be 'Needs Work'.
    2. If candidate projects directly demonstrate 80%+ of required skills, overall score SHOULD be high (80-100) and verdict 'Strong Match'.
    3. For EACH project, provide:
       - id & projectName
       - verdict: 'Direct Match' | 'Partial Match' | 'Weak Match' | 'Missing Tech'
       - verdictColor: 'green' (for Direct Match), 'amber' (for Partial Match), 'red' (for Weak Match / Missing Tech)
       - reasoning: 1-2 plain-language sentences. Explicitly mention whether company research or JD alone informed this verdict.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
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
                  reasoning: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    // Validate structural integrity of response
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
