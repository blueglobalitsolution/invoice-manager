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
    <header className="w-full h-14 bg-[#0c131f] border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-20 text-xs select-none">
      
      {/* Left side actions and breadcrumbs */}
      <div className="flex items-center space-x-2.5">
        
        {/* Back Arrow to Dashboard */}
        <button
          onClick={onGoBackToDashboard}
          className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Project Folder Indicator */}
        {project && (
          <div className="flex items-center space-x-2 text-gray-300">
            <button
              onClick={onOpenProjectDetail || onGoBackToDashboard}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer max-w-[120px] truncate"
              title="Open Project Dossier"
            >
              {project.title}
            </button>
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          </div>
        )}



        {/* Action Undo / Redo controls */}
        <div className="flex items-center bg-[#172334]/50 border border-gray-800 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
              canUndo
                ? 'hover:bg-[#172334] text-emerald-400 cursor-pointer active:scale-95'
                : 'text-gray-600 opacity-40 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
              canRedo
                ? 'hover:bg-[#172334] text-emerald-400 cursor-pointer active:scale-95'
                : 'text-gray-600 opacity-40 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-2.5 shrink-0">
        
        {/* Download PDF button */}
        <button
          onClick={onExportPdf}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          title="Download Document as PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </button>



      </div>

    </header>
  );
};
