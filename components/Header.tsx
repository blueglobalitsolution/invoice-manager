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
  ArrowLeft,
  CheckCircle2,
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
        return <Package className="w-3.5 h-3.5 text-purple-400" />;
      case 'invoice':
        return <Receipt className="w-3.5 h-3.5 text-orange-400" />;
      case 'contract':
        return <Layers className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const projectDocs = project?.documents || [];
  const currentDocItem = projectDocs.find((d) => d.id === activeDocumentId);

  return (
    <header className="w-full h-14 bg-[#070A13] border-b border-[#151C2C] flex items-center justify-between px-5 shrink-0 z-20 text-xs select-none">
      
      {/* Left side actions and breadcrumbs */}
      <div className="flex items-center space-x-4">
        
        {/* Back Arrow to Dashboard */}
        <button
          onClick={onGoBackToDashboard}
          className="p-1.5 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Document Title & Add Button */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-white tracking-tight">
            {document.title || project?.title || 'Commercial Quotation'}
          </span>
          {onOpenAddDocumentModal && (
            <button
              onClick={onOpenAddDocumentModal}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Add New Document"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Draft status */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium ml-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Draft saved 2m ago</span>
        </div>

        {/* Action Undo / Redo controls */}
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
              canUndo
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer active:scale-95'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
              canRedo
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer active:scale-95'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* Download PDF button */}
        <button
          onClick={onExportPdf}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_16px_rgba(79,70,229,0.45)] ring-1 ring-indigo-400/30 active:scale-[0.98]"
          title="Download Document as PDF"
        >
          <Printer className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

    </header>
  );
};
