'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  Sparkles,
  Maximize2,
  Minimize2,
  Terminal,
} from 'lucide-react';
import { LatexDocument } from '@/types/document';
import { generateLatexCode } from '@/lib/latex-generator';
import { downloadLatexFile } from '@/lib/tex-export';
import { CompanyProfile } from '@/types/project';

interface TexCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LatexDocument;
  companyProfile?: CompanyProfile;
}

export const TexCodeModal: React.FC<TexCodeModalProps> = ({ isOpen, onClose, document: doc, companyProfile }) => {
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const texCode = useMemo(() => generateLatexCode(doc, companyProfile), [doc, companyProfile]);
  const lines = useMemo(() => texCode.split('\n'), [texCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(texCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    downloadLatexFile(doc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`bg-white border border-[#cccccc] rounded-xl shadow-2xl flex flex-col overflow-hidden text-black transition-all duration-200 ${
          isMaximized
            ? 'w-full h-full max-w-none rounded-none'
            : 'w-full max-w-4xl h-[88vh] max-h-[900px]'
        }`}
      >
        {/* Modal Header */}
        <div className="h-12 bg-[#f0efe6] px-4 flex items-center justify-between border-b border-[#cccccc] shrink-0 select-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479]">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-black">LaTeX Source Code</span>
                <span className="text-[10px] bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de] px-2 py-0.5 rounded font-mono font-bold">
                  {lines.length} lines
                </span>
                <span className="text-[10px] bg-white text-[#666666] border border-[#cccccc] px-2 py-0.5 rounded font-mono">
                  {texCode.length.toLocaleString()} chars
                </span>
              </div>
              <p className="text-[11px] text-[#666666] truncate max-w-[280px] sm:max-w-md">
                {doc.title || 'Document'}.tex • Standard LaTeX Compiler compatible
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0d3479] hover:bg-[#123f8f] text-white shadow-sm'
              }`}
              title="Copy LaTeX source to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy LaTeX</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Download standalone .tex file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download .tex</span>
            </button>

            {/* Maximize Toggle */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-[#666666] hover:text-black hover:bg-white rounded-md transition-colors cursor-pointer border border-transparent hover:border-[#cccccc]"
              title={isMaximized ? 'Restore window' : 'Maximize window'}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#666666] hover:text-black hover:bg-white rounded-md transition-colors cursor-pointer border border-transparent hover:border-[#cccccc]"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content Area with Line Numbers and Highlighting */}
        <div className="flex-1 overflow-auto bg-[#18181b] p-4 font-mono text-[13px] leading-relaxed select-text">
          <pre className="text-gray-300 font-mono">
            {lines.map((line, idx) => {
              const trimmed = line.trim();
              const isComment = trimmed.startsWith('%');
              const isCommand = trimmed.startsWith('\\');
              const isBeginEnd = trimmed.startsWith('\\begin') || trimmed.startsWith('\\end');

              return (
                <div
                  key={idx}
                  className="flex hover:bg-[#1f1f23] transition-colors py-[1px] rounded"
                >
                  <span className="w-12 select-none text-right pr-4 text-gray-600 font-mono text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 break-all">
                    {isComment ? (
                      <span className="text-emerald-400 italic">{line}</span>
                    ) : isBeginEnd ? (
                      <span className="text-amber-300 font-semibold">{line}</span>
                    ) : isCommand ? (
                      <span className="text-sky-300">{line}</span>
                    ) : (
                      <span className="text-gray-200">{line}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Modal Footer Info */}
        <div className="h-9 bg-[#f0efe6] px-4 border-t border-[#cccccc] flex items-center justify-between text-[11px] text-[#666666] shrink-0 font-medium">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-[#0d3479]" />
              <span>TeX Engine: pdfLaTeX / XeLaTeX compatible</span>
            </span>
            <span>•</span>
            <span>Packages: geometry, xcolor, tabularx, enumitem</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Encoding: UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
