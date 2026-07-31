import { Repo, JobPosting, ProjectFit, RecommendedProject, ApplicationPackage } from '../types';

export const SAMPLE_RESUME_FILENAME = "Alex_Chen_Software_Engineering_Resume.pdf";

export const SAMPLE_REPOS: Repo[] = [
  {
    id: 'repo-1',
    name: 'ecommerce-microservices-api',
    description: 'High-throughput REST API for order processing and inventory management built with Python and PostgreSQL.',
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    stars: 14,
    updatedAt: '2 days ago'
  },
  {
    id: 'repo-2',
    name: 'react-dashboard-design-system',
    description: 'Accessible component library and analytics dashboard with responsive charts and dark mode.',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Recharts'],
    stars: 28,
    updatedAt: '1 week ago'
  },
  {
    id: 'repo-3',
    name: 'dev-task-tracker-cli',
    description: 'Command line interface tool for tracking developer focus time and sync with local Markdown logs.',
    techStack: ['Node.js', 'TypeScript', 'Git'],
    stars: 8,
    updatedAt: '3 weeks ago'
  }
];

export const SAMPLE_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Full-Stack Software Engineer (Graduate)',
    company: 'Apex Cloud Solutions',
    location: 'San Francisco, CA (Hybrid)',
    url: 'https://linkedin.com/jobs/view/apex-fullstack-engineer-10293',
    descriptionSnippet: 'We are seeking an energetic Full-Stack Engineer to build real-time monitoring tools and async background pipelines. Core stack requires React, TypeScript, FastAPI, Redis, and vector search/ML integration for system metric anomaly detection.',
    requiredSkills: ['React', 'TypeScript', 'FastAPI', 'Redis', 'Vector Search', 'PostgreSQL']
  },
  {
    id: 'job-2',
    title: 'Junior Backend Developer',
    company: 'FinPulse Systems',
    location: 'Remote',
    url: 'https://indeed.com/viewjob?jk=finpulse-backend-9981',
    descriptionSnippet: 'Build secure payment webhooks, database migrations, and microservice APIs. Experience with Python/Node, SQL database schema design, and CI/CD pipelines is required.',
    requiredSkills: ['Python', 'PostgreSQL', 'Docker', 'REST APIs', 'CI/CD']
  },
  {
    id: 'job-3',
    title: 'Associate AI Platform Engineer',
    company: 'CognitiveScale Labs',
    location: 'New York, NY',
    url: 'https://naukri.com/job/associate-ai-engineer-8820',
    descriptionSnippet: 'Develop API gateways for LLM embeddings, model evaluation harnesses, and web dashboards. Requires strong Python or TypeScript foundations and experience with modern AI APIs.',
    requiredSkills: ['TypeScript', 'Python', 'LLM Embedding', 'FastAPI', 'VectorDB']
  }
];

export const SAMPLE_PROJECT_FITS: ProjectFit[] = [
  {
    id: 'fit-1',
    projectName: 'ecommerce-microservices-api',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Your FastAPI + PostgreSQL backend demonstrates solid microservice architecture and async request handling aligned with Apex Cloud\'s backend stack.'
  },
  {
    id: 'fit-2',
    projectName: 'react-dashboard-design-system',
    verdict: 'Direct Match',
    verdictColor: 'green',
    reasoning: 'Strong frontend proof in React and TypeScript with component styling and data visualization.'
  },
  {
    id: 'fit-3',
    projectName: 'dev-task-tracker-cli',
    verdict: 'Partial Match',
    verdictColor: 'amber',
    reasoning: 'Shows good TypeScript utility scripting, but doesn\'t highlight backend caching (Redis) or anomaly detection AI tools required for this specific posting.'
  }
];

