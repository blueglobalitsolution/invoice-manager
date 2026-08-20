'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  Trash2,
  Plus,
  GripVertical,
  Sparkles,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { LatexDocument, CustomSectionItem, SectionContentType } from '@/types/document';
import { PREDEFINED_SECTION_TYPES, createSectionFromPreset } from '@/lib/section-presets';
import { AddSectionModal } from './AddSectionModal';
import {
  getDocumentOutlineGroups,
  getQuotationOutlineGroups,
  OutlineGroup,
  OutlineSectionItem,
} from '@/lib/document-sections';

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
}) => {
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
  });

  // Dropdown & Modal state for Add Section
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

  const toggleGroup = (groupNum: number) => {
    setOpenGroups((prev) => ({ ...prev, [groupNum]: !prev[groupNum] }));
  };

  const po = document.purchaseOrder;
  const q = document.quotation;
  const inv = document.taxInvoice;

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
        groupTitle: 'Tax Invoice (GST Format)',
        isCustomGroup: false,
        sections: [
          { id: 'header_footer', label: 'Company Header & Footer', icon: FilePlus, isCustom: false, pageNumber: 1 },
          { id: 'client_info', label: 'Client & Invoice Info', icon: FilePlus, isCustom: false, pageNumber: 1 },
          { id: 'items', label: 'Bill of Items & HSN Rates', icon: FilePlus, isCustom: false, pageNumber: 1 },
          { id: 'statutory', label: 'Bank Details & Terms', icon: FilePlus, isCustom: false, pageNumber: 1 },
        ],
      },
    ];
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, secId: string) => {
    e.dataTransfer.setData('text/plain', secId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSecId(secId);
  };

  const handleGroupDragOver = (e: React.DragEvent, pageNum: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverGroupId !== pageNum) {
      setDragOverGroupId(pageNum);
    }
  };

  const handleSectionDragOver = (e: React.DragEvent, secId: string, pageNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAbove = e.clientY < midY;

    setDropPosition(isAbove ? 'before' : 'after');
    setDragOverSecId(secId);
    setDragOverGroupId(pageNum);
  };

  const handleDragLeave = () => {
    setDragOverSecId(null);
  };

  const handleDropOnSection = (e: React.DragEvent, targetSecId: string, targetPageNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedSecId;
    if (sourceId && onReorderSections) {
      onReorderSections(sourceId, targetSecId, targetPageNum);
    }
    setDraggedSecId(null);
    setDragOverSecId(null);
    setDragOverGroupId(null);
  };

  const handleDropOnGroup = (e: React.DragEvent, targetPageNum: number) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedSecId;
    if (sourceId) {
      if (onMoveSectionToPage) {
        onMoveSectionToPage(sourceId, targetPageNum);
      } else if (onReorderSections) {
        onReorderSections(sourceId, '', targetPageNum);
      }
    }
    setDraggedSecId(null);
    setDragOverSecId(null);
    setDragOverGroupId(null);
  };

  const handleDragEnd = () => {
    setDraggedSecId(null);
    setDragOverSecId(null);
    setDragOverGroupId(null);
  };

  const handleQuickAddType = (type: SectionContentType, pageNum: number) => {
    const newSection = createSectionFromPreset(type, 0, pageNum);
    if (onAddSectionItem) {
      onAddSectionItem(newSection);
    } else if (onAddSection) {
      onAddSection(pageNum);
    }
    setDropdownPageNum(null);
  };

  const handleOpenCustomizer = (pageNum: number, groupTitle: string) => {
    setModalTargetPageNum(pageNum);
    setModalTargetGroupTitle(groupTitle);
    setDropdownPageNum(null);
  };

  return (
    <aside className="w-64 bg-[#16202c] border-r border-gray-800 flex flex-col justify-between shrink-0 select-none text-xs text-gray-200 overflow-hidden relative">
      {/* Sections Tree Outline */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#16202c]">
        {/* Header with "+ Group" Button */}
        <div className="h-10 px-2.5 flex items-center justify-between border-b border-gray-800/80 bg-[#121924] shrink-0 text-gray-200">
          <button
            onClick={() => setIsOutlineOpen(!isOutlineOpen)}
            className="flex items-center space-x-1.5 font-semibold hover:text-white cursor-pointer"
          >
            {isOutlineOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-xs tracking-wide">Document Outline</span>
          </button>

          <button
            onClick={onAddPage}
            className="px-2 py-1 bg-[#15803d] hover:bg-[#16a34a] text-white rounded text-[10.5px] font-bold flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
            title="Add a new Page Group / Annexure"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Group</span>
          </button>
        </div>

        {/* Sections Tree List with Drag & Drop */}
        {isOutlineOpen && (
          <div className="p-2 overflow-y-auto flex-1 text-xs space-y-2.5 scrollbar-thin">
            {groups.map((grp) => {
              const isOpen = openGroups[grp.pageNum] ?? true;
              const isDropdownOpen = dropdownPageNum === grp.pageNum;
              const hasOpenMoveMenu = grp.sections.some((s) => s.id === moveMenuSecId);
              const isGroupTargeted =
                dragOverGroupId === grp.pageNum && draggedSecId !== null && !dragOverSecId;

              return (
                <div
                  key={grp.pageNum}
                  onDragOver={(e) => handleGroupDragOver(e, grp.pageNum)}
                  onDrop={(e) => handleDropOnGroup(e, grp.pageNum)}
                  className={`space-y-1 bg-[#131c28]/80 p-1.5 rounded border transition-all duration-150 relative ${
                    isDropdownOpen || hasOpenMoveMenu ? 'z-30' : 'z-0'
                  } ${
                    isGroupTargeted
                      ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50 shadow-md'
                      : 'border-gray-800/80'
                  }`}
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between relative">
                    <button
                      onClick={() => toggleGroup(grp.pageNum)}
                      className="flex-1 flex items-center space-x-1.5 text-left text-gray-200 font-semibold text-[11px] truncate hover:text-white cursor-pointer"
                    >
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{grp.groupTitle}</span>
                    </button>

                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                      {/* Section Add Dropdown Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownPageNum(isDropdownOpen ? null : grp.pageNum);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-0.5 border transition-colors cursor-pointer ${
                          isDropdownOpen
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 hover:text-white border-emerald-700/60'
                        }`}
                        title="Add section to this page"
                      >
                        <FilePlus className="w-3 h-3 text-emerald-300" />
                        <span>+ Sec</span>
                        <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-80" />
                      </button>

                      {onDeletePage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(grp.pageNum, grp.groupId);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/60 rounded cursor-pointer transition-colors"
                          title={`Delete Page ${grp.pageNum} (Can be undone)`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Pre-defined Section Types Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-7 w-56 bg-[#111927] border border-emerald-700/80 rounded-lg shadow-2xl z-40 p-1.5 text-xs text-gray-200 animate-in fade-in zoom-in-95 duration-100"
                      >
                        <div className="px-2 py-1 text-[10px] font-bold uppercase text-emerald-400 border-b border-gray-800/80 flex items-center justify-between">
                          <span>Add Section Type</span>
                          <span className="text-[9px] text-gray-400 font-mono">
                            Page {grp.pageNum}
                          </span>
                        </div>

                        <div className="py-1 space-y-0.5">
                          {PREDEFINED_SECTION_TYPES.map((typeOption) => {
                            const Icon = typeOption.icon;
                            return (
                              <button
                                key={typeOption.type}
                                onClick={() => handleQuickAddType(typeOption.type, grp.pageNum)}
                                className="w-full text-left px-2 py-1.5 rounded hover:bg-emerald-950/70 hover:text-white flex items-center space-x-2 text-gray-300 transition-colors cursor-pointer group/item"
                              >
                                <div className="p-1 bg-gray-800 group-hover/item:bg-emerald-800 text-emerald-400 group-hover/item:text-white rounded">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 truncate">
                                  <div className="font-semibold text-[11px] leading-tight">
                                    {typeOption.shortLabel}
                                  </div>
                                  <div className="text-[9.5px] text-gray-400 truncate">
                                    {typeOption.badge}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="pt-1 border-t border-gray-800/80 mt-1">
                          <button
                            onClick={() => handleOpenCustomizer(grp.pageNum, grp.groupTitle)}
                            className="w-full px-2 py-1.5 bg-[#182333] hover:bg-emerald-900/60 text-emerald-300 hover:text-white rounded text-[10.5px] font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>More Presets & Options...</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section Items with Drag & Drop Reordering and Cross-Page Movement */}
                  {isOpen && (
                    <div className="pl-1 space-y-1 border-l-2 border-emerald-900/50 ml-1 mt-1 min-h-[24px]">
                      {grp.sections.length === 0 && (
                        <div
                          onDragOver={(e) => handleGroupDragOver(e, grp.pageNum)}
                          onDrop={(e) => handleDropOnGroup(e, grp.pageNum)}
                          className="text-[10px] italic text-gray-500 py-2 text-center border border-dashed border-gray-700/60 rounded"
                        >
                          Drop sections here
                        </div>
                      )}

                      {grp.sections.map((sec) => {
                        const isSecActive = activeSectionId === sec.id;
                        const isSecHovered = hoveredSectionId === sec.id && !isSecActive;
                        const isDraggingThis = draggedSecId === sec.id;
                        const isDragOverThis = dragOverSecId === sec.id;
                        const isMoveMenuOpen = moveMenuSecId === sec.id;
                        const SecIcon = sec.icon;

                        return (
                          <div
                            key={sec.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, sec.id)}
                            onDragOver={(e) => handleSectionDragOver(e, sec.id, grp.pageNum)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnSection(e, sec.id, grp.pageNum)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onSelectSection(sec.id)}
                            onMouseEnter={() => onHoverSection?.(sec.id)}
                            onMouseLeave={() => onHoverSection?.(null)}
                            className={`group/sec relative flex items-center justify-between px-1.5 py-1.5 rounded-md cursor-pointer transition-all duration-150 select-none ${
                              isMoveMenuOpen ? 'z-40' : 'z-0'
                            } ${
                              isDraggingThis
                                ? 'opacity-40 scale-95 border-dashed border-2 border-emerald-400 bg-emerald-950/40 shadow-inner'
                                : ''
                            } ${
                              isDragOverThis
                                ? dropPosition === 'before'
                                  ? 'border-t-2 border-emerald-400 bg-emerald-950/60 shadow-xs'
                                  : 'border-b-2 border-emerald-400 bg-emerald-950/60 shadow-xs'
                                : ''
                            } ${
                              isSecActive
                                ? 'bg-[#15803d] text-white font-semibold shadow-sm'
                                : isSecHovered
                                ? 'bg-[#1e2d42] text-white ring-1 ring-emerald-400/80 shadow-xs translate-x-0.5'
                                : 'text-gray-300 hover:bg-[#1b2535] hover:text-white'
                            }`}
                            title="Drag to move across pages, or click to edit"
                          >
                            <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                              {/* Drag Handle */}
                              <div
                                className={`p-0.5 rounded flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors shrink-0 ${
                                  isDraggingThis
                                    ? 'text-emerald-300 bg-emerald-900/80'
                                    : isSecActive
                                    ? 'text-emerald-200 hover:text-white hover:bg-emerald-700/60'
                                    : isSecHovered
                                    ? 'text-emerald-400 bg-emerald-950/60'
                                    : 'text-gray-500 group-hover/sec:text-emerald-400 group-hover/sec:bg-gray-800/80'
                                }`}
                                title="Drag handle to reorder or move across pages"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>

                              <SecIcon
                                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                  isSecActive
                                    ? 'text-white'
                                    : isSecHovered
                                    ? 'text-emerald-300 scale-110'
                                    : 'text-emerald-400'
                                }`}
                              />
                              <span className="truncate text-[11px] flex-1">{sec.label}</span>

                              {/* Sync Indicator when Hovered */}
                              {isSecHovered && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse mr-0.5"
                                  title="Synchronized with Document Preview"
                                />
                              )}
                            </div>

                            {/* Section Action Controls: Quick Move Page & Delete */}
                            <div className="flex items-center space-x-1 shrink-0 ml-1">
                              {/* Move to Page Popover Button */}
                              <div className={`relative ${isMoveMenuOpen ? 'z-50' : 'z-auto'}`}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMoveMenuSecId(isMoveMenuOpen ? null : sec.id);
                                  }}
                                  className={`p-1 rounded cursor-pointer transition-opacity ${
                                    isMoveMenuOpen
                                      ? 'opacity-100 bg-emerald-700 text-white shadow-xs'
                                      : 'opacity-0 group-hover/sec:opacity-100 text-gray-400 hover:text-emerald-300 hover:bg-gray-800'
                                  }`}
                                  title="Move to another page"
                                >
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                </button>

                                {isMoveMenuOpen && (
                                  <div
                                    ref={moveMenuRef}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-7 w-48 bg-[#0c1420] border border-emerald-500/90 rounded-md shadow-2xl z-50 p-1.5 text-xs text-gray-200 ring-1 ring-black/80 animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <div className="text-[9.5px] uppercase font-bold text-emerald-400 px-1.5 py-1 border-b border-gray-800 mb-1 flex items-center justify-between">
                                      <span className="truncate">Move &quot;{sec.label}&quot;</span>
                                      <span className="text-[9px] text-gray-400 font-mono shrink-0 ml-1">
                                        P{sec.pageNumber}
                                      </span>
                                    </div>
                                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                                      {groups.map((targetGrp) => (
                                        <button
                                          key={targetGrp.pageNum}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (onMoveSectionToPage) {
                                              onMoveSectionToPage(sec.id, targetGrp.pageNum);
                                            } else if (onReorderSections) {
                                              onReorderSections(sec.id, '', targetGrp.pageNum);
                                            }
                                            setMoveMenuSecId(null);
                                          }}
                                          className={`w-full text-left px-2 py-1.5 rounded text-[10.5px] flex items-center justify-between transition-colors cursor-pointer ${
                                            targetGrp.pageNum === grp.pageNum
                                              ? 'bg-emerald-900/70 text-emerald-300 font-bold border border-emerald-700/50'
                                              : 'hover:bg-[#1a2638] text-gray-300 hover:text-white'
                                          }`}
                                        >
                                          <span className="truncate">
                                            Page {targetGrp.pageNum}: {targetGrp.groupTitle}
                                          </span>
                                          {targetGrp.pageNum === grp.pageNum && (
                                            <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {onDeleteSection && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSection(sec.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/60 rounded cursor-pointer opacity-0 group-hover/sec:opacity-100 transition-opacity"
                                  title={`Delete ${sec.label} (Can be undone)`}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
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
        )}
      </div>

      {/* Add Section Modal with Full Presets & Live Preview */}
      {modalTargetPageNum !== null && (
        <AddSectionModal
          isOpen={true}
          onClose={() => setModalTargetPageNum(null)}
          targetPageNum={modalTargetPageNum}
          groupTitle={modalTargetGroupTitle}
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
