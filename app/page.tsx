'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('latex_user');
    if (storedUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-[32px] px-8 py-7 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#0d3479]">
          Contracti
        </p>
        <h1 className="mt-3 text-[30px] leading-[1]">
          Initializing your document workspace
        </h1>
        <p className="mt-3 text-sm text-[#666666]">
          Turning project details into polished contracts and export-ready documents.
        </p>
      </div>
    </div>
  );
}
