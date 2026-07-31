import React, { useState } from 'react';
import { RecommendedProject } from '../types';
import { ChevronDown, ChevronUp, Clock, ExternalLink, CheckCircle2, Award, Sparkles, BookOpen, Layers, Terminal, Copy, Check, Code2 } from 'lucide-react';
import { SAMPLE_RECOMMENDED_PROJECTS } from '../data/sampleData';

export interface ResumeRoadmapStep {
  stepNumber: number;
  topic: string;
  problemIdentified: string;
  actionPlan: string;
  recommendedResourceTopic?: string;
}

interface RoadmapSectionProps {
  recommendedProjects: RecommendedProject[];
  resumeRoadmap?: ResumeRoadmapStep[];
  overallScore?: number;
}

interface ReliableResource {
  stepNumber: number;
  skill: string;
  category: string;
  estimatedTime: string;
  description: string;
  whatToLearn: string[];
  linkText: string;
  url: string;
}

const RELIABLE_LEARNING_RESOURCES: ReliableResource[] = [
  {
    stepNumber: 1,
    skill: 'React & Modern Frontend Architecture',
    category: 'Frontend Engineering',
    estimatedTime: '~3–4 Days',
    description: 'Master component architecture, state management, and modern React 19 server patterns.',
    whatToLearn: [
      'React 19 Server Components vs Client Components',
      'Custom Hooks & Context State Management',
      'Performance Optimization, Memoization & Re-render Prevention',
    ],
    linkText: 'React Official Documentation (react.dev)',
    url: 'https://react.dev',
  },
  {
    stepNumber: 2,
    skill: 'TypeScript Strict Type Systems',
    category: 'Type Safety',
    estimatedTime: '~2–3 Days',
    description: 'Learn strict generics, utility types, and enterprise-grade type safety.',
    whatToLearn: [
      'Strict Generics & Type Constraints (<T extends object>)',
      'Utility Types (Pick, Omit, Partial, Record, ReturnType)',
      'Discriminated Unions & Custom Type Guards',
    ],
    linkText: 'TypeScript Official Handbook (typescriptlang.org)',
    url: 'https://www.typescriptlang.org/docs/',
  },
  {
    stepNumber: 3,
    skill: 'FastAPI & Async Python Backends',
    category: 'API & Microservices',
    estimatedTime: '~3–4 Days',
    description: 'Build high-throughput asynchronous RESTful APIs with Pydantic validation.',
    whatToLearn: [
      'Asynchronous Endpoints (async/await) & Event Loops',
      'Pydantic Schema Validation & Request Data Parsing',
      'Dependency Injection Systems & Security Middlewares',
    ],
    linkText: 'FastAPI Official Documentation (fastapi.tiangolo.com)',
    url: 'https://fastapi.tiangolo.com/',
  },
  {
    stepNumber: 4,
    skill: 'PostgreSQL Relational DB & Query Optimization',
    category: 'Database Design',
    estimatedTime: '~4–5 Days',
    description: 'Master relational schema design, indexing strategies, and SQL query tuning.',
    whatToLearn: [
      'B-Tree Indexing & Query Execution Plans (EXPLAIN ANALYZE)',
      'ACID Transactions & Row Locking Isolation Levels',
      'Complex SQL Joins, Aggregations & Window Functions',
    ],
    linkText: 'PostgreSQL Official Documentation (postgresql.org)',
    url: 'https://www.postgresql.org/docs/',
  },
  {
    stepNumber: 5,
    skill: 'Docker Containers & Cloud Microservices',
    category: 'DevOps & Deployment',
    estimatedTime: '~3–4 Days',
    description: 'Containerize multi-container software architectures with Docker Compose.',
    whatToLearn: [
      'Multi-stage Dockerfile Builds for Minimal Image Size',
      'Docker Compose Multi-service Container Orchestration',
      'Container Networking, Volume Mounts & Healthchecks',
    ],
    linkText: 'Docker Official Documentation (docs.docker.com)',
    url: 'https://docs.docker.com/',
  },
  {
    stepNumber: 6,
    skill: 'System Design & Architectural Design Patterns',
    category: 'Software Architecture',
    estimatedTime: '~4–5 Days',
    description: 'Learn clean architecture principles, design patterns, and scalable microservice design.',
    whatToLearn: [
      'SOLID Principles & Gang of Four Structural Design Patterns',
      'Caching Strategies (Read-through, Write-through, Redis)',
      'Event-Driven Architecture & Message Queues (RabbitMQ/Kafka)',
    ],
    linkText: 'Refactoring.Guru Architecture & Patterns (refactoring.guru)',
    url: 'https://refactoring.guru/design-patterns',
  },
];

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  recommendedProjects,
  resumeRoadmap = [],
  overallScore = 74,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'resume-mastery'>('build');
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedBoilerplate, setCopiedBoilerplate] = useState(false);

  const fullProjectsList = Array.isArray(recommendedProjects) && recommendedProjects.length > 0
    ? recommendedProjects
    : SAMPLE_RECOMMENDED_PROJECTS;

  let projectsToDisplay: RecommendedProject[] = fullProjectsList;
  if (overallScore === 100) {
    projectsToDisplay = [];
  } else if (overallScore > 95) {
    projectsToDisplay = fullProjectsList.slice(0, 1);
  }

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(projectsToDisplay[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="step-roadmap" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Your Build Plan & Skill Roadmap
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Blueprint Container */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          {/* Header & Tab Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3D6FB4]/30 pb-4">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#F2F0E6]">
                Targeted Project Roadmap & Skill Mastery
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#7C93AC]">
                {overallScore === 100
                  ? 'Your portfolio matches 100% of job requirements!'
                  : overallScore > 95
                  ? 'High portfolio score (95%+): 1 single capstone project recommended.'
                  : 'Sequential build roadmap & trusted learning resources to boost your analysis score.'}
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-[#3D6FB4]/20 p-1 rounded-lg border border-[#3D6FB4]/40 text-xs font-body shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('build')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'build'
                    ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                    : 'text-[#7C93AC] hover:text-[#F2F0E6]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Build Projects ({projectsToDisplay.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resume-mastery')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'resume-mastery'
                    ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                    : 'text-[#7C93AC] hover:text-[#F2F0E6]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Resume Skill Mastery ({RELIABLE_LEARNING_RESOURCES.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Build Projects Roadmap */}
          {activeTab === 'build' ? (
            <>
              {/* SCORE === 100%: Perfect Match Gold Banner */}
              {overallScore === 100 ? (
                <div className="p-8 bg-[#F2A93B]/15 border-2 border-[#F2A93B] rounded-lg text-center space-y-4 shadow-xl relative overflow-hidden blueprint-grid">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#F2A93B]/20 border border-[#F2A93B] flex items-center justify-center">
                      <Award className="w-9 h-9 text-[#F2A93B]" />
                    </div>
                  </div>

                  <div className="max-w-xl mx-auto space-y-2">
                    <h4 className="font-display font-bold text-2xl text-[#F2F0E6]">
                      🎉 100% Perfect Portfolio Match!
                    </h4>
                    <p className="font-body text-sm text-[#F2F0E6]/90 leading-relaxed">
                      Your existing GitHub repositories and resume fully satisfy 100% of the technical requirements for this job. You do not need to build additional gap-closing projects!
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-mono-data">
                    <span className="px-3 py-1.5 rounded-full bg-[#4FA87B]/20 text-[#4FA87B] border border-[#4FA87B]/40 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready to Apply Immediately</span>
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] font-semibold flex items-center space-x-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Focus on Technical Interview Prep</span>
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* SCORE > 95%: High-Tier Banner */}
                  {overallScore > 95 && (
                    <div className="p-4 bg-[#4FA87B]/15 border border-[#4FA87B]/50 rounded-md text-xs font-body text-[#F2F0E6] flex items-center space-x-3">
                      <Award className="w-5 h-5 text-[#4FA87B] shrink-0" />
                      <div>
                        <span className="font-semibold text-[#4FA87B] block">
                          Exceptional Match ({overallScore}% Score)
                        </span>
                        <span>
                          Your profile is outstanding. We have streamlined your build roadmap to 1 final high-impact capstone project.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Desktop Drafted Horizontal Path Container */}
                  <div className={`hidden lg:grid ${projectsToDisplay.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-3'} gap-6 relative pt-2`}>
                    {projectsToDisplay.map((project, index) => {
                      const isExpanded = expandedProjectId === project.id;

                      return (
                        <div
                          key={project.id}
                          className={`relative z-10 bg-[#10253F] border rounded-lg p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                            isExpanded
                              ? 'border-[#F2A93B] shadow-[0_0_15px_rgba(242,169,59,0.15)] ring-1 ring-[#F2A93B]/40'
                              : 'border-[#3D6FB4] hover:border-[#F2F0E6]/50'
                          }`}
                          onClick={() => toggleExpand(project.id)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 text-[11px] font-mono-data font-bold bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] rounded-full">
                                Project #{index + 1}
                              </span>
                              <span className="font-body text-xs text-[#7C93AC] flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{project.estimatedBuildTime}</span>
                              </span>
                            </div>

                            <div>
                              <h4 className="font-display font-medium text-base text-[#F2F0E6] mb-1 leading-snug">
                                {project.title}
                              </h4>
                              <p className="font-body text-xs text-[#7C93AC] line-clamp-3 leading-relaxed">
                                {project.problemStatement}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-[#3D6FB4]/30 space-y-3 mt-4">
                            <div className="flex flex-wrap gap-1">
                              {project.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 text-[10px] font-mono-data bg-[#7C93AC]/20 text-[#F2F0E6] rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              className="w-full flex items-center justify-between text-xs font-body font-semibold text-[#F2A93B] pt-1"
                            >
                              <span>{isExpanded ? 'Hide Milestones' : 'Inspect Milestones'}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Vertical Stacked List */}
                  <div className="lg:hidden flex flex-col space-y-4">
                    {projectsToDisplay.map((project, index) => {
                      const isExpanded = expandedProjectId === project.id;

                      return (
                        <div
                          key={project.id}
                          className={`bg-[#10253F] border rounded-lg p-5 space-y-4 cursor-pointer transition-all ${
                            isExpanded ? 'border-[#F2A93B]' : 'border-[#3D6FB4]'
                          }`}
                          onClick={() => toggleExpand(project.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 text-[11px] font-mono-data font-bold bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] rounded-full">
                              Project #{index + 1}
                            </span>
                            <span className="font-body text-xs text-[#7C93AC] flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{project.estimatedBuildTime}</span>
                            </span>
                          </div>

                          <div>
                            <h4 className="font-display font-medium text-lg text-[#F2F0E6] mb-1">
                              {project.title}
                            </h4>
                            <p className="font-body text-sm text-[#7C93AC] leading-relaxed">
                              {project.problemStatement}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {project.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 text-xs font-mono-data bg-[#7C93AC]/20 text-[#F2F0E6] rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            className="w-full flex items-center justify-between text-xs font-body font-semibold text-[#F2A93B] pt-2 border-t border-[#3D6FB4]/30"
                          >
                            <span>{isExpanded ? 'Hide Milestones' : 'Inspect Milestones'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Milestone Expansion Drawer for Selected Project */}
                  {expandedProjectId && (
                    <div className="p-6 bg-[#3D6FB4]/10 border border-[#F2A93B]/50 rounded-lg space-y-4 animate-in fade-in duration-200">
                      {(() => {
                        const project = projectsToDisplay.find((p) => p.id === expandedProjectId);
                        if (!project) return null;

                        return (
                          <>
                            <div className="flex items-center justify-between border-b border-[#3D6FB4]/40 pb-3">
                              <div>
                                <h4 className="font-display font-bold text-lg text-[#F2F0E6]">
                                  Milestone Roadmap — {project.title}
                                </h4>
                                <p className="font-body text-xs text-[#7C93AC]">
                                  Sequential build guide to prove competencies required for this role
                                </p>
                              </div>
                              <span className="font-mono-data text-xs text-[#F2A93B] font-semibold">
                                Estimated: {project.estimatedBuildTime}
                              </span>
                            </div>

                            <div className="space-y-3 pt-1">
                              {project.milestones.map((milestone) => (
                                <div
                                  key={milestone.stepNumber}
                                  className="flex items-start space-x-3.5 p-3.5 bg-[#10253F] border border-[#3D6FB4]/60 rounded-md"
                                >
                                  <div className="w-7 h-7 rounded bg-[#F2A93B] text-[#10253F] font-mono-data font-bold text-xs flex items-center justify-center shrink-0">
                                    {milestone.stepNumber}
                                  </div>
                                  <div>
                                    <h5 className="font-display font-semibold text-sm text-[#F2F0E6]">
                                      {milestone.title}
                                    </h5>
                                    <p className="font-body text-xs text-[#7C93AC] mt-0.5 leading-relaxed">
                                      {milestone.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* ⚡ 1-Click Project Scaffold Box */}
                            <div className="pt-4 border-t border-[#3D6FB4]/40 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded bg-[#F2A93B]/20 border border-[#F2A93B]/40 flex items-center justify-center text-[#F2A93B]">
                                    <Terminal className="w-3.5 h-3.5" />
                                  </div>
                                  <h5 className="font-display font-bold text-sm text-[#F2F0E6]">
                                    ⚡ 1-Click Project Boilerplate Scaffold
                                  </h5>
                                </div>
                                <span className="text-[10px] font-mono-data uppercase bg-[#3D6FB4]/30 text-[#4FA87B] border border-[#3D6FB4] px-2 py-0.5 rounded font-bold">
                                  Ready to Build
                                </span>
                              </div>

                              {/* Terminal CLI Command */}
                              <div className="bg-[#0b192c] border border-[#3D6FB4] rounded-md p-3 flex items-center justify-between gap-3 text-xs font-mono-data">
                                <div className="flex items-center space-x-2 truncate">
                                  <span className="text-[#F2A93B] font-bold">$</span>
                                  <code className="text-[#F2F0E6] truncate">
                                    npx create-nextbuild-app --template {project.techStack[0]?.toLowerCase() || 'fastapi'} --project "{project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}"
                                  </code>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`npx create-nextbuild-app --template ${project.techStack[0]?.toLowerCase() || 'fastapi'} --project "${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}"`);
                                    setCopiedCli(true);
                                    setTimeout(() => setCopiedCli(false), 2000);
                                  }}
                                  className="px-2.5 py-1 bg-[#3D6FB4]/30 hover:bg-[#3D6FB4]/60 text-[#F2F0E6] rounded border border-[#3D6FB4] transition-colors cursor-pointer shrink-0 flex items-center space-x-1 text-[11px]"
                                >
                                  {copiedCli ? <Check className="w-3.5 h-3.5 text-[#4FA87B]" /> : <Copy className="w-3.5 h-3.5 text-[#7C93AC]" />}
                                  <span>{copiedCli ? 'Copied CLI!' : 'Copy Command'}</span>
                                </button>
                              </div>

                              {/* Starter Code Preview */}
                              <div className="bg-[#0b192c] border border-[#3D6FB4] rounded-md p-3 text-xs font-mono-data space-y-2">
                                <div className="flex items-center justify-between text-[#7C93AC] text-[11px] pb-1 border-b border-[#3D6FB4]/30">
                                  <span>Starter Template Files (`main.py` & `docker-compose.yml`)</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const boilerplateCode = `# NextBuild Starter Template: ${project.title}\n# Stack: ${project.techStack.join(', ')}\n\nfrom fastapi import FastAPI\nimport redis\n\napp = FastAPI(title="${project.title}")\nr = redis.Redis(host='redis', port=6379, db=0)\n\n@app.get("/health")\ndef health_check():\n    return {"status": "ok", "project": "${project.title}"}\n`;
                                      navigator.clipboard.writeText(boilerplateCode);
                                      setCopiedBoilerplate(true);
                                      setTimeout(() => setCopiedBoilerplate(false), 2000);
                                    }}
                                    className="text-[#F2A93B] hover:underline cursor-pointer flex items-center space-x-1"
                                  >
                                    {copiedBoilerplate ? <Check className="w-3.5 h-3.5 text-[#4FA87B]" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedBoilerplate ? 'Copied Boilerplate!' : 'Copy Code'}</span>
                                  </button>
                                </div>
                                <pre className="text-[#7C93AC] overflow-x-auto text-[11px] leading-relaxed">
{`# NextBuild Starter Template: ${project.title}
from fastapi import FastAPI
import redis

app = FastAPI(title="${project.title}")

@app.get("/health")
def health_check():
    return {"status": "ok", "project": "${project.title}"}`}
                                </pre>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* TAB 2: Resume Skill Mastery Step-by-Step Roadmap */
            <div className="space-y-6">
              <div className="p-4 bg-[#3D6FB4]/15 border border-[#3D6FB4] rounded-md text-xs font-body text-[#7C93AC] space-y-1">
                <span className="font-semibold text-[#F2F0E6] block text-sm">
                  Personalized Resume & Skill Mastery Roadmap
                </span>
                <p>
                  Dynamically generated for your target job posting. Each step addresses identified resume gaps, keywords to rephrase, and core engineering concepts to master.
                </p>
              </div>

              {/* Dynamic AI-Generated Resume Roadmap Steps */}
              {Array.isArray(resumeRoadmap) && resumeRoadmap.length > 0 ? (
                <div className="space-y-4">
                  {resumeRoadmap.map((step, idx) => (
                    <div
                      key={`step-${idx}`}
                      className="p-5 bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/70 rounded-lg space-y-4 transition-all"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#3D6FB4]/30 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="px-2.5 py-1 text-xs font-mono-data font-bold bg-[#F2A93B] text-[#10253F] rounded-md">
                            STEP {step.stepNumber || idx + 1}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-mono-data uppercase font-bold bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] rounded">
                            {step.topic}
                          </span>
                        </div>
                      </div>

                      {/* Problem / Identified Gap */}
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-base text-[#F2F0E6]">
                          Identified Gap / Requirement:
                        </h4>
                        <p className="font-body text-xs sm:text-sm text-[#7C93AC] leading-relaxed">
                          {step.problemIdentified}
                        </p>
                      </div>

                      {/* Action Plan */}
                      <div className="p-4 bg-[#3D6FB4]/10 border border-[#3D6FB4]/40 rounded-md space-y-2">
                        <span className="font-mono-data text-xs uppercase font-bold text-[#4FA87B] tracking-wider block flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4FA87B]" />
                          <span>Actionable Resume Fix & Mastery Strategy:</span>
                        </span>
                        <p className="text-xs font-body text-[#F2F0E6] leading-relaxed">
                          {step.actionPlan}
                        </p>
                      </div>

                      {/* Technology Topic */}
                      {step.recommendedResourceTopic && (
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#3D6FB4]/30 text-xs font-body text-[#7C93AC]">
                          <span>Target Concept to Master:</span>
                          <span className="font-mono-data font-semibold text-[#F2A93B]">
                            {step.recommendedResourceTopic}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback Learning Resources */
                <div className="space-y-4">
                  {RELIABLE_LEARNING_RESOURCES.map((res) => (
                    <div
                      key={res.stepNumber}
                      className="p-5 bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/70 rounded-lg space-y-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#3D6FB4]/30 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="px-2.5 py-1 text-xs font-mono-data font-bold bg-[#F2A93B] text-[#10253F] rounded-md">
                            STEP {res.stepNumber}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-mono-data uppercase font-bold bg-[#3D6FB4]/30 text-[#F2A93B] border border-[#3D6FB4] rounded">
                            {res.category}
                          </span>
                        </div>

                        <div className="font-body text-xs font-semibold text-[#7C93AC] flex items-center space-x-1.5 bg-[#3D6FB4]/10 px-2.5 py-1 rounded border border-[#3D6FB4]/30">
                          <Clock className="w-3.5 h-3.5 text-[#F2A93B]" />
                          <span>Estimated Study Time: <strong className="text-[#F2F0E6]">{res.estimatedTime}</strong></span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-lg text-[#F2F0E6]">
                          {res.skill}
                        </h4>
                        <p className="font-body text-xs sm:text-sm text-[#7C93AC] leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      <div className="p-4 bg-[#3D6FB4]/10 border border-[#3D6FB4]/40 rounded-md space-y-2">
                        <span className="font-mono-data text-xs uppercase font-bold text-[#F2A93B] tracking-wider block">
                          What You Need To Learn & Master:
                        </span>
                        <ul className="space-y-1.5">
                          {res.whatToLearn.map((topic, i) => (
                            <li key={i} className="flex items-start space-x-2 text-xs font-body text-[#F2F0E6]">
                              <CheckCircle2 className="w-4 h-4 text-[#4FA87B] shrink-0 mt-0.5" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#3D6FB4]/30">
                        <span className="font-body text-xs text-[#7C93AC]">
                          Official Learning Source:
                        </span>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 font-mono-data text-xs text-[#F2A93B] hover:underline font-semibold"
                        >
                          <span>{res.linkText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
