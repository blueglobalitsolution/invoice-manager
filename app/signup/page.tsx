'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthPage } from '@/components/AuthPage';

export default function SignupPage() {
  const router = useRouter();

  const handleSignupSuccess = (user: { name: string; email: string }) => {
    localStorage.setItem('latex_user', JSON.stringify(user));
    router.push('/dashboard');
  };

  return (
    <AuthPage
      initialMode="signup"
      onLoginSuccess={handleSignupSuccess}
    />
  );
}
