'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'forgot_sent'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address format (e.g. user@example.com).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      const userName = email.split('@')[0] || 'User';
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      onLoginSuccess({ name: formattedName, email });
    } else if (mode === 'signup') {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address format (e.g. user@example.com).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long (minimum 6 required).');
        return;
      }
      onLoginSuccess({ name, email });
    } else if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your account email address.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address format.');
        return;
      }
      setMode('forgot_sent');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b1320] flex flex-col justify-center items-center p-4 sm:p-6 text-gray-200 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-[#161c26] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Brand header */}
        <div className="bg-[#101722] px-8 py-8 border-b border-gray-800 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center font-serif text-white font-bold text-2xl shadow-lg mb-3">
            6
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            {mode === 'login' && 'Sign in to Overleaf'}
            {mode === 'signup' && 'Create your Overleaf Account'}
            {mode === 'forgot' && 'Reset your Password'}
            {mode === 'forgot_sent' && 'Check your Inbox'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Professional Collaborative LaTeX SaaS Suite</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center space-x-3 text-xs text-red-300 shadow-inner">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'forgot_sent' ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-white">Reset link sent successfully</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                We have sent password reset instructions to <strong className="text-gray-200">{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button
                onClick={() => setMode('login')}
                className="mt-6 w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1e2633] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1e2633] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-300">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1e2633] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  {mode === 'signup' && (
                    <p className="text-[11px] text-gray-400 mt-1">Must be at least 6 characters long.</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-3 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all cursor-pointer tracking-wide"
              >
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Free Account'}
                {mode === 'forgot' && 'Send Password Reset Link'}
              </button>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@admin.com');
                    setPassword('admin@123');
                    setError('');
                  }}
                  className="w-full py-2 bg-[#1e2633] hover:bg-gray-700 text-gray-300 text-xs rounded-xl border border-gray-700/80 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <span>Quick Fill: admin@admin.com / admin@123</span>
                </button>
              )}

              {/* Mode switch footer */}
              <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
                {mode === 'login' && (
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError('');
                      }}
                      className="text-emerald-400 font-semibold hover:underline"
                    >
                      Sign up for free
                    </button>
                  </p>
                )}
                {mode === 'signup' && (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                      }}
                      className="text-emerald-400 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="inline-flex items-center space-x-1.5 text-emerald-400 font-semibold hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
