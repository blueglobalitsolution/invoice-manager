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
  Save,
  Pencil,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { LatexDocument } from '@/types/document';
import { ProjectItem, ProjectDocType } from '@/types/project';

interface HeaderProps {
  document: LatexDocument;
  onExportPdf: () => void;
  isExporting?: boolean;
  isRecompiling?: boolean;
  onRecompile?: () => void;
  onGoBackToDashboard?: () => void;
  onSaveAndExit?: () => void;
  onOpenSettings?: () => void;
  onRenameTitle?: (newTitle: string) => void;
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
  isExporting = false,
  isRecompiling = false,
  onRecompile,
  onGoBackToDashboard,
  onSaveAndExit,
  onRenameTitle,
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const startHeaderRename = () => {
    setTempTitle(document.title || project?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveHeaderRename = () => {
    if (tempTitle.trim() && onRenameTitle) {
      onRenameTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelHeaderRename = () => {
    setIsEditingTitle(false);
  };

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
    <header className="w-full h-11 bg-[#002057] border-b border-[#15428a] flex items-center justify-between px-3.5 shrink-0 text-xs shadow-md select-none print:hidden z-20">
      
      {/* Left side actions and breadcrumbs */}
      <div className="flex items-center space-x-2.5">
        
        {/* Back Arrow to Dashboard */}
        <button
          onClick={onGoBackToDashboard}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center border border-white/10 hover:border-white/30 shadow-xs active:scale-95"
          title="Back to Project Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Project Breadcrumb Pill Badge */}
        {project && (
          <div className="hidden md:flex items-center space-x-1.5 text-xs">
            <span
              onClick={onOpenProjectDetail}
              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#0d3479] text-white border border-[#2356a8] cursor-pointer hover:bg-[#123f8f] transition-colors"
              title="View Project Dossier"
            >
              {project.title}
            </span>
            <ChevronRight className="w-3 h-3 text-white/50" />
          </div>
        )}

        {/* Document Title & Inline Rename */}
        <div className="flex items-center space-x-2">
          {isEditingTitle ? (
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveHeaderRename();
                  if (e.key === 'Escape') handleCancelHeaderRename();
                }}
                autoFocus
                className="px-2.5 py-1 text-xs font-bold text-black bg-white border border-white rounded-lg focus:outline-none w-64 shadow-xs"
                placeholder="Document Title"
              />
              <button
                type="button"
                onClick={handleSaveHeaderRename}
                className="p-1.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                title="Save Title"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelHeaderRename}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/20 rounded-lg transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 group">
              <span
                onClick={startHeaderRename}
                className="text-xs sm:text-sm font-bold text-white tracking-tight cursor-pointer hover:text-blue-200 transition-colors"
                title="Click to rename document"
              >
                {document.title || project?.title || 'Commercial Quotation'}
              </span>
              <button
                type="button"
                onClick={startHeaderRename}
                className="p-1 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                title="Rename Document"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          {onOpenAddDocumentModal && (
            <button
              onClick={onOpenAddDocumentModal}
              className="p-1 hover:bg-white/10 rounded-md text-white/70 hover:text-white border border-transparent hover:border-white/20 transition-all cursor-pointer"
              title="Add New Document"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Undo / Redo controls */}
        <div className="flex items-center space-x-1 ml-1 pl-2 border-l border-white/20">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
              canUndo
                ? 'hover:bg-white/15 text-white cursor-pointer active:scale-95'
                : 'text-white/30 opacity-40 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
              canRedo
                ? 'hover:bg-white/15 text-white cursor-pointer active:scale-95'
                : 'text-white/30 opacity-40 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Save & Exit button */}
        {onSaveAndExit && (
          <button
            onClick={onSaveAndExit}
            className="bg-white hover:bg-slate-100 text-[#002057] font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="Save all changes and return to project dashboard"
          >
            <Save className="w-3.5 h-3.5 text-[#002057]" />
            <span>Save & Exit</span>
          </button>
        )}

        {/* Download PDF button (White Theme Button) */}
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="bg-white hover:bg-slate-100 text-[#002057] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          title="Download Document as PDF file"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#002057] shrink-0" />
              <span className="tracking-wide font-semibold">Saving PDF...</span>
            </>
          ) : (
            <>
              <Printer className="w-3.5 h-3.5 text-[#002057]" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

    </header>
  );
};
