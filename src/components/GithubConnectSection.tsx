import React, { useState } from 'react';
import { Repo } from '../types';
import { Github, CheckCircle2, Star, GitFork, RefreshCw } from 'lucide-react';

interface GithubConnectSectionProps {
  connectedUser: string | null;
  repos: Repo[];
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}

export const GithubConnectSection: React.FC<GithubConnectSectionProps> = ({
  connectedUser,
  repos,
  onConnect,
  onDisconnect,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = inputValue.trim().replace(/^https?:\/\/github\.com\//, '');
    onConnect(cleanUser || 'alexdev-builds');
  };

  return (
    <section id="step-github" className="w-full py-10 px-4 sm:px-6 lg:px-8 border-b border-[#3D6FB4]/30">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Section Label */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-[#7C93AC]">
            Step 2 — Your GitHub
          </span>
          <div className="h-[1px] flex-1 bg-[#3D6FB4]/30" />
        </div>

        {/* Main Card */}
        <div className="bg-[#10253F] border border-[#3D6FB4] rounded-lg p-6 sm:p-8 space-y-6">
          {!connectedUser ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C93AC]">
                    <Github className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="GitHub username or profile URL (e.g., alexdev-builds)"
                    className="w-full pl-10 pr-4 py-3 bg-[#F2F0E6] text-[#10253F] placeholder-[#7C93AC] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#3D6FB4] hover:bg-[#4b82cb] text-[#F2F0E6] font-body font-semibold px-6 py-3 rounded text-sm transition-colors cursor-pointer shrink-0 flex items-center justify-center space-x-2"
                >
                  <span>Connect</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-body text-[#7C93AC]">
                <span>Tip: You can enter any public username to test the fit analyzer</span>
                <button
                  type="button"
                  onClick={() => onConnect('alexdev-builds')}
                  className="text-[#F2A93B] hover:underline cursor-pointer"
                >
                  Load sample profile @alexdev-builds
                </button>
              </div>
            </form>
          ) : (
            /* Connected State and Repo Grid */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#3D6FB4]/40">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-[#3D6FB4]/20 border border-[#3D6FB4] flex items-center justify-center text-[#F2F0E6]">
                    <Github className="w-5 h-5 text-[#F2A93B]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-data text-base font-bold text-[#F2F0E6]">
                        @{connectedUser}
                      </span>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono-data bg-[#4FA87B]/20 text-[#4FA87B] rounded uppercase font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected</span>
                      </span>
                    </div>
                    <p className="font-body text-xs text-[#7C93AC]">
                      {repos.length} public repositories indexed for code matching
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onDisconnect}
                  className="font-body text-xs text-[#7C93AC] hover:text-[#C4634F] px-3 py-1.5 rounded border border-[#3D6FB4]/50 hover:border-[#C4634F]/50 transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>

              {/* Grid of Repo Cards (2-3 columns) */}
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-[#7C93AC] mb-3">
                  Indexed Projects ({repos.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B]/60 rounded-md p-4 flex flex-col justify-between transition-all duration-200"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h5 className="font-mono-data font-semibold text-sm text-[#F2F0E6] truncate hover:text-[#F2A93B] transition-colors">
                            {repo.name}
                          </h5>
                          {repo.stars !== undefined && (
                            <span className="flex items-center space-x-1 text-[11px] font-mono-data text-[#7C93AC] shrink-0 ml-1">
                              <Star className="w-3 h-3 text-[#F2A93B] fill-[#F2A93B]" />
                              <span>{repo.stars}</span>
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-[#7C93AC] line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      </div>

                      {/* Tech stack tags */}
                      <div className="pt-4 flex flex-wrap gap-1.5">
                        {repo.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-[11px] font-mono-data bg-[#7C93AC]/20 text-[#F2F0E6] border border-[#7C93AC]/30 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
