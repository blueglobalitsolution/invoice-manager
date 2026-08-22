import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contracti',
  description: 'Enterprise Collaborative Contract & LaTeX Builder.',
  openGraph: {
    title: 'Contracti',
    description: 'Enterprise Collaborative Contract & LaTeX Builder.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contracti',
    description: 'Enterprise Collaborative Contract & LaTeX Builder.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
