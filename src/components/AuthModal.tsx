import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
  onAuthSuccess,
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack Software Engineer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'signin') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await registerWithEmail(email, password, name);
      }

      setLoading(false);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      let msg = err.message || 'Authentication failed';

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = activeTab === 'signin'
          ? 'No account found with this email or password is incorrect. Please click "Create Account" tab above to register!'
          : 'Invalid authentication credentials provided.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Click "Sign In" tab above to log in!';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }

      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setLoading(false);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in window was closed before completion.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    if (onAuthSuccess) onAuthSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#10253F] border border-[#3D6FB4] rounded-xl shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7C93AC] hover:text-[#F2F0E6] p-1.5 rounded-lg hover:bg-[#3D6FB4]/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F2A93B]/20 border border-[#F2A93B]/50 text-[#F2A93B] font-display font-bold text-xl mb-1">
            N
          </div>
          <h3 className="font-display font-bold text-2xl text-[#F2F0E6] tracking-tight">
            {activeTab === 'signin' ? 'Welcome back to NextBuild' : 'Create Your NextBuild Account'}
          </h3>
          <p className="font-body text-xs text-[#7C93AC]">
            {activeTab === 'signin'
              ? 'Sign in to access your custom project build plans and recruiter outreach packages.'
              : 'Join student software engineers building proof-backed portfolios tailored to target job postings.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#3D6FB4]/20 p-1 rounded-lg border border-[#3D6FB4]/40 text-xs font-body">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setError(null); }}
            className={`flex-1 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                : 'text-[#7C93AC] hover:text-[#F2F0E6]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-[#F2A93B] text-[#10253F] shadow-sm'
                : 'text-[#7C93AC] hover:text-[#F2F0E6]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#C4634F]/20 border border-[#C4634F]/50 rounded-lg text-xs font-body text-[#F2F0E6] flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C4634F] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div className="space-y-1">
              <label className="block text-xs font-mono-data uppercase font-bold text-[#7C93AC]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#7C93AC]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F2F0E6] text-[#10253F] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-mono-data uppercase font-bold text-[#7C93AC]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#7C93AC]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F2F0E6] text-[#10253F] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono-data uppercase font-bold text-[#7C93AC]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7C93AC]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F2F0E6] text-[#10253F] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
              />
            </div>
          </div>

          {activeTab === 'signup' && (
            <div className="space-y-1">
              <label className="block text-xs font-mono-data uppercase font-bold text-[#7C93AC]">
                Target Career Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F2F0E6] text-[#10253F] border border-[#3D6FB4] rounded font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="AI / ML Platform Engineer">AI / ML Platform Engineer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F2A93B] hover:bg-[#f5b857] text-[#10253F] font-body font-bold rounded-md text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : activeTab === 'signin' ? 'Sign In to NextBuild' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3D6FB4]/30" />
          </div>
          <span className="relative px-3 bg-[#10253F] font-mono-data text-[10px] text-[#7C93AC] uppercase">
            OR
          </span>
        </div>

        {/* Google OAuth & Guest Access */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-[#10253F] border border-[#3D6FB4] hover:border-[#F2A93B] text-[#F2F0E6] font-body font-medium rounded-md text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 bg-transparent text-[#7C93AC] hover:text-[#F2A93B] font-body text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Explore as Guest (No Registration Required)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