export const SAMPLE_RECOMMENDED_PROJECTS: RecommendedProject[] = [
  {
    id: 'rec-1',
    title: 'Async Metric Pipeline & Anomaly Detector',
    problemStatement: 'Build a lightweight queue-backed API service that ingests system logs, caches telemetry in Redis, and flags abnormal spikes using simple statistical anomaly checks.',
    techStack: ['FastAPI', 'Redis', 'Python', 'Docker'],
    estimatedBuildTime: '~1 week',
    milestones: [
      {
        stepNumber: 1,
        title: 'Set up Redis Queue & Ingestion API',
        description: 'Create a FastAPI endpoint that receives JSON log payloads and pushes them onto a Redis queue for background worker processing.'
      },
      {
        stepNumber: 2,
        title: 'Implement Anomaly Detection Worker',
        description: 'Write a background worker using Celery or Python Asyncio to compute rolling Z-scores over incoming metrics and flag outliers.'
      },
      {
        stepNumber: 3,
        title: 'Expose Health Alert Dashboard API',
        description: 'Store flagged anomalies in PostgreSQL and expose a clean REST endpoint returning real-time system metric status.'
      }
    ]
  },
  {
    id: 'rec-2',
    title: 'Real-Time Telemetry Monitor UI',
    problemStatement: 'Construct a responsive React dashboard that streams live server metrics and visualizes flagged system incidents with action buttons.',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Recharts'],
    estimatedBuildTime: '~4 days',
    milestones: [
      {
        stepNumber: 1,
        title: 'Create Streaming Metric Hook',
        description: 'Implement a WebSocket or polling React hook connecting to the backend anomaly detector service.'
      },
      {
        stepNumber: 2,
        title: 'Build Interactive Live Charts',
        description: 'Render line charts with Recharts highlighting threshold exceedances in Signal Amber.'
      },
      {
        stepNumber: 3,
        title: 'Add Incident Resolution Workflow',
        description: 'Allow users to acknowledge, dismiss, or tag incidents with resolution notes saved to local state.'
      }
    ]
  },
  {
    id: 'rec-3',
    title: 'RAG Log Search Assistant',
    problemStatement: 'Integrate vector embeddings with PostgreSQL (pgvector) to let engineering teams search system error logs using plain English questions.',
    techStack: ['Python', 'FastAPI', 'pgvector', 'Gemini API'],
    estimatedBuildTime: '~1.5 weeks',
    milestones: [
      {
        stepNumber: 1,
        title: 'Generate Embedding Pipeline for Logs',
        description: 'Parse application error stack traces and index vector embeddings into pgvector.'
      },
      {
        stepNumber: 2,
        title: 'Build Semantic Query Route',
        description: 'Expose a search route that computes cosine similarity between incoming queries and stored log embeddings.'
      },
      {
        stepNumber: 3,
        title: 'Generate Plain English Root Cause Summaries',
        description: 'Pass the top matching logs to Gemini API to return a concise 2-sentence explanation of why the crash occurred.'
      }
    ]
  }
];

export const SAMPLE_APPLICATION_PACKAGE: ApplicationPackage = {
  resumeHighlightSummary: `High-impact Full-Stack candidate with proven backend expertise in FastAPI/PostgreSQL and responsive frontend engineering in React/TypeScript. Recently engineered an async telemetry ingestion pipeline with Redis caching and real-time metric visualization, closing key infrastructure requirements for high-scale microservices.`,
  whyThisRoleBlurb: `I am thrilled to apply for the Full-Stack Software Engineer role at Apex Cloud Solutions. Having built distributed microservices and real-time analytics interfaces, I admire Apex Cloud's commitment to low-latency infrastructure monitoring. My recent project — an async log ingestion queue paired with automated metric anomaly detection — directly mirrors Apex Cloud's technical roadmap.`
};

