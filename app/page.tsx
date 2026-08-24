'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/ui/loader';

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
    <div className="app-shell min-h-screen flex items-center justify-center">
      <Loader size={48} className="text-[#0d3479]" />
    </div>
  );
}
