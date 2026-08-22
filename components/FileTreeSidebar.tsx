'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
    if (draggedSecId === null) return;
    setDragOverGroupId(pageNum);
    setDragOverSecId(null);
  };

  const handleDropOnGroup = (e: React.DragEvent, pageNum: number) => {
    e.preventDefault();
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
    if (draggedSecId === null || draggedSecId === targetId) return;

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
    const sourceId = e.dataTransfer.getData('text/plain') || draggedSecId;
    if (!sourceId || sourceId === targetId) return;

    if (onReorderSections) {
      onReorderSections(sourceId, targetId, pageNum);
    }

    handleDragEnd();
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

  const SUBSECTION_MAP: Record<string, string[]> = {
    'info': ['Parties Details', 'Project Details', 'Letterhead Config'],
    'scope': ['Scope of Work Checklist'],
    'rates': ['Billing Items & Totals'],
    'scope_contractor': ['Contractor Obligations'],
    'payment_terms': ['Milestones & Payment Clauses'],
    'measurement': ['Quality, Materials & Safety'],
    'terms': ['Labour Compliance & Completion'],
    'page3_terms': ['Warranty, Termination & Rules'],
    'signatures': ['Dual Authorization Blocks'],
    'q_cover_info': ['Recipient Address', 'Reference & Date'],
    'q_cover_intro': ['Enquiry Subject', 'Intro Paragraphs', 'Signatory Profile'],
    'q_tech_details': ['Technical Specification Grid'],
    'q_mat_specs': ['Material Quality Matrix'],
    'q_boq_items': ['Pricing BOQ Items', 'Subtotal & Tax Calculations'],
    'q_payment_terms_fab': ['Fabrication Milestones'],
    'q_payment_terms_civil': ['Civil Milestones'],
    'q_delivery_schedule': ['Timeline Milestones', 'Prerequisites Check'],
    'q_vendors_part1': ['Vendor Registrations (1-14)'],
    'q_vendors_part2': ['Hardware & Primer (15-25)'],
    'q_taxes_notes': ['Tax Clauses', 'General Covenants', 'Site Conditions'],
    'q_terms_part1': ['Commercial Covenants (1-7)'],
    'q_terms_part2': ['Commercial Covenants (8-13)'],
    'q_terms_part3': ['Commercial Covenants (14-17)'],
    'q_exclusions': ['Scope of Exclusions Checklist'],
    'q_signatures': ['Special Disclaimers', 'Authorization Blocks'],
  };

  const getSubsections = (sec: OutlineSectionItem): string[] => {
    if (sec.isCustom && sec.customData) {
      const type = sec.customData.contentType;
      if (type === 'bullet_list') return [`Bullet Items (${sec.customData.bullets?.length || 0})`];
      if (type === 'paragraphs') return [`Paragraph Blocks (${sec.customData.paragraphs?.length || 0})`];
      if (type === 'table') return [`Table Rows (${sec.customData.tableRows?.length || 0})`];
      if (type === 'key_value') return [`Key-Value Pairs (${sec.customData.keyValuePairs?.length || 0})`];
      if (type === 'callout') return ['Callout Block Content'];
      return ['Section Inputs'];
    }
    return SUBSECTION_MAP[sec.id] || ['Section Content'];
  };

  const getGroupIcon = (pageNum: number) => {
    return FileText;
  };

  return (
    <aside className="w-64 bg-[#f9fafb] border-r border-gray-200 flex flex-col justify-between shrink-0 select-none text-xs text-gray-700 overflow-hidden relative h-full min-h-0">
      
      {/* Sections Tree Outline */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <svg className="w-5 h-5 text-[#0d3479]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="font-bold text-sm text-gray-900 tracking-tight">Contracti</span>
          </div>
          
          <div className="flex items-center space-x-1 shrink-0">
          </div>
        </div>



        {/* Logical Flow List */}
        <div className="p-3 overflow-y-auto flex-1 text-xs space-y-1.5 scrollbar-thin">
          {groups.map((grp) => {
            const isDropdownOpen = dropdownPageNum === grp.pageNum;
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
                  isDropdownOpen || hasOpenMoveMenu ? 'z-30' : 'z-0'
                }`}
              >
                {/* Collapsible Group Header Row */}
                <div
                  onClick={() => toggleGroup(grp.pageNum)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isGroupTargeted
                      ? 'border border-emerald-400 bg-emerald-50/50'
                      : 'hover:bg-gray-100/70 text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <GroupIcon className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 truncate">
                      Page {grp.pageNum}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-1">
                    {/* Add Section Action trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownPageNum(isDropdownOpen ? null : grp.pageNum);
                      }}
                      className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                      title="Add Section"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>

                  {/* Pre-defined Section Types Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-9 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-40 p-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-100 flex items-center justify-between">
                        <span>Add Section Type</span>
                        <span className="text-[9px] text-[#0d3479] font-mono">
                          Page {grp.pageNum}
                        </span>
                      </div>

                      <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
                        {PREDEFINED_SECTION_TYPES.map((typeOption) => {
                          const Icon = typeOption.icon;
                          return (
                            <button
                              key={typeOption.type}
                              onClick={() => handleQuickAddType(typeOption.type, grp.pageNum)}
                              className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded-lg flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-gray-400" />
                              <span>{typeOption.label}</span>
                            </button>
                          );
                        })}
                        <div className="border-t border-gray-100 my-1 pt-1">
                          <button
                            onClick={() => handleOpenCustomizer(grp.pageNum, grp.groupTitle)}
                            className="w-full text-left px-2 py-1.5 hover:bg-[#0d3479]/10 text-[#0d3479] rounded-lg flex items-center space-x-2 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Add Custom Section...</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subsections List (Show when group is NOT collapsed) */}
                {!isCollapsed && (
                  <div className="border-l border-gray-200 ml-4.5 pl-3.5 py-1 space-y-1">
                    {grp.sections.length === 0 && (
                      <div
                        onDragOver={(e) => handleGroupDragOver(e, grp.pageNum)}
                        onDrop={(e) => handleDropOnGroup(e, grp.pageNum)}
                        className="text-[10px] italic text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50"
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
                      const subsections = getSubsections(sec);

                      return (
                        <div key={sec.id} className="space-y-0.5">
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
                            className={`group/sec relative flex items-center justify-between px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer select-none ${
                              isMoveMenuOpen ? 'z-40' : 'z-0'
                            } ${
                              isDraggingThis
                                ? 'opacity-40 scale-95 border-dashed border-2 border-[#0d3479] bg-[#0d3479]/5 shadow-inner'
                                : ''
                            } ${
                              isDragOverThis
                                ? dropPosition === 'before'
                                  ? 'border-t-2 border-[#0d3479] bg-[#0d3479]/5'
                                  : 'border-b-2 border-[#0d3479] bg-[#0d3479]/5'
                                : ''
                            } ${
                              isSecActive
                                ? 'bg-gray-100 text-gray-900 font-semibold'
                                : isSecHovered
                                ? 'bg-gray-50 text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                              <span className="truncate text-xs flex-1">{sec.label}</span>
                            </div>

                            {/* Section Actions: Reorder & Delete */}
                            <div className="flex items-center space-x-1 shrink-0 ml-1">
                              {/* Move Popover Trigger */}
                              <div className={`relative ${isMoveMenuOpen ? 'z-50' : 'z-auto'}`}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMoveMenuSecId(isMoveMenuOpen ? null : sec.id);
                                  }}
                                  className={`p-1 rounded cursor-pointer transition-opacity ${
                                    isMoveMenuOpen
                                      ? 'opacity-100 bg-[#0d3479] text-white'
                                      : 'opacity-0 group-hover/sec:opacity-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                  }`}
                                  title="Move section"
                                >
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                </button>

                                {isMoveMenuOpen && (
                                  <div
                                    ref={moveMenuRef}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-7 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <div className="text-[9px] uppercase font-bold text-gray-500 px-1.5 py-1 border-b border-gray-100 mb-1 flex items-center justify-between">
                                      <span className="truncate">Move &quot;{sec.label}&quot;</span>
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
                                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                            targetGrp.pageNum === grp.pageNum
                                              ? 'bg-[#0d3479]/10 text-[#0d3479] font-bold'
                                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                          }`}
                                        >
                                          <span className="truncate">
                                            Page {targetGrp.pageNum}: {targetGrp.groupTitle}
                                          </span>
                                          {targetGrp.pageNum === grp.pageNum && (
                                            <Check className="w-3 h-3 text-[#0d3479] shrink-0 ml-1" />
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
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer opacity-0 group-hover/sec:opacity-100 transition-opacity"
                                  title={`Delete ${sec.label}`}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Subsections Flow Display */}
                          {isSecActive && subsections.length > 0 && (
                            <div className="border-l border-gray-200 ml-4.5 pl-3.5 py-0.5 space-y-0.5 animate-in fade-in duration-150">
                              {subsections.map((sub, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-1.5 py-0.5 text-gray-400"
                                >
                                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                                  <span className="text-[10px] truncate">{sub}</span>
                                </div>
                              ))}
                            </div>
                          )}
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
