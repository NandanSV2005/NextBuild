# NextBuild 🚀
> **AI-Powered Job Search & Skill-Gap Assistant for College & University Students**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fnext--build--seven.vercel.app-10253F?style=for-the-badge&logo=vercel&logoColor=F2A93B)](https://next-build-seven.vercel.app)

🌐 **Live Application:** [**https://next-build-seven.vercel.app**](https://next-build-seven.vercel.app)

NextBuild is a full-stack web application designed to help software engineering students streamline their job search. By analyzing a student's resume and GitHub profile against target job descriptions and company technical context, NextBuild provides project-by-project match ratings, generates 3-milestone actionable build roadmaps to close skill gaps, and drafts tailored application packages.

---

<!-- PLACEHOLDER: Main Application Hero Screenshot -->
<!-- Replace the link below with your screenshot of the NextBuild Hero & Technical Blueprint Interface -->
<img width="1835" height="996" alt="image" src="https://github.com/user-attachments/assets/2266c50c-11d5-4773-b929-d58d4fa67f81" />


---

## ⚡ How It Works

NextBuild follows a structured 4-step user workflow:

```
Step 1: Upload Resume  -->  Step 2: Connect GitHub  -->  Step 3: Target Job URL  -->  Step 4: Generate Build Plan
   (Parse PDF/DOCX)           (Fetch Public Repos)       (Extract JD Skills)           (Gemini Fit & Roadmap)
```

1. **Resume Intake:** Upload your resume (PDF/DOCX) or use sample candidate data. The app extracts structured skills, education, and listed projects in-memory and discards the raw file for privacy.
2. **GitHub Profile Analysis:** Connect your GitHub username to automatically fetch public repositories, code languages, and project topics.
3. **Job Posting Intake:** Select or paste a target job posting URL (from LinkedIn, Naukri, or Indeed) to parse key technical requirements and domain focus.
4. **Interactive Build Plan Trigger:** Click **"Analyze Fit & Generate Build Plan"** to run the Gemini AI engine and reveal your custom match score, skill gap evaluations, sequential project roadmap, and application package.

---

## 📸 Application Screenshots

<!-- PLACEHOLDER 1: Step 1-3 Workflow Section Screenshot -->
### 1. Candidate Input & GitHub Integration
<!-- Add a screenshot showing the Resume Upload Zone and Connected GitHub Repositories Grid below -->
<img width="1835" height="927" alt="image" src="https://github.com/user-attachments/assets/d0a0eab1-4024-430b-9aba-387270024d01" />


---

<!-- PLACEHOLDER 2: Fit Analysis Results Screenshot -->
### 2. Portfolio Fit Analysis & Match Ratings
<!-- Add a screenshot showing the Overall Portfolio Fit Rating Badge and Project-by-Project Evaluation cards below -->
![Portfolio Fit Analysis Screenshot](https://via.placeholder.com/1000x450/10253F/4FA87B?text=Portfolio+Fit+Analysis+%26+Project+Evaluations)

---

<!-- PLACEHOLDER 3: Milestone Build Roadmap Screenshot -->
### 3. Project Recommendation & Milestone Build Roadmap
<!-- Add a screenshot showing the 3 Recommended Project Cards with 3-Step Milestones below -->
![Milestone Build Roadmap Screenshot](https://via.placeholder.com/1000x450/10253F/F2A93B?text=Recommended+Projects+%26+3-Step+Build+Milestones)

---

<!-- PLACEHOLDER 4: Application Package & Tracker Screenshot -->
### 4. Tailored Application Package & Status Tracker
<!-- Add a screenshot showing the Resume Highlight, Why This Role Blurb, and Application Status Tracker below -->
![Application Package Screenshot](https://via.placeholder.com/1000x450/10253F/F2F0E6?text=Application+Package+%26+Status+Tracker)

---

## ✨ Key Features

- **Resume Parsing:** Extracts candidate skills, education, and projects into structured JSON format. Discards raw uploads to protect PII.
- **GitHub Repo Indexing:** Pulls public repositories via GitHub REST API (up to 100 public repos) including language breakdowns and commit recency.
- **Scraped JD Normalization:** Parses unstructured job postings from Naukri, LinkedIn, and Indeed into normalized skill requirements.
- **Company Context Enrichment:** Optional non-blocking web lookup layer for company tech stack signals (engineering blogs, cloud architecture).
- **Gemini Fit Engine with Heuristic Fallback:** Evaluates project match ratings (`Direct Match`, `Partial Match`, `Weak Match`) with automatic heuristic fallback under API quota/rate-limit constraints.
- **Actionable Build Roadmaps:** Recommends 2–3 portfolio projects with problem statements, stack tags, estimated build times, and 3-step sequential milestones.
- **Application Package Export:** Generates ready-to-submit resume highlights and "why this role" blurbs with status tracking (`Saved`, `Applied`, `Interviewing`).
- **Security & Data Privacy:** Short-lived JWT access tokens (30m), long-lived refresh tokens (14d), bcrypt password hashing, and user-initiated data deletion via `DELETE /api/profile` per [`PRIVACY.md`](./PRIVACY.md).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons
- **Backend:** Node.js, Express, TypeScript (`tsx`)
- **AI Engine:** Google Gemini API (`@google/genai` model `gemini-3.6-flash`)
- **Auth & Security:** JWT (`jsonwebtoken`), `bcryptjs`, environment secret management
- **Testing:** Vitest

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js:** v18+ installed
- **npm:** package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NandanSV2005/NextBuild.git
   cd NextBuild
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   JWT_SECRET=your_jwt_access_secret_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`.

5. **Run Automated Unit Tests:**
   ```bash
   npm test
   ```

---

## 🔒 Data Privacy

For details on how student resume data and GitHub metadata are handled, processed in-memory, and deleted upon account request, see [`PRIVACY.md`](./PRIVACY.md).

---

## 📄 License

MIT License. Built for student job seekers.
