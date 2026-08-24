'use client';

import React, { useState } from 'react';
import {
  Folder,
  Sparkles,
  MoreVertical,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export type DashboardTab = 'all' | 'your' | 'archived' | 'shared' | 'starred';

interface DashboardSidebarProps {
  activeTab?: DashboardTab;
  setActiveTab?: (tab: DashboardTab) => void;
  projectsCount?: number;
  onOpenTemplateBuilder?: () => void;
  currentUser: { name: string; email: string } | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  projectId?: string;
  projectName?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  projectsCount = 0,
  onOpenTemplateBuilder,
  currentUser,
  onOpenAuth,
  onLogout,
  projectId,
  projectName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  const handleTabClick = (tab: DashboardTab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      // If we are outside the dashboard (e.g. in project detail view), go back to dashboard
      if (pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    }
  };

  return (
    <aside className="hidden lg:flex w-64 bg-[#002057] border-r border-[#15428a] flex-col justify-between shrink-0 p-4 h-screen select-none text-white">
      <div className="space-y-6">
        {projectId ? (
          <div className="px-3 py-2 space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors text-sm font-medium cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </div>
              <span>Back to Dashboard</span>
            </button>
            <div className="pt-2">
              <div className="text-[10px] text-white/60 font-medium tracking-wider uppercase">
                Project Name
              </div>
              <div className="font-bold text-sm tracking-tight text-white truncate mt-0.5" title={projectName}>
                {projectName || 'Unnamed Project'}
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2.5 px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#002057] font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight leading-none text-white">
                Contracti
              </div>
              <div className="text-[10px] text-white/70 font-semibold tracking-wider mt-1 uppercase">
                Enterprise Builder
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-1 px-1">
          {!projectId && (
            <div className="flex flex-col">
              <button
                onClick={() => {
                  handleTabClick('all');
                  setIsProjectsExpanded(!isProjectsExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-white bg-white/15 shadow-xs font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Folder className="w-4 h-4 text-white" strokeWidth={2} />
                  <span className="text-[13px]">
                    All Projects
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {projectsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-semibold">
                      {projectsCount}
                    </span>
                  )}
                  {isProjectsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/70" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/70" strokeWidth={2} />
                  )}
                </div>
              </button>

              {isProjectsExpanded && (
                <div className="flex flex-col relative ml-[21px] pl-4 mt-1 space-y-1 border-l border-white/20 py-1">
                  <button
                    onClick={() => handleTabClick('your')}
                    className={`w-full text-left text-[13px] py-1.5 transition-colors cursor-pointer ${
                      activeTab === 'your'
                        ? 'font-bold text-white'
                        : 'text-white/75 hover:text-white font-medium'
                    }`}
                  >
                    Active Projects
                  </button>

                  <button
                    onClick={() => handleTabClick('archived')}
                    className={`w-full text-left text-[13px] py-1.5 transition-colors cursor-pointer ${
                      activeTab === 'archived'
                        ? 'font-bold text-white'
                        : 'text-white/75 hover:text-white font-medium'
                    }`}
                  >
                    Archived Projects
                  </button>
                </div>
              )}
            </div>
          )}

          {projectId && (
            <div className="pt-4 mt-4 border-t border-white/15 space-y-1">
              <div className="px-3 text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">
                Project Settings
              </div>
              <button
                onClick={() => router.push(`/project/${projectId}/company-profile`)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center border border-white/30 rounded bg-white/10 text-[9px] font-bold text-white">H/F</div>
                <span>Header & Footer</span>
              </button>
            </div>
          )}

          <div className="pt-3 mt-3 border-t border-white/15 space-y-1">
            {onOpenTemplateBuilder && (
              <button
                onClick={onOpenTemplateBuilder}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white/80" strokeWidth={1.75} />
                <span>Template Builder</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-white/15 space-y-1 px-1">
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-7 h-7 rounded-full bg-white text-[#002057] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm font-medium text-white">{currentUser.name}</span>
              </div>
              <MoreVertical className="w-4 h-4 text-white/70 shrink-0" />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-[#0a234f] border border-white/20 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/15">
                  <p className="font-semibold text-sm text-white truncate">{currentUser.name}</p>
                  <p className="text-xs text-white/70 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-600/30 text-rose-300 flex items-center space-x-2 transition-colors text-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-white text-[#002057] hover:bg-white/90 rounded-lg font-bold transition-colors cursor-pointer text-sm shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
