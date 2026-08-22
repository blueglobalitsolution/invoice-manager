'use client';

import React, { useState } from 'react';
import {
  Folder,
  Sparkles,
  MoreVertical,
  LogOut,
  LogIn,
  UserPlus,
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
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  projectsCount = 0,
  onOpenTemplateBuilder,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

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
        <div className="flex items-center space-x-2.5 px-3 py-2">
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

        <nav className="space-y-1 px-1">
          <button
            onClick={() => handleTabClick('all')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>All Projects</span>
            {projectsCount > 0 && (
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
                {projectsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('your')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'your'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="w-4"></span>
            <span>Active Projects</span>
          </button>

          <button
            onClick={() => handleTabClick('archived')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="w-4"></span>
            <span>Archived Projects</span>
          </button>

          <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
            {onOpenTemplateBuilder && (
              <button
                onClick={onOpenTemplateBuilder}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-gray-500" />
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
