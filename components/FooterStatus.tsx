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
    <footer className="h-6 bg-[#f7f7f2] border-t border-[#cccccc] flex items-center justify-between px-4 text-[10px] text-[#666666] uppercase font-mono shrink-0 z-10 select-none print:hidden">
      <div className="flex items-center space-x-4">
        <span>WORDS: <strong className="text-[#0d3479] font-bold">{wordCount || 18}</strong></span>
        <span>SECTIONS: <strong className="text-[#0d3479] font-bold">{doc.sections.length}</strong></span>
      </div>

      <div className="flex items-center space-x-4 text-[10px]">
        <span className="flex items-center space-x-1.5 text-[#555555]">
          <span>AUTO-SAVE: ON</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.6)]"></span>
        </span>
        <span className="flex items-center space-x-1.5 text-[#555555]">
          <span>REAL-TIME SYNC</span>
          <svg className="w-3.5 h-3.5 text-[#0d3479]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
        </span>
      </div>
    </footer>
  );
};
