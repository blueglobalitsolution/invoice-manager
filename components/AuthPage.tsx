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
  HelpCircle,
  Sparkles,
  Layers,
  FileCheck2,
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

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Invalid credentials');
          return;
        }
        onLoginSuccess(data);
      } catch (err) {
        setError('Connection failed. Server might be down.');
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

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to sign up');
          return;
        }
        onLoginSuccess(data);
      } catch (err) {
        setError('Connection failed. Server might be down.');
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
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden select-none font-sans">
      
      {/* LEFT PANEL - GLOWING 3D BEAMS CANVAS BACKDROP WITH DIVIDER BORDER */}
      <div className="hidden md:block md:w-1/2 bg-[#090d16] relative overflow-hidden border-r border-gray-800 shrink-0">
        <Beams beamNumber={13} speed={2} lightColor="#ffffff" />
      </div>

      {/* RIGHT PANEL - RICH DARK SIGN IN FORM */}
      <div className="w-full md:w-1/2 bg-[#000000] p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center relative min-h-[500px] shrink-0">
        
        <div className="w-full max-w-md flex flex-col justify-between h-full py-4">
          
          {/* Header Title */}
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
              {mode === 'login' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'forgot' && 'Reset password'}
              {mode === 'forgot_sent' && 'Check inbox'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {mode === 'login' && 'Welcome back.'}
              {mode === 'signup' && 'Get started in seconds.'}
              {mode === 'forgot' && 'Enter your email to verify.'}
              {mode === 'forgot_sent' && 'Recovery link dispatched.'}
            </p>
          </div>

          {/* Form Content */}
          <div className="mt-8 flex-1">
            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center space-x-2 text-xs text-red-400 shadow-inner">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'forgot_sent' ? (
              <div className="py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  We have sent password reset instructions to <strong className="text-white">{email}</strong>. Check your inbox and spam folder.
                </p>
                <button
                  onClick={() => setMode('login')}
                  className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-[#121212] border border-gray-800 text-white rounded-xl px-4 py-3 text-xs placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
                      required
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work email"
                    className="w-full bg-[#121212] border border-gray-800 text-white rounded-xl px-4 py-3 text-xs placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
                    required
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[#121212] border border-gray-800 text-white rounded-xl px-4 py-3 text-xs placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
                      required
                    />
                  </div>
                )}

                {/* Sign In CTA Button */}
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-gray-100 text-black py-3.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <span>
                    {mode === 'login' && 'Sign in'}
                    {mode === 'signup' && 'Create account'}
                    {mode === 'forgot' && 'Send instructions'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Forgot password link */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}


              </form>
            )}
          </div>

          {/* Form Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-900 text-xs text-center">
            {mode === 'login' && (
              <p className="text-gray-400">
                First time here?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-white font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-white font-semibold hover:underline"
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
                className="text-gray-400 hover:text-white inline-flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
            )}
          </div>



        </div>

      </div>

    </div>
  );
};
