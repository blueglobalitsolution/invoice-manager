'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { generateLatexCode } from '@/lib/latex-generator';
import { downloadLatexFile } from '@/lib/tex-export';
import { LatexDocument } from '@/types/document';

interface TexCodePreviewProps {
  document: LatexDocument;
  onExportTex?: () => void;
}

export const TexCodePreview: React.FC<TexCodePreviewProps> = ({ document: doc, onExportTex }) => {
  const [copied, setCopied] = useState(false);
  const texCode = React.useMemo(() => generateLatexCode(doc), [doc]);

  const handleCopy = () => {
    navigator.clipboard.writeText(texCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onExportTex) {
      onExportTex();
    } else {
      downloadLatexFile(doc);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E] text-gray-200 overflow-hidden font-mono text-xs">
      {/* Code Header Bar */}
      <div className="h-10 bg-[#252526] px-4 flex items-center justify-between border-b border-[#333333] shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-gray-300 text-xs">main.tex (Generated LaTeX Source)</span>
          <span className="text-[10px] bg-[#333333] text-blue-300 px-2 py-0.5 rounded font-mono">
            {texCode.split('\n').length} lines
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-[#333333] hover:bg-[#444444] text-gray-200 rounded text-xs font-sans font-medium flex items-center space-x-1 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-2.5 py-1 bg-[#3182CE] hover:bg-[#2B6CB0] text-white rounded text-xs font-sans font-bold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .tex</span>
          </button>
        </div>
      </div>

      {/* Code View Body */}
      <div className="flex-1 overflow-auto p-4 leading-relaxed font-mono selection:bg-blue-600 selection:text-white">
        <pre className="text-[12px] text-gray-300 whitespace-pre">
          {texCode.split('\n').map((line, idx) => (
            <div key={idx} className="flex hover:bg-[#2A2D2E]">
              <span className="w-10 select-none text-right pr-4 text-gray-600 font-mono text-[11px]">
                {idx + 1}
              </span>
              <span className="flex-1">
                {line.startsWith('%') ? (
                  <span className="text-emerald-500">{line}</span>
                ) : line.startsWith('\\') ? (
                  <span className="text-blue-400">{line}</span>
                ) : (
                  line
                )}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
