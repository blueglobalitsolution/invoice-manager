'use client';

import React from 'react';
import {
  FileText,
  LayoutTemplate,
  Braces,
  Image as ImageIcon,
  Settings,
  BookOpen,
  FileCode,
  Plus,
} from 'lucide-react';

interface EditorRailProps {
  activeTab: 'filetree' | 'header_footer' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings';
  setActiveTab: (tab: 'filetree' | 'header_footer' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings') => void;
  onOpenSettings: () => void;
  onOpenGlobalVariables?: () => void;
  onOpenTemplates?: () => void;
  onOpenLatexCode?: () => void;
  onOpenAddSection?: () => void;
  isInvoice?: boolean;
  onGoBackToDashboard: () => void;
}

export const EditorRail: React.FC<EditorRailProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenGlobalVariables,
  onOpenTemplates,
  onOpenLatexCode,
  onOpenAddSection,
  isInvoice = false,
}) => {
  return (
    <div className="w-14 bg-[#002057] border-r border-[#15428a] flex flex-col justify-between items-center py-3.5 shrink-0 relative z-50 select-none">
      {/* Top Rail Navigation Icons */}
      <div className="flex flex-col items-center space-y-3.5 w-full">
        {/* Document Pages & Sections Icon (Hidden on Invoice) */}
        {!isInvoice && (
          <button
            onClick={() => setActiveTab('filetree')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative cursor-pointer ${
              activeTab === 'filetree'
                ? 'bg-white text-[#002057] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Document Outline & Sections"
          >
            <FileText className="w-5 h-5" />
          </button>
        )}

        {/* Dedicated Add / Select Section Preset Button (Hidden on Invoice) */}
        {!isInvoice && onOpenAddSection && (
          <button
            onClick={onOpenAddSection}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-xs active:scale-95 group"
            title="Add Pre-defined Section Preset"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        )}

        {/* Dedicated Header & Footer Icon */}
        <button
          onClick={() => setActiveTab('header_footer')}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative cursor-pointer ${
            activeTab === 'header_footer'
              ? 'bg-white text-[#002057] shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Header & Footer Configuration"
        >
          <LayoutTemplate className="w-5 h-5" />
        </button>

        {/* LaTeX Code Viewer */}
        <button
          onClick={() => {
            if (onOpenLatexCode) {
              onOpenLatexCode();
            } else {
              setActiveTab('code');
            }
          }}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'code'
              ? 'bg-white text-[#002057] shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="View & Export LaTeX Source Code (.tex)"
        >
          <FileCode className="w-5 h-5" />
        </button>

        {/* Media / Figures */}
        <button
          onClick={() => setActiveTab('media')}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'bg-white text-[#002057] shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Figures and Images"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
