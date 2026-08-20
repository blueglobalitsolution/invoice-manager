'use client';

import React from 'react';
import { LatexDocument } from '@/types/document';

interface FooterStatusProps {
  document: LatexDocument;
}

export const FooterStatus: React.FC<FooterStatusProps> = ({ document: doc }) => {
  // Calculate approximate word count
  const wordCount = React.useMemo(() => {
    let words = 0;
    words += (doc.title || '').split(/\s+/).filter(Boolean).length;
    words += (doc.abstract || '').split(/\s+/).filter(Boolean).length;
    doc.sections.forEach((sec) => {
      words += (sec.title || '').split(/\s+/).filter(Boolean).length;
      sec.subsections.forEach((sub) => {
        words += (sub.title || '').split(/\s+/).filter(Boolean).length;
        words += (sub.body || '').split(/\s+/).filter(Boolean).length;
        sub.bullets?.forEach((b) => {
          words += b.split(/\s+/).filter(Boolean).length;
        });
      });
    });
    return words;
  }, [doc]);

  return (
    <footer className="h-6 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-[10px] text-gray-500 uppercase font-medium shrink-0 z-10 select-none">
      <div className="flex items-center space-x-4">
        <span>Words: <strong className="text-gray-800">{wordCount}</strong></span>
        <span>Sections: <strong className="text-gray-800">{doc.sections.length}</strong></span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-gray-600">Auto-save: Real-time Live Sync</span>
      </div>
    </footer>
  );
};
