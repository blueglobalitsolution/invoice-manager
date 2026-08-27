'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FilePlus,
  Trash2,
  Plus,
  GripVertical,
  Sparkles,
  ArrowRightLeft,
  Check,
  Bell,
  Columns2,
  Home,
  Package,
  Layers,
  Settings,
  FileText,
  Clock,
  Layout,
  FileCheck,
} from 'lucide-react';
import { LatexDocument, CustomSectionItem, SectionContentType } from '@/types/document';
import { getAvailableSectionTypes, createSectionFromPreset } from '@/lib/section-presets';
import { AddSectionModal } from './AddSectionModal';
import {
  getDocumentOutlineGroups,
  getQuotationOutlineGroups,
  OutlineGroup,
  OutlineSectionItem,
  moveSectionToPage,
} from '@/lib/document-sections';
import { SAMPLE_GENERIC_TEMPLATE } from '@/lib/sample_template';

interface FileTreeSidebarProps {
  document: LatexDocument;
  activeSectionId: string;
  hoveredSectionId?: string | null;
  onHoverSection?: (sectionId: string | null) => void;
  onSelectSection: (sectionId: string) => void;
  onAddPage: () => void;
  onAddSection?: (pageNumber: number) => void;
  onAddSectionItem?: (section: CustomSectionItem) => void;
  onDeletePage?: (pageNumber: number, pageId?: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onReorderSections?: (sourceId: string, targetId: string, targetPageNum: number) => void;
  onMoveSectionToPage?: (sectionId: string, targetPageNum: number) => void;
  onMoveSectionUp?: (sectionId: string) => void;
  onMoveSectionDown?: (sectionId: string) => void;
  onOpenGlobalVariables?: () => void;
}

export const FileTreeSidebar: React.FC<FileTreeSidebarProps> = ({
  document,
  activeSectionId,
  hoveredSectionId,
  onHoverSection,
  onSelectSection,
  onAddPage,
  onAddSection,
  onAddSectionItem,
  onDeletePage,
  onDeleteSection,
  onReorderSections,
  onMoveSectionToPage,
  onMoveSectionUp,
  onMoveSectionDown,
}) => {
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<number, boolean>>({});
  const [dropdownPageNum, setDropdownPageNum] = useState<number | null>(null);
  const [modalTargetPageNum, setModalTargetPageNum] = useState<number | null>(null);
  const [modalTargetGroupTitle, setModalTargetGroupTitle] = useState<string>('');

  // Move menu popover state
  const [moveMenuSecId, setMoveMenuSecId] = useState<string | null>(null);

  // Drag & drop state
  const [draggedSecId, setDraggedSecId] = useState<string | null>(null);
  const [dragOverSecId, setDragOverSecId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside'>('after');

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const moveMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownPageNum(null);
      }
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setMoveMenuSecId(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const po = document.purchaseOrder;
  const q = document.quotation;
  const inv = document.taxInvoice;
  const isInvoice = !!inv || document.id === 'tax_invoice' || !!(po as any)?.invoiceNumber;
  const templateId = q ? 'quotation' : po ? 'labour_po' : undefined;

  let groups: OutlineGroup[] = [];
  if (po) {
    groups = getDocumentOutlineGroups(po);
  } else if (q) {
    groups = getQuotationOutlineGroups(q);
  } else if (inv) {
    groups = [
      {
        pageNum: 1,
        groupId: 'page_1',
        groupTitle: 'Tax Invoice Details',
        isCustomGroup: false,
        sections: [
          { id: 'letterhead', label: 'Letterhead Config', icon: Layers, isCustom: false, pageNumber: 1 },
          { id: 'invoice_meta', label: 'Invoice Summary', icon: FileText, isCustom: false, pageNumber: 1 },
          { id: 'invoice_items', label: 'Line Items Table', icon: Package, isCustom: false, pageNumber: 1 },
          { id: 'signatures', label: 'Execution Blocks', icon: FileCheck, isCustom: false, pageNumber: 1 },
        ],
      },
    ];
  } else if (document.dynamicTemplate) {
    groups = [
      {
        pageNum: 1,
        groupId: 'page_1',
        groupTitle: SAMPLE_GENERIC_TEMPLATE.name,
        isCustomGroup: false,
        sections: SAMPLE_GENERIC_TEMPLATE.sections.map((s: any) => ({
          id: s.id,
          label: s.title,
          icon: FileText,
          isCustom: false,
          pageNumber: 1,
        })),
      },
    ];
  }

  const toggleGroup = (pageNum: number) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [pageNum]: !prev[pageNum],
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSecId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGroupDragOver = (e: React.DragEvent, pageNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSecId === null) return;
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroupId(pageNum);
    setDragOverSecId(null);
  };

  const handleDropOnGroup = (e: React.DragEvent, pageNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedSecId;
    if (!sourceId) return;

    if (onMoveSectionToPage) {
      onMoveSectionToPage(sourceId, pageNum);
    } else if (onReorderSections) {
      onReorderSections(sourceId, '', pageNum);
    }

    handleDragEnd();
  };

  const handleSectionDragOver = (e: React.DragEvent, targetId: string, pageNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSecId === null || draggedSecId === targetId) return;
    e.dataTransfer.dropEffect = 'move';

    setDragOverSecId(targetId);
    setDragOverGroupId(pageNum);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y < rect.height / 2) {
      setDropPosition('before');
    } else {
      setDropPosition('after');
    }
  };

  const handleDragLeave = () => {
    setDragOverSecId(null);
  };

  const handleDropOnSection = (e: React.DragEvent, targetId: string, pageNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedSecId;
    if (!sourceId || sourceId === targetId) return;

    if (onReorderSections) {
      onReorderSections(sourceId, targetId, pageNum);
    } else if (onMoveSectionToPage) {
      onMoveSectionToPage(sourceId, pageNum);
    }

    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedSecId(null);
    setDragOverSecId(null);
    setDragOverGroupId(null);
  };

  const handleOpenCustomizer = (pageNum: number, groupTitle: string) => {
    setModalTargetPageNum(pageNum);
    setModalTargetGroupTitle(groupTitle);
    setDropdownPageNum(null);
  };

  const getGroupIcon = (pageNum: number) => {
    return FileText;
  };

  return (
    <aside className="w-64 bg-[#070A13] border-r border-[#151C2C] flex flex-col justify-between shrink-0 select-none text-xs text-slate-400 overflow-hidden relative h-full min-h-0">
      {/* Sections Tree Outline */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Outline Header */}
        <div className="px-3.5 py-3 border-b border-[#151C2C] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 text-[10.5px] font-bold text-slate-400 tracking-wider">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>OUTLINE</span>
          </div>
          {!isInvoice && onAddPage && (
            <button
              onClick={() => onAddPage()}
              className="px-2 py-1 bg-[#10192C] hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 rounded-md text-[10.5px] font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
              title="Add Page"
            >
              <Plus className="w-3 h-3" />
              <span>Add Page</span>
            </button>
          )}
        </div>

        {/* Logical Flow List */}
        <div className="p-3 overflow-y-auto flex-1 text-xs space-y-1.5 scrollbar-thin">
          {groups.map((grp) => {
            const hasOpenMoveMenu = grp.sections.some((s) => s.id === moveMenuSecId);
            const isGroupTargeted =
              dragOverGroupId === grp.pageNum && draggedSecId !== null && !dragOverSecId;
            const isCollapsed = collapsedGroups[grp.pageNum] || false;
            const GroupIcon = getGroupIcon(grp.pageNum);

            return (
              <div
                key={grp.pageNum}
                onDragOver={(e) => handleGroupDragOver(e, grp.pageNum)}
                onDrop={(e) => handleDropOnGroup(e, grp.pageNum)}
                className={`space-y-1 relative ${
                  hasOpenMoveMenu ? 'z-30' : 'z-0'
                }`}
              >
                {/* Collapsible Group Header Row */}
                <div
                  onClick={() => toggleGroup(grp.pageNum)}
                  className={`group/pageheader flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isGroupTargeted
                      ? 'border border-indigo-500 bg-indigo-500/10'
                      : 'hover:bg-slate-800/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <GroupIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      Page {grp.pageNum}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-1">
                    {/* Add Section Action trigger (Hidden on Invoice) */}
                    {!isInvoice && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomizer(grp.pageNum, grp.groupTitle);
                        }}
                        className="p-1 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-200 rounded transition-colors cursor-pointer"
                        title="Add Pre-defined Section to this Page"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Page trigger */}
                    {onDeletePage && groups.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage(grp.pageNum, grp.groupId);
                        }}
                        className="p-1 opacity-0 group-hover/pageheader:opacity-100 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                        title={`Delete Page ${grp.pageNum}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Subsections List (Show when group is NOT collapsed) */}
                {!isCollapsed && (
                  <div className="ml-2 pl-2 py-0.5 space-y-1">
                    {grp.sections.length === 0 && (
                      <div
                        onDragOver={(e) => handleGroupDragOver(e, grp.pageNum)}
                        onDrop={(e) => handleDropOnGroup(e, grp.pageNum)}
                        className="text-[10px] italic text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-lg bg-slate-900/30"
                      >
                        Drop sections here
                      </div>
                    )}

                    {grp.sections.map((sec, sIdx) => {
                      const isSecActive = activeSectionId === sec.id;
                      const isSecHovered = hoveredSectionId === sec.id && !isSecActive;
                      const isDraggingThis = draggedSecId === sec.id;
                      const isDragOverThis = dragOverSecId === sec.id;
                      const isMoveMenuOpen = moveMenuSecId === sec.id;

                      return (
                        <div key={sec.id} className="space-y-1">
                          {/* Section Card Row */}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, sec.id)}
                            onDragOver={(e) => handleSectionDragOver(e, sec.id, grp.pageNum)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnSection(e, sec.id, grp.pageNum)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onSelectSection(sec.id)}
                            onMouseEnter={() => onHoverSection?.(sec.id)}
                            onMouseLeave={() => onHoverSection?.(null)}
                            className={`group/sec relative flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none ${
                              isMoveMenuOpen ? 'z-40' : 'z-0'
                            } ${
                              isDraggingThis
                                ? 'opacity-40 scale-95 border-dashed border-2 border-indigo-500 bg-indigo-500/10'
                                : ''
                            } ${
                              isDragOverThis
                                ? dropPosition === 'before'
                                  ? 'border-t-2 border-indigo-500'
                                  : 'border-b-2 border-indigo-500'
                                : ''
                            } ${
                              isSecActive
                                ? 'bg-[#1C1436] border border-[#7C3AED]/70 text-white font-medium shadow-[0_0_14px_rgba(124,58,237,0.22)]'
                                : isSecHovered
                                ? 'bg-slate-800/50 text-slate-200'
                                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0 pr-1">
                              <GripVertical className="w-3 h-3 text-slate-600 group-hover/sec:text-slate-400 shrink-0 cursor-grab" />
                              <span className="truncate text-xs flex-1">{sec.label}</span>
                            </div>

                            {/* Action buttons (Move Up, Move Down, Delete) */}
                            <div className="flex items-center space-x-0.5 opacity-0 group-hover/sec:opacity-100 transition-opacity shrink-0">
                              {sIdx > 0 && onMoveSectionUp && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveSectionUp(sec.id);
                                  }}
                                  className="p-1 hover:bg-indigo-600/30 rounded text-slate-400 hover:text-indigo-200 transition-colors"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                              )}
                              {sIdx < grp.sections.length - 1 && onMoveSectionDown && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveSectionDown(sec.id);
                                  }}
                                  className="p-1 hover:bg-indigo-600/30 rounded text-slate-400 hover:text-indigo-200 transition-colors"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              )}
                              {onDeleteSection && sec.isCustom && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSection(sec.id);
                                  }}
                                  className="p-1 hover:bg-rose-500/20 rounded text-slate-500 hover:text-rose-400 transition-colors"
                                  title={`Delete ${sec.label}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Section Modal Wrapper */}
      {modalTargetPageNum !== null && (
        <AddSectionModal
          isOpen={true}
          onClose={() => setModalTargetPageNum(null)}
          targetPageNum={modalTargetPageNum}
          groupTitle={modalTargetGroupTitle}
          templateId={templateId}
          onAddSectionItem={(newSection) => {
            if (onAddSectionItem) {
              onAddSectionItem(newSection);
            }
          }}
        />
      )}
    </aside>
  );
};
