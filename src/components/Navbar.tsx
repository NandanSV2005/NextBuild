import React from 'react';

interface NavbarProps {
  onGetStartedClick: () => void;
  onSignInClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGetStartedClick, onSignInClick }) => {
  return (
    <header className="w-full border-b border-[#3D6FB4]/40 bg-[#10253F]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Wordmark */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border-2 border-[#3D6FB4] bg-[#10253F] flex items-center justify-center text-[#F2A93B] font-display font-bold text-lg">
            N
          </div>
          <span className="font-display font-bold text-xl sm:text-2xl text-[#F2F0E6] tracking-tight">
            NextBuild
          </span>
        </div>

        {/* Right side navigation buttons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            onClick={onSignInClick}
            className="text-[#F2F0E6] hover:text-[#F2A93B] bg-transparent border border-[#3D6FB4] hover:border-[#F2A93B]/50 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded text-sm font-body font-medium transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onGetStartedClick}
            className="bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-semibold px-4 py-1.5 sm:px-5 sm:py-2 rounded text-sm transition-colors shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};
