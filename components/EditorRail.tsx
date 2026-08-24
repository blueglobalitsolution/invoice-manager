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
} from 'lucide-react';

interface EditorRailProps {
  activeTab: 'filetree' | 'header_footer' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings';
  setActiveTab: (tab: 'filetree' | 'header_footer' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings') => void;
  onOpenSettings: () => void;
  onOpenGlobalVariables?: () => void;
  onOpenTemplates?: () => void;
  onOpenLatexCode?: () => void;
  onGoBackToDashboard: () => void;
}

export const EditorRail: React.FC<EditorRailProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenGlobalVariables,
  onOpenTemplates,
  onOpenLatexCode,
}) => {
  return (
    <div className="w-12 bg-[#070c18] border-r border-[#141f33] flex flex-col justify-between items-center py-2.5 shrink-0 z-30 select-none">
      {/* Top Rail Navigation Icons */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        {/* Document Pages & Sections Icon */}
        <button
          onClick={() => setActiveTab('filetree')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative cursor-pointer ${
            activeTab === 'filetree'
              ? 'bg-[#0d3479] text-white shadow border border-[#2563eb]/40'
              : 'text-slate-400 hover:text-white hover:bg-[#0d1728]'
          }`}
          title="Document Outline & Sections"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Dedicated Header & Footer Icon */}
        <button
          onClick={() => setActiveTab('header_footer')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative cursor-pointer ${
            activeTab === 'header_footer'
              ? 'bg-[#0d3479] text-white shadow border border-[#2563eb]/40'
              : 'text-slate-400 hover:text-white hover:bg-[#0d1728]'
          }`}
          title="Header & Footer Configuration"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>

        {/* Global Variables & Placeholders Icon */}
        <button
          onClick={() => {
            if (onOpenGlobalVariables) {
              onOpenGlobalVariables();
            } else {
              setActiveTab('variables');
            }
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative cursor-pointer ${
            activeTab === 'variables'
              ? 'bg-[#0d3479] text-white shadow border border-[#2563eb]/40'
              : 'text-slate-400 hover:text-white hover:bg-[#0d1728]'
          }`}
          title="Global Variables & Placeholders ({{CLIENT_NAME}})"
        >
          <Braces className="w-4 h-4" />
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
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'bg-[#0d3479] text-white shadow border border-[#2563eb]/40'
              : 'text-sky-400 hover:text-sky-200 hover:bg-[#0d1728]'
          }`}
          title="View & Export LaTeX Source Code (.tex)"
        >
          <FileCode className="w-4 h-4" />
        </button>

        {/* Media / Figures */}
        <button
          onClick={() => setActiveTab('media')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'media'
              ? 'bg-[#0d3479] text-white shadow border border-[#2563eb]/40'
              : 'text-slate-400 hover:text-white hover:bg-[#0d1728]'
          }`}
          title="Figures and Images"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Rail Icons: Settings Gear */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-[#0d1728] flex items-center justify-center transition-colors cursor-pointer"
          title="Project Settings & Formatting"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