export const SAMPLE_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    repoName: 'NextBuild',
    question: 'In your NextBuild repository, how did you structure asynchronous request handling and database migrations?',
    conceptTested: 'System Architecture & Async Throughput',
    whyRecruitersAskThis: 'Interviewers at Apex Cloud Solutions assess whether you understand production API throughput and database consistency.',
    modelStarAnswer: {
      situation: 'Building microservices targeting high-throughput request handling for Full-Stack Software Engineer roles.',
      task: 'Ensure zero-downtime database updates and non-blocking I/O during peak telemetry spikes.',
      action: [
        'Implemented FastAPI async route handlers with Pydantic validation schemas.',
        'Configured connection pooling with asyncpg and Alembic migration scripts.',
        'Benchmarked API throughput under simulated concurrent user load.',
      ],
      result: 'Achieved sub-50ms API response latency and 99.9% uptime during telemetry stress tests.',
    },
    evidenceBasis: 'Grounded in FastAPI dependency file and async route structure in repository.',
  },
  {
    repoName: 'NextBuild',
    question: 'How do you handle API rate limiting, background queues, and failure retries when calling third-party services?',
    conceptTested: 'Concurrency & Distributed Queues',
    whyRecruitersAskThis: 'Tests your understanding of distributed systems resilience and background queue workers.',
    modelStarAnswer: {
      situation: 'Handling fluctuating external API rate limits and network timeouts.',
      task: 'Prevent cascading failures and user-facing 500 server errors.',
      action: [
        'Integrated Redis message queues (RQ/Celery) with exponential backoff retries.',
        'Implemented circuit breaker pattern for external API calls.',
        'Monitored queue latency and worker pool health.',
      ],
      result: 'Eliminated API dropouts and successfully handled 10,000+ queued background jobs without data loss.',
    },
    evidenceBasis: 'Grounded in Redis dependency and background queue worker tasks.',
  },
  {
    repoName: 'NextBuild',
    question: 'Walk me through your unit testing strategy and CI/CD workflow for your repositories.',
    conceptTested: 'Testing & CI/CD Automation',
    whyRecruitersAskThis: 'Assesses production readiness and automated quality assurance habits.',
    modelStarAnswer: {
      situation: 'Maintaining code quality across multi-contributor commits.',
      task: 'Catch regressions automatically before merging to main branch.',
      action: [
        'Configured GitHub Actions CI workflows running Vitest and PyTest test suites.',
        'Enforced pre-commit linting and Docker container build verification.',
        'Automated pull request checks and coverage reports.',
      ],
      result: 'Maintained 85%+ code coverage and zero broken deployment regressions across 50+ commit iterations.',
    },
    evidenceBasis: 'Grounded in GitHub Actions workflow files and test configuration in repository.',
  },
  {
    repoName: 'NextBuild',
    question: 'How do you design RESTful API schemas and handle authentication tokens securely?',
    conceptTested: 'API Design & Security',
    whyRecruitersAskThis: 'Evaluates API security fundamentals (JWT, CORS, authorization middleware).',
    modelStarAnswer: {
      situation: 'Securing user profile data and API endpoints against unauthorized access.',
      task: 'Implement stateless token authentication with token revocation capabilities.',
      action: [
        'Used short-lived JWT access tokens alongside HTTP-only refresh tokens.',
        'Built role-based access control middleware for route authorization.',
        'Configured strict CORS headers and input sanitization.',
      ],
      result: 'Protected all internal API routes against unauthorized access and CSRF vulnerabilities.',
    },
    evidenceBasis: 'Grounded in Express/JWT authentication middleware and token routes.',
  },
  {
    repoName: 'NextBuild',
    question: 'How would you optimize database queries when dealing with relational joins and index performance?',
    conceptTested: 'Database Schema & Query Optimization',
    whyRecruitersAskThis: 'Tests database schema normalization and SQL optimization skills.',
    modelStarAnswer: {
      situation: 'Scaling relational query speeds as dataset size grows.',
      task: 'Reduce slow query execution times on complex joins.',
      action: [
        'Analyzed EXPLAIN ANALYZE execution plans for slow queries.',
        'Added composite B-Tree indexes on heavily queried foreign keys.',
        'Eliminated N+1 query patterns using eager loading.',
      ],
      result: 'Reduced database query execution times by 70% under simulated load.',
    },
    evidenceBasis: 'Grounded in PostgreSQL schema and migration scripts.',
  },
];
