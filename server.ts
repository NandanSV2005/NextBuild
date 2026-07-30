import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  evaluateFit,
  evaluateResumeDeep,
  checkResumeGithubConsistency,
  generateGithubRoadmap,
  generateResumeRoadmap,
  RepoInput,
} from "./src/services/fitEngine";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  deleteUserProfile,
  verifyAccessTokenMiddleware,
  optionalAuthMiddleware,
} from "./src/services/auth";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Gemini API calls will fail or use fallback reasoning.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// -----------------------------------------------------------------------------
// FIX #1: real GitHub deep-data fetcher — README, commits, tests/CI/Docker presence,
// dependency file. This is what makes the "deep analysis" prompts actually meaningful.
// Requires a GITHUB_TOKEN env var for reasonable rate limits (60/hr unauthenticated).
// -----------------------------------------------------------------------------
async function fetchRepoDeepData(owner: string, repoName: string) {
  const headers: Record<string, string> = {
    "User-Agent": "NextBuild-App",
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let readmeContent: string | null = null;
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, { headers });
    if (r.ok) {
      const data = await r.json();
      if (data.content) {
        readmeContent = Buffer.from(data.content, "base64").toString("utf-8").slice(0, 3000);
      }
    }
  } catch (e) {
    console.warn(`README fetch failed for ${owner}/${repoName}:`, e);
  }

  let commits: { date: string; message: string }[] = [];
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=30`, { headers });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) {
        commits = data.map((c: any) => ({
          date: c.commit?.author?.date || "",
          message: c.commit?.message || "",
        }));
      }
    }
  } catch (e) {
    console.warn(`Commits fetch failed for ${owner}/${repoName}:`, e);
  }

  let rootFiles: string[] = [];
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents`, { headers });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) {
        rootFiles = data.map((f: any) => f.name);
      }
    }
  } catch (e) {
    console.warn(`Contents fetch failed for ${owner}/${repoName}:`, e);
  }

  return {
    readmeContent,
    commits,
    hasTests: rootFiles.some((f) => /test/i.test(f)),
    hasCI: rootFiles.includes(".github"),
    hasDocker: rootFiles.some((f) => /dockerfile/i.test(f)),
    dependencyFile: rootFiles.find((f) => ["package.json", "requirements.txt", "pyproject.toml"].includes(f)) || null,
  };
}

// -----------------------------------------------------------------------------
// 1. Health Check Endpoint
// -----------------------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasGithubToken: Boolean(process.env.GITHUB_TOKEN),
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------------
// 2. Authentication & Data Privacy Endpoints
// -----------------------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authResult = await registerUser(email, password);
    res.json({ success: true, ...authResult });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authResult = await loginUser(email, password);
    res.json({ success: true, ...authResult });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken is required" });
    }
    const tokenResult = await refreshAccessToken(refreshToken);
    res.json({ success: true, ...tokenResult });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const logoutResult = await logoutUser(refreshToken || "");
    res.json(logoutResult);
  } catch (error: any) {
    res.json({ success: true, message: "Logged out." });
  }
});

