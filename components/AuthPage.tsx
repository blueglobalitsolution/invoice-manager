'use client';

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import Beams from './Beams';

interface AuthPageProps {
  initialMode: 'login' | 'signup' | 'forgot';
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'forgot_sent'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address format.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Invalid credentials');
          setIsLoading(false);
          return;
        }
        onLoginSuccess(data);
      } catch (err) {
        setError('Connection failed. Server might be down.');
        setIsLoading(false);
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address format.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to sign up');
          setIsLoading(false);
          return;
        }
        onLoginSuccess(data);
      } catch (err) {
        setError('Connection failed. Server might be down.');
        setIsLoading(false);
      }
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#030917] via-[#071738] to-[#0a2355] flex items-center justify-center md:justify-start p-4 md:p-12 lg:p-20 overflow-hidden select-none font-sans">
      
      {/* 3D BEAMS CANVAS ANIMATION IN BACKGROUND WITH OPPOSITE DIAGONAL (+38 DEG) */}
      <div className="absolute inset-0 pointer-events-none">
        <Beams
          beamNumber={20}
          beamWidth={2.4}
          beamHeight={32}
          rotation={38}
          speed={2}
          lightColor="#60a5fa"
          beamColor="#0d3479"
        />
      </div>

      {/* FLOATING SIGN IN CARD ON THE RIGHT */}
      <div className="relative z-20 w-full max-w-[440px] bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/80 transition-all">
        
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            {mode === 'login' && 'Sign in'}
            {mode === 'signup' && 'Create account'}
            {mode === 'forgot' && 'Reset password'}
            {mode === 'forgot_sent' && 'Check inbox'}
          </h1>
        </div>

        {/* Form Body */}
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700 shadow-2xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {mode === 'forgot_sent' ? (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                We have sent password reset instructions to <strong className="text-black">{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button
                onClick={() => setMode('login')}
                className="w-full bg-[#0d3479] hover:bg-[#123f8f] text-white py-3 rounded-xl text-xs font-bold transition-all mt-2 cursor-pointer shadow-md"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mohammad Kamil"
                      className="w-full bg-slate-50/90 border border-slate-200 text-black rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0d3479] focus:bg-white focus:ring-2 focus:ring-[#0d3479]/15 transition-all shadow-2xs font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamil@globalindustries.co"
                    className="w-full bg-slate-50/90 border border-slate-200 text-black rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0d3479] focus:bg-white focus:ring-2 focus:ring-[#0d3479]/15 transition-all shadow-2xs font-medium"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                        }}
                        className="text-[11px] font-semibold text-[#0d3479] hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50/90 border border-slate-200 text-black rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0d3479] focus:bg-white focus:ring-2 focus:ring-[#0d3479]/15 transition-all shadow-2xs font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0d3479] hover:bg-[#123f8f] active:scale-[0.99] text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md mt-2 disabled:opacity-70"
              >
                <span>
                  {isLoading
                    ? 'Processing...'
                    : mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Instructions'}
                </span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}
        </div>

        {/* Footer Switching Links */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs text-center text-slate-600">
          {mode === 'login' && (
            <p>
              First time here?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-[#0d3479] font-bold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-[#0d3479] font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="text-[#0d3479] font-bold hover:underline inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
