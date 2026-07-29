import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { evaluateFit } from "./src/services/fitEngine";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  deleteUserProfile,
  verifyAccessTokenMiddleware,
} from "./src/services/auth";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with ample payload limit for resumes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize Gemini Client
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
// 1. Health Check Endpoint
// -----------------------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
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
// 3. Resume Intake & Parsing Endpoint (In-memory structured parsing, raw discarded)
// -----------------------------------------------------------------------------
app.post("/api/resume/parse", async (req, res) => {
  try {
    const { resumeText, filename } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an expert resume parser for tech and software engineering students.
    Parse the following resume content into structured candidate data.
    
    Resume Filename: ${filename || "Uploaded_Resume.pdf"}
    Resume Text Context: ${resumeText || "Candidate: Alex Chen, B.S. Computer Science, Experienced in Python, FastAPI, React, TypeScript, Docker, PostgreSQL."}
    
    Return a structured JSON object detailing candidate name, degree, top skills, experience summary, and project entries listed on the resume.`;

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
            topSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            experienceSummary: { type: Type.STRING },
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
                },
              },
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
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
// -----------------------------------------------------------------------------
app.post("/api/github/analyze", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const cleanUsername = username.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    let publicRepos: any[] = [];

    // Fetch public repositories from official GitHub REST API (up to 100 repos)
    try {
      const ghRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=100&type=all`, {
        headers: {
          "User-Agent": "NextBuild-App",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (Array.isArray(ghData) && ghData.length > 0) {
          publicRepos = ghData.map((r: any) => ({
            id: r.id?.toString() || r.name,
            name: r.name,
            description: r.description || "Public repository",
            techStack: r.language ? [r.language] : ["TypeScript", "JavaScript"],
            stars: r.stargazers_count || 0,
            updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "recently",
          }));

          return res.json({
            success: true,
            username: cleanUsername,
            repos: publicRepos,
          });
        }
      }
    } catch (e) {
      console.warn("GitHub API fetch fallback engaged:", e);
    }

    // AI Enrichment step using Gemini
    const ai = getGeminiClient();
    const prompt = `Analyze the following GitHub profile repositories for @${cleanUsername}.
    Repositories found: ${JSON.stringify(publicRepos)}
    
    If no repositories were fetched, generate 3 representative project profiles typical of a computer science student interested in full-stack engineering.
    Provide a structured summary of each project with repo name, one-line description, and tech stack tags.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING },
            repositories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  stars: { type: Type.NUMBER },
                  updatedAt: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const aiAnalysis = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      username: cleanUsername,
      repos: aiAnalysis.repositories || publicRepos,
    });
  } catch (error: any) {
    console.error("GitHub analyze error:", error);
    res.status(500).json({ error: "Failed to analyze GitHub profile", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 5. Job Description Intake & Parsing Endpoint
// -----------------------------------------------------------------------------
app.post("/api/jd/parse", async (req, res) => {
  try {
    const { jobUrl, rawText } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an expert job description parser for engineering positions on LinkedIn, Naukri, and Indeed.
    Parse the target job posting URL and raw text content into standardized requirements.
    
    Job Posting URL: ${jobUrl || "https://linkedin.com/jobs/view/apex-fullstack-engineer-10293"}
    Raw JD Text (if provided): ${rawText || "Full-Stack Software Engineer. Requirements: React, TypeScript, FastAPI, Redis, PostgreSQL, Docker."}
    
    Extract structured job details: title, company name, location, short description excerpt, required skills list, and domain (e.g. Full-Stack, Backend, AI/ML).`;

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
          },
        },
      },
    });

    const jobData = JSON.parse(response.text || "{}");
    res.json({ success: true, job: jobData });
  } catch (error: any) {
    console.error("JD parse error:", error);
    res.status(500).json({ error: "Failed to parse job posting", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 6. Company Research Enrichment Endpoint (Optional / Non-blocking)
// -----------------------------------------------------------------------------
app.post("/api/company/research", async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.json({ success: true, researchFound: false, signal: "No company specified" });
    }

    const ai = getGeminiClient();
    const prompt = `Research the engineering tech stack, architecture focus, microservices adoption, or cloud practices of the company: "${companyName}".
    Summarize any known engineering blog topics or technical focus areas in 2-3 concise sentences.
    If no specific details are known, provide clean industry context for technology companies in that sector.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    res.json({
      success: true,
      companyName,
      researchFound: text.length > 20,
      engineeringSignal: text,
    });
  } catch (error: any) {
    console.warn("Company research fallback:", error.message);
    res.json({
      success: true,
      researchFound: false,
      companyName: req.body.companyName || "Unknown",
      engineeringSignal: "Standard high-scalability full-stack web standards applied.",
    });
  }
});

// -----------------------------------------------------------------------------
// 7. Fit Analysis Engine (Delegates to modular evaluateFit)
// -----------------------------------------------------------------------------
app.post("/api/analysis/fit", async (req, res) => {
  try {
    const { repos, job, companyResearch } = req.body;
    const ai = getGeminiClient();

    const fitAnalysis = await evaluateFit({
      repos: repos || [],
      job: job || {},
      companyResearch: companyResearch || null,
      aiClient: ai,
    });

    res.json({
      success: true,
      fitAnalysis,
      disclaimer: fitAnalysis.disclaimer,
    });
  } catch (error: any) {
    console.error("Fit analysis error:", error);
    res.status(500).json({ error: "Failed to run fit analysis", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 8. Project Recommendation & Roadmap Generator
// -----------------------------------------------------------------------------
app.post("/api/roadmap/generate", async (req, res) => {
  try {
    const { job, fitAnalysis, companyResearch } = req.body;
    const ai = getGeminiClient();

    const prompt = `Based on the identified skill gaps for the target job position "${job?.title || "Full-Stack Engineer"}" at "${job?.company || "Target Company"}", generate 3 recommended project ideas that would close the skill gap and strengthen the student's portfolio.
    
    Job Requirements: ${JSON.stringify(job?.requiredSkills || ["React", "FastAPI", "Redis"])}
    Existing Gaps Context: ${JSON.stringify(fitAnalysis || {})}
    Company Research: ${companyResearch || "Standard cloud tech stack"}
    
    For each recommended project:
    - Title (Space Grotesk style)
    - One-sentence problem statement
    - Tech stack array (IBM Plex Mono tags)
    - Estimated build time (e.g. '~1 week', '~4 days')
    - 3 sequential milestone steps (stepNumber, title, description)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
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
                  problemStatement: { type: Type.STRING },
                  techStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
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

    const roadmapData = JSON.parse(response.text || "{}");
    res.json({ success: true, recommendedProjects: roadmapData.recommendedProjects });
  } catch (error: any) {
    console.error("Roadmap generate error:", error);
    res.status(500).json({ error: "Failed to generate project roadmap", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// 9. Application Package Generator
// -----------------------------------------------------------------------------
app.post("/api/package/generate", async (req, res) => {
  try {
    const { job, candidateInfo, fitAnalysis } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a tailored application package for a student applying to "${job?.title || "Software Engineer"}" at "${job?.company || "Apex Cloud Solutions"}".
    
    Candidate Info: ${JSON.stringify(candidateInfo || { candidateName: "Alex Chen", degree: "B.S. Computer Science" })}
    Target Job: ${JSON.stringify(job || { title: "Full-Stack Engineer", company: "Apex Cloud Solutions" })}
    Fit Analysis Context: ${JSON.stringify(fitAnalysis || {})}
    
    Produce:
    1. A tailored resume highlight summary (2-3 sentences emphasizing relevant stack match).
    2. A short "why this role" blurb (2-3 sentences linking student projects to company goals).`;

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
    res.json({ success: true, appPackage });
  } catch (error: any) {
    console.error("Application package error:", error);
    res.status(500).json({ error: "Failed to generate application package", details: error.message });
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
