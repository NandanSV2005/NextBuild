import { describe, it, expect, vi } from 'vitest';
import { evaluateFit, FitEngineResult, RepoInput, JobInput } from '../src/services/fitEngine';

describe('Fit Engine Unit Tests', () => {
  const sampleJob: JobInput = {
    id: 'job-1',
    title: 'Full-Stack Software Engineer',
    company: 'Apex Cloud Solutions',
    requiredSkills: ['React', 'TypeScript', 'FastAPI', 'Docker', 'PostgreSQL'],
    domain: 'Full-Stack',
  };

  const sampleRepos: RepoInput[] = [
    {
      id: 'repo-1',
      name: 'microservices-dashboard',
      description: 'React, TypeScript & FastAPI metrics monitor',
      techStack: ['TypeScript', 'Python', 'FastAPI', 'React'],
      stars: 12,
    },
    {
      id: 'repo-2',
      name: 'dockerized-postgres-api',
      description: 'REST API backend with Docker and Postgres ORM',
      techStack: ['Python', 'PostgreSQL', 'Docker'],
      stars: 5,
    },
  ];

  // Helper mock generator
  function createMockAiClient(mockResponseObj: any) {
    return {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(mockResponseObj),
        }),
      },
    };
  }

  it('1. Test fallback behavior: Company research present vs absent', async () => {
    const mockAiWithResearch = createMockAiClient({
      overallScore: 85,
      verdict: 'Strong Match',
      projectFits: [
        {
          id: 'repo-1',
          projectName: 'microservices-dashboard',
          verdict: 'Direct Match',
          verdictColor: 'green',
          reasoning: 'Matches React/TypeScript stack and Apex Cloud microservices focus.',
        },
      ],
    });

    // Call with company research present
    const resultWithResearch = await evaluateFit({
      repos: sampleRepos,
      job: sampleJob,
      companyResearch: 'Apex Cloud is migrating all services to Dockerized FastAPI microservices.',
      aiClient: mockAiWithResearch,
    });

    expect(resultWithResearch.informedByCompanyResearch).toBe(true);
    expect(resultWithResearch.overallScore).toBe(85);
    expect(resultWithResearch.verdict).toBe('Strong Match');

    const mockAiWithoutResearch = createMockAiClient({
      overallScore: 78,
      verdict: 'Partial Match',
      projectFits: [
        {
          id: 'repo-1',
          projectName: 'microservices-dashboard',
          verdict: 'Direct Match',
          verdictColor: 'green',
          reasoning: 'Matches JD required skills React and TypeScript.',
        },
      ],
    });

    // Call with company research absent
    const resultWithoutResearch = await evaluateFit({
      repos: sampleRepos,
      job: sampleJob,
      companyResearch: null,
      aiClient: mockAiWithoutResearch,
    });

    expect(resultWithoutResearch.informedByCompanyResearch).toBe(false);
    expect(resultWithoutResearch.overallScore).toBe(78);
    expect(resultWithoutResearch.verdict).toBe('Partial Match');
  });

  it('2. Test with deliberately mismatched input (e.g. CSS animation vs Backend ML)', async () => {
    const mismatchedRepos: RepoInput[] = [
      {
        id: 'repo-3',
        name: 'css-hover-effects',
        description: 'Pure HTML & CSS animation snippets',
        techStack: ['HTML', 'CSS'],
      },
    ];

    const mlJob: JobInput = {
      title: 'Machine Learning Infrastructure Engineer',
      company: 'Neural AI',
      requiredSkills: ['PyTorch', 'C++', 'CUDA', 'Distributed Systems'],
      domain: 'AI/ML',
    };

    const mockAiMismatch = createMockAiClient({
      overallScore: 25,
      verdict: 'Needs Work',
      projectFits: [
        {
          id: 'repo-3',
          projectName: 'css-hover-effects',
          verdict: 'Weak Match',
          verdictColor: 'red',
          reasoning: 'CSS animation project does not demonstrate required PyTorch or CUDA skills.',
        },
      ],
    });

    const result = await evaluateFit({
      repos: mismatchedRepos,
      job: mlJob,
      companyResearch: undefined,
      aiClient: mockAiMismatch,
    });

    expect(result.overallScore).toBeLessThan(50);
    expect(result.verdict).toBe('Needs Work');
    expect(result.projectFits[0].verdictColor).toBe('red');
  });

  it('3. Test with strong match case', async () => {
    const mockAiStrong = createMockAiClient({
      overallScore: 92,
      verdict: 'Strong Match',
      projectFits: [
        {
          id: 'repo-1',
          projectName: 'microservices-dashboard',
          verdict: 'Direct Match',
          verdictColor: 'green',
          reasoning: 'Directly demonstrates React, TypeScript, and FastAPI.',
        },
      ],
    });

    const result = await evaluateFit({
      repos: sampleRepos,
      job: sampleJob,
      companyResearch: 'Standard cloud context',
      aiClient: mockAiStrong,
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.verdict).toBe('Strong Match');
    expect(result.projectFits[0].verdict).toBe('Direct Match');
  });

  it('4. Test structural validity under LLM failure or exception', async () => {
    const failingAiClient = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('API Quota Exceeded / Network Timeout')),
      },
    };

    const result = await evaluateFit({
      repos: sampleRepos,
      job: sampleJob,
      companyResearch: 'Some company research text',
      aiClient: failingAiClient,
    });

    // Should gracefully fallback into valid structural object
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('projectFits');
    expect(result).toHaveProperty('informedByCompanyResearch');
    expect(result.informedByCompanyResearch).toBe(true);
    expect(Array.isArray(result.projectFits)).toBe(true);
    expect(result.disclaimer).toBeDefined();
  });
});
