'use client';

import React from 'react';
import katex from 'katex';

interface KaTeXProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KaTeXMath: React.FC<KaTeXProps> = ({ math, block = false, className = '' }) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      return `<span class="text-red-500 font-mono text-xs">${math}</span>`;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Parses a paragraph string containing inline $math$ or block $$math$$ and renders KaTeX spans inline.
 */
export const LatexFormattedText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by $$...$$ or $...$
  const parts: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matchedStr = match[0];
    const isBlock = matchedStr.startsWith('$$') && matchedStr.endsWith('$$');
    const mathContent = isBlock ? matchedStr.slice(2, -2) : matchedStr.slice(1, -1);

    parts.push(
      <KaTeXMath
        key={match.index}
        math={mathContent}
        block={isBlock}
        className={isBlock ? 'my-2 block text-center' : 'mx-0.5'}
      />
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
