'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Undo2,
  Redo2,
  Folder,
  FileSpreadsheet,
  FileCheck,
  Package,
  Receipt,
  Layers,
  FileText,
  Plus,
  ChevronRight,
  Code2,
  FileCode,
} from 'lucide-react';
import { LatexDocument } from '@/types/document';
import { ProjectItem, ProjectDocType } from '@/types/project';

interface HeaderProps {
  document: LatexDocument;
  onExportPdf: () => void;
  isRecompiling?: boolean;
  onRecompile?: () => void;
  onGoBackToDashboard?: () => void;
  onOpenSettings?: () => void;
  currentUser: { name: string; email: string } | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  project?: ProjectItem;
  activeDocumentId?: string;
  onSelectDocument?: (docId: string) => void;
  onOpenProjectDetail?: () => void;
  onOpenAddDocumentModal?: () => void;
  onOpenLatexCode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  document,
  onExportPdf,
  isRecompiling = false,
  onRecompile,
  onGoBackToDashboard,
  currentUser,
  onOpenAuth,
  onLogout,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  project,
  activeDocumentId,
  onSelectDocument,
  onOpenProjectDetail,
  onOpenAddDocumentModal,
  onOpenLatexCode,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDocSwitcherOpen, setIsDocSwitcherOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsDocSwitcherOpen(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, []);

  const getDocTypeIcon = (type?: ProjectDocType) => {
    switch (type) {
      case 'quotation':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />;
      case 'work_order':
        return <FileCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'purchase_order':
        return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case 'invoice':
        return <Receipt className="w-3.5 h-3.5 text-rose-400" />;
      case 'technical_specs':
        return <Layers className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const projectDocs = project?.documents || [];
  const currentDocItem = projectDocs.find((d) => d.id === activeDocumentId);

  return (
    <header className="h-11 bg-[#0b1320] flex items-center justify-between px-3 shrink-0 shadow-md z-20 border-b border-gray-800 text-xs text-gray-200 select-none">
      {/* Left Brand & Breadcrumbs & History */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Brand Icon */}
        <button
          onClick={onGoBackToDashboard}
          className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-gray-800 transition-colors font-bold text-white group cursor-pointer"
          title="Back to All Projects"
        >
          <div className="w-5 h-5 rounded-full bg-[#15803d] flex items-center justify-center font-serif text-white font-bold text-xs">
            6
          </div>
          <span className="font-semibold text-white hidden sm:inline text-xs">Projects</span>
        </button>

        {/* Project Breadcrumb if inside project */}
        {project && (
          <div className="flex items-center space-x-1 text-gray-400 text-[11px] hidden sm:flex">
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <button
              onClick={onOpenProjectDetail || onGoBackToDashboard}
              className="hover:text-emerald-400 text-gray-300 font-semibold truncate max-w-[140px] md:max-w-[200px] transition-colors cursor-pointer"
              title="Open Project Dossier"
            >
              {project.title}
            </button>
          </div>
        )}

        {/* Document Switcher Dropdown */}
        {project && projectDocs.length > 0 && (
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setIsDocSwitcherOpen(!isDocSwitcherOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#151f30] hover:bg-[#1c2940] border border-gray-700/80 rounded-md text-gray-200 transition-colors cursor-pointer text-xs font-semibold"
            >
              {getDocTypeIcon(currentDocItem?.docType)}
              <span className="truncate max-w-[130px] md:max-w-[180px] text-white">
                {currentDocItem?.title || document.title}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isDocSwitcherOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-[#16202f] border border-gray-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-gray-700/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Project Documents
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {projectDocs.length} total
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {projectDocs.map((doc) => {
                    const isCurrent = doc.id === activeDocumentId;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => {
                          if (onSelectDocument) onSelectDocument(doc.id);
                          setIsDocSwitcherOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start space-x-2 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-emerald-950/60 text-white' : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{getDocTypeIcon(doc.docType)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs truncate">{doc.title}</div>
                          <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                            <span className="font-mono">{doc.docNumber}</span>
                            {doc.amount && <span>• {doc.amount}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {onOpenAddDocumentModal && (
                  <div className="pt-1 border-t border-gray-700/60">
                    <button
                      onClick={() => {
                        setIsDocSwitcherOpen(false);
                        onOpenAddDocumentModal();
                      }}
                      className="w-full text-left px-3 py-2 text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Document to Project</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Undo & Redo History Action Buttons */}
        <div className="flex items-center bg-[#151f2e] border border-gray-700/70 rounded p-0.5 space-x-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-2 py-1 rounded flex items-center space-x-1 text-xs font-medium transition-colors ${
              canUndo
                ? 'hover:bg-gray-700 text-emerald-300 hover:text-white cursor-pointer active:scale-95'
                : 'text-gray-600 opacity-40 cursor-not-allowed'
            }`}
            title="Undo last change (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Undo</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`px-2 py-1 rounded flex items-center space-x-1 text-xs font-medium transition-colors ${
              canRedo
                ? 'hover:bg-gray-700 text-emerald-300 hover:text-white cursor-pointer active:scale-95'
                : 'text-gray-600 opacity-40 cursor-not-allowed'
            }`}
            title="Redo change (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Redo</span>
          </button>
        </div>
      </div>

      {/* Right Action Buttons & User Profile */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* View LaTeX Code Button */}
        {onOpenLatexCode && (
          <button
            onClick={onOpenLatexCode}
            className="bg-[#1e293b] hover:bg-[#334155] border border-gray-700 hover:border-gray-500 text-sky-300 hover:text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="View and Export LaTeX Source Code (.tex)"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">LaTeX Code</span>
          </button>
        )}

        <button
          onClick={() => {
            if (onRecompile) onRecompile();
            onExportPdf();
          }}
          disabled={isRecompiling}
          className="bg-[#15803d] hover:bg-[#16a34a] active:scale-[0.98] text-white px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
          title="Recompile LaTeX & Download PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{isRecompiling ? 'Compiling...' : 'Recompile'}</span>
        </button>

        {/* User profile / Auth menu */}
        <div className="relative ml-2" ref={menuRef}>
          {currentUser ? (
            <div>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1.5 bg-[#161c26] hover:bg-gray-800 border border-gray-700/80 px-2.5 py-1 rounded-md text-xs text-gray-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#161c26] border border-gray-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-gray-700/60">
                    <p className="font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-950/40 text-red-300 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 py-1 hover:bg-gray-800 text-gray-300 hover:text-white rounded-md transition-colors flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="bg-[#15803d] hover:bg-[#16a34a] text-white px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
