import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  activePage: 'landing' | 'intake' | 'results';
  hasAnalyzed: boolean;
  onNavigate: (page: 'landing' | 'intake' | 'results') => void;
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  hasAnalyzed,
  onNavigate,
  onSignInClick,
  onSignUpClick,
}) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="w-full border-b border-[#3D6FB4]/40 bg-[#10253F]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Wordmark */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-8 h-8 rounded border-2 border-[#3D6FB4] bg-[#10253F] flex items-center justify-center text-[#F2A93B] font-display font-bold text-lg">
            N
          </div>
          <span className="font-display font-bold text-xl sm:text-2xl text-[#F2F0E6] tracking-tight">
            NextBuild
          </span>
        </div>

        {/* Center Page Tabs */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-[#3D6FB4]/20 p-1 rounded-lg border border-[#3D6FB4]/40 text-xs font-body">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activePage === 'landing'
                ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                : 'text-[#7C93AC] hover:text-[#F2F0E6]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('intake')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activePage === 'intake'
                ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                : 'text-[#7C93AC] hover:text-[#F2F0E6]'
            }`}
          >
            Intake Form
          </button>
          <button
            type="button"
            onClick={() => onNavigate('results')}
            disabled={!hasAnalyzed}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activePage === 'results'
                ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                : 'text-[#7C93AC] hover:text-[#F2F0E6]'
            }`}
          >
            Build Plan & Results
          </button>
        </div>

        {/* Right side navigation / Auth buttons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#10253F] border border-[#3D6FB4] rounded-full text-xs font-mono-data text-[#F2F0E6]">
                <User className="w-3.5 h-3.5 text-[#F2A93B]" />
                <span className="truncate max-w-[120px]">{currentUser.displayName || currentUser.email}</span>
                {currentUser.isGuest && (
                  <span className="text-[10px] bg-[#F2A93B]/20 text-[#F2A93B] px-1.5 py-0.5 rounded font-bold">
                    GUEST
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="text-[#7C93AC] hover:text-[#C4634F] p-1.5 rounded-lg border border-[#3D6FB4]/50 hover:border-[#C4634F]/50 transition-colors cursor-pointer flex items-center space-x-1 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onSignInClick}
                className="text-[#F2F0E6] hover:text-[#F2A93B] bg-transparent border border-[#3D6FB4] hover:border-[#F2A93B]/50 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded text-sm font-body font-medium transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onSignUpClick}
                className="bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-semibold px-4 py-1.5 sm:px-5 sm:py-2 rounded text-sm transition-colors shadow-sm cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
