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

export type DashboardTab = 'all' | 'your' | 'archived' | 'shared';

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
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col justify-between shrink-0 p-4 h-screen">
      <div className="space-y-6">
        {projectId ? (
          <div className="px-3 py-2 space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </div>
              <span>Back to Dashboard</span>
            </button>
            <div className="pt-2">
              <div className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">
                Project Name
              </div>
              <div className="font-bold text-sm tracking-tight text-gray-900 truncate" title={projectName}>
                {projectName || 'Unnamed Project'}
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2.5 px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight leading-none text-gray-900">
                Contracti
              </div>
              <div className="text-[10px] text-gray-500 font-medium tracking-tight mt-1 uppercase">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-gray-900 bg-gray-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Folder className={`w-4 h-4 ${activeTab === 'all' ? 'text-gray-800' : 'text-gray-600'}`} strokeWidth={1.75} />
                  <span className={`text-[13px] ${activeTab === 'all' ? 'font-semibold' : 'font-medium'}`}>
                    All Projects
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {projectsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500 font-medium">
                      {projectsCount}
                    </span>
                  )}
                  {isProjectsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  )}
                </div>
              </button>

              {isProjectsExpanded && (
                <div className="flex flex-col relative ml-[21px] pl-4 mt-1 space-y-1 border-l border-gray-200 py-1">
                  <button
                    onClick={() => handleTabClick('your')}
                    className={`w-full text-left text-[13px] py-1.5 transition-colors cursor-pointer ${
                      activeTab === 'your'
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 font-medium'
                    }`}
                  >
                    Active Projects
                  </button>

                  <button
                    onClick={() => handleTabClick('archived')}
                    className={`w-full text-left text-[13px] py-1.5 transition-colors cursor-pointer ${
                      activeTab === 'archived'
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 font-medium'
                    }`}
                  >
                    Archived Projects
                  </button>
                </div>
              )}
            </div>
          )}

          {projectId && (
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
              <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Project Settings
              </div>
              <button
                onClick={() => router.push(`/project/${projectId}/company-profile`)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center border border-gray-400 rounded text-[10px] font-bold text-gray-500">H/F</div>
                <span>Header & Footer</span>
              </button>
            </div>
          )}

          <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
            {onOpenTemplateBuilder && (
              <button
                onClick={onOpenTemplateBuilder}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-[13px] text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
                <span>Template Builder</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-gray-200 space-y-1 px-1">
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm font-medium">{currentUser.name}</span>
              </div>
              <MoreVertical className="w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-sm text-gray-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 transition-colors text-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium transition-colors cursor-pointer text-sm"
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