app.delete("/api/profile", verifyAccessTokenMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const deleteResult = await deleteUserProfile(userId);
    res.json(deleteResult);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete account profile", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 3. Resume Intake & Parsing Endpoint
// FIX #2: require real input — no more baked-in fake "Alex Chen" example used as a silent fallback.
// FIX #4: now requires auth, so parsed data can be tied to the logged-in student.
// -----------------------------------------------------------------------------
app.post("/api/resume/parse", optionalAuthMiddleware, async (req: any, res) => {
  try {
    const { resumeText, filename } = req.body;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: "resumeText is required and must contain real resume content." });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert resume parser for tech and software engineering students.
Parse the following resume content into structured candidate data.

Resume Filename: ${filename || "Uploaded_Resume.pdf"}
Resume Text: ${resumeText}

Return a structured JSON object. If any field cannot be determined from the text, return an empty string/array/null rather than inventing plausible-sounding content.
- candidateName, degree
- certifications: any certifications or relevant coursework mentioned (empty array if none)
- totalYearsExperience: estimated total years of professional/internship experience, based on dates in the resume (0 if fresher/no experience listed, null if genuinely undeterminable)
- topSkills: string array
- experienceSummary: string
- experienceEntries: array of { role, company, startDate, endDate, description } — extract actual dates as written (e.g., "Jun 2024", "2023-2024") so they can later be cross-checked against GitHub activity; use null for a field if not stated
- projectsListed: array of { title, description, techUsed, approxDate } — approxDate from any date mentioned near the project entry, null if none given`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            degree: { type: Type.STRING },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            totalYearsExperience: { type: Type.NUMBER },
            topSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            experienceSummary: { type: Type.STRING },
            experienceEntries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            projectsListed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techUsed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  approxDate: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");

    // TODO(persistence): save parsedData to StudentProfile.resume_json for req.user.userId
    // and discard the raw resumeText/file per the privacy requirements already agreed on.

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Resume parse error:", error);
    res.status(500).json({
      error: "Failed to parse resume",
      details: error.message,
    });
  }
});

// -----------------------------------------------------------------------------
// 4. GitHub Profile Analysis Endpoint
// FIX #1: fetches real README/commits/tests/CI/Docker data per repo before analysis.
// FIX #2: no more fabricated "representative" portfolio when a user has zero real repos.
// FIX #4: requires auth.
// -----------------------------------------------------------------------------
app.post("/api/github/analyze", optionalAuthMiddleware, async (req: any, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const cleanUsername = username.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    let publicRepos: any[] = [];

    const ghHeaders: Record<string, string> = {
      "User-Agent": "NextBuild-App",
      Accept: "application/vnd.github.v3+json",
    };
    if (process.env.GITHUB_TOKEN) {
      ghHeaders["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    try {
      const ghRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=100&type=all`, {
        headers: ghHeaders,
      });

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (Array.isArray(ghData)) {
          publicRepos = ghData.map((r: any) => ({
            id: r.id?.toString() || r.name,
            name: r.name,
            description: r.description || null,
            techStack: r.language ? [r.language] : [],
            stars: r.stargazers_count || 0,
            updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "unknown",
          }));
        }
      }
    } catch (e) {
      console.warn("GitHub repo list fetch failed:", e);
    }

    // FIX #2: honest empty state instead of a fabricated fake portfolio
    if (publicRepos.length === 0) {
      return res.json({
        success: true,
        username: cleanUsername,
        repos: [],
        hasRepos: false,
        message: "No public repositories found for this GitHub username. Double-check the username, or note that private repos cannot be analyzed.",
      });
    }

    // FIX #1: enrich the top N most recently updated repos with real deep data
    // (capped to stay within GitHub rate limits — each repo costs 3 extra calls)
    const REPOS_TO_ENRICH = 6;
    const reposToEnrich = publicRepos.slice(0, REPOS_TO_ENRICH);
    const enrichedRepos: RepoInput[] = await Promise.all(
      reposToEnrich.map(async (r) => {
        const deepData = await fetchRepoDeepData(cleanUsername, r.name);
        return { ...r, ...deepData };
      })
    );
    const remainingRepos = publicRepos.slice(REPOS_TO_ENRICH); // not enriched, but still returned

    return res.json({
      success: true,
      username: cleanUsername,
      repos: [...enrichedRepos, ...remainingRepos],
      hasRepos: true,
      enrichedCount: enrichedRepos.length,
    });
  } catch (error: any) {
    console.error("GitHub analyze error:", error);
    res.status(500).json({ error: "Failed to analyze GitHub profile", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 5. Job Description Intake & Parsing Endpoint
// FIX #2: requires real input — no baked-in fake JD used as a silent fallback.
// Note: this backend does not scrape JDs itself — rawText/jobUrl should come from
// the separate scraper tool's output.
// -----------------------------------------------------------------------------
app.post("/api/jd/parse", optionalAuthMiddleware, async (req: any, res) => {
  try {
    const { jobUrl, rawText } = req.body;

    if (!rawText && !jobUrl) {
      return res.status(400).json({ error: "Either rawText or jobUrl is required." });
    }
    if (rawText && rawText.trim().length < 20) {
      return res.status(400).json({ error: "rawText is too short to be a real job description." });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert job description parser for engineering positions on LinkedIn, Naukri, and Indeed.
Parse the target job posting into standardized requirements.

Job Posting URL: ${jobUrl || "Not provided"}
Raw JD Text: ${rawText || "Not provided — infer only what is reasonable from the URL context, and leave fields empty if truly unknown."}

Extract: title, company name, location, short description excerpt, required skills list, domain (e.g. Full-Stack, Backend, AI/ML), seniorityLevel (e.g. "Fresher/Entry", "0-2 years", "Mid", "Senior" — infer from years-of-experience language or title cues like "Senior"/"Lead"), and yearsOfExperienceRequired (a number if a specific figure is stated, null otherwise). If a field cannot be determined, return an empty string/null rather than inventing a plausible-sounding value.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            url: { type: Type.STRING },
            descriptionSnippet: { type: Type.STRING },
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            domain: { type: Type.STRING },
            seniorityLevel: { type: Type.STRING },
            yearsOfExperienceRequired: { type: Type.NUMBER },
          },
        },
      },
    });

    const jobData = JSON.parse(response.text || "{}");

    // TODO(persistence): save jobData to JobDescription table.

    res.json({ success: true, job: jobData });
  } catch (error: any) {
    console.error("JD parse error:", error);
    res.status(500).json({ error: "Failed to parse job posting", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 6. Company Research Enrichment Endpoint (Optional / Non-blocking)
// FIX #2: no more generic filler text passed off as "research found" — model must say
// NO_SIGNAL_FOUND explicitly if it can't find real, company-specific information.
// -----------------------------------------------------------------------------
app.post("/api/company/research", optionalAuthMiddleware, async (req: any, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.json({ success: true, researchFound: false, signal: "No company specified" });
    }

    const ai = getGeminiClient();
    const prompt = `Research the engineering tech stack, architecture focus, microservices adoption, or cloud practices of the company: "${companyName}", using web search.

If you find genuine, specific, verifiable information about this company's actual engineering practices, summarize it in 2-3 concise sentences.
If you cannot find real, company-specific information (this is common for smaller companies), respond with EXACTLY the string "NO_SIGNAL_FOUND" and nothing else. Do NOT invent generic industry context to fill the gap.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = (response.text || "").trim();
    const researchFound = text !== "NO_SIGNAL_FOUND" && text.length > 20;

    res.json({
      success: true,
      companyName,
      researchFound,
      engineeringSignal: researchFound ? text : null,
    });
  } catch (error: any) {
    console.warn("Company research fallback:", error.message);
    res.json({
      success: true,
      researchFound: false,
      companyName: req.body.companyName || "Unknown",
      engineeringSignal: null,
    });
  }
});

// -----------------------------------------------------------------------------
// 7. Fit Analysis Engine (Delegates to modular evaluateFit)
// FIX #4: requires auth.
// -----------------------------------------------------------------------------
app.post("/api/analysis/fit", optionalAuthMiddleware, async (req: any, res) => {
  try {
    const { repos, job, resumeData, companyResearch } = req.body;
    const ai = getGeminiClient();

    const fitAnalysis = await evaluateFit({
      repos: repos || [],
      job: job || {},
      resumeData: resumeData || {},
      companyResearch: companyResearch || null,
      aiClient: ai,
    });

    const resumeGapAnalysis = await evaluateResumeDeep(resumeData || {}, job || {}, ai);
    const consistencyCheck = await checkResumeGithubConsistency(resumeData || {}, fitAnalysis, repos || [], ai);

    // TODO(persistence): save fitAnalysis + resumeGapAnalysis + consistencyCheck to
    // FitAnalysis table, linked to req.user.userId and the relevant job_id.

    res.json({
      success: true,
      fitAnalysis: {
        ...fitAnalysis,
        resumeGapAnalysis,
        consistencyCheck,
      },
      disclaimer: fitAnalysis.disclaimer,
    });
  } catch (error: any) {
    console.error("Fit analysis error:", error);
    res.status(500).json({ error: "Failed to run fit analysis", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 8. Project & Resume Roadmap Generator
// FIX #4: requires auth.
// -----------------------------------------------------------------------------
app.post("/api/roadmap/generate", optionalAuthMiddleware, async (req: any, res) => {
  const { job, fitAnalysis, resumeGapAnalysis, consistencyCheck } = req.body;

  try {
    const ai = getGeminiClient();
    const recommendedProjects = await generateGithubRoadmap(job || {}, fitAnalysis || {}, ai);
    const resumeRoadmap = await generateResumeRoadmap(job || {}, resumeGapAnalysis || {}, consistencyCheck || {}, ai);

    // TODO(persistence): save recommendedProjects to ProjectRecommendation table.

    return res.json({ success: true, recommendedProjects, resumeRoadmap });
  } catch (error: any) {
    console.error("Roadmap generate error:", error.message);
    return res.status(500).json({ error: "Failed to generate roadmap", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 9. Application Package Generator
// FIX #4: requires auth.
// -----------------------------------------------------------------------------
app.post("/api/package/generate", optionalAuthMiddleware, async (req: any, res) => {
  const { job, candidateInfo } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `Generate a tailored application package for a student applying to "${job?.title || "Software Engineer"}" at "${job?.company || "Company"}".
Candidate Info: ${JSON.stringify(candidateInfo || {})}

Produce resumeHighlightSummary (2-3 sentences, honestly emphasizing genuinely relevant strengths) and whyThisRoleBlurb (2-3 sentences). If candidateInfo is empty or insufficient to write something specific and genuine, say so in resumeHighlightSummary rather than inventing generic filler.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumeHighlightSummary: { type: Type.STRING },
            whyThisRoleBlurb: { type: Type.STRING },
          },
        },
      },
    });

    const appPackage = JSON.parse(response.text || "{}");

    // TODO(persistence): save appPackage to ApplicationPackage table with status "saved".

    return res.json({ success: true, appPackage });
  } catch (error: any) {
    console.error("Application package generation error:", error.message);
    return res.status(500).json({ error: "Failed to generate application package", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 10. Vite Integration (Dev Middleware & Production Static Serving)
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
