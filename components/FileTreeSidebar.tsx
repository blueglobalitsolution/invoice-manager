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
          pageNumber: 1
        }))
      }
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
    <aside className="w-64 bg-[#070A13] border-r border-[#151C2C] flex flex-col justify-between shrink-0 select-none text-xs text-slate-400 overflow-hidden relative h-full min-h-0">
      
      {/* Sections Tree Outline */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">

        {/* Outline Header */}
        <div className="px-4 py-3.5 border-b border-[#151C2C] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>DOCUMENT OUTLINE</span>
          </div>
          <button
            onClick={() => onAddPage && onAddPage()}
            className="w-5 h-5 rounded-full border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Add Page / Group"
          >
            <Plus className="w-3 h-3" />
          </button>
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
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
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
                    {/* Add Section Action trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownPageNum(isDropdownOpen ? null : grp.pageNum);
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                      title="Add Section"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>

                  {/* Pre-defined Section Types Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-9 w-56 bg-[#0F1523] border border-[#1E293B] rounded-xl shadow-2xl z-40 p-1.5 text-xs text-slate-300 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-[#1E293B] flex items-center justify-between">
                        <span>Add Section Type</span>
                        <span className="text-[9px] text-indigo-400 font-mono">
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
                              className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-slate-400" />
                              <span>{typeOption.label}</span>
                            </button>
                          );
                        })}
                        <div className="border-t border-[#1E293B] my-1 pt-1">
                          <button
                            onClick={() => handleOpenCustomizer(grp.pageNum, grp.groupTitle)}
                            className="w-full text-left px-2 py-1.5 hover:bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center space-x-2 text-xs font-semibold transition-colors cursor-pointer"
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

                    {grp.sections.map((sec) => {
                      const isSecActive = activeSectionId === sec.id;
                      const isSecHovered = hoveredSectionId === sec.id && !isSecActive;
                      const isDraggingThis = draggedSecId === sec.id;
                      const isDragOverThis = dragOverSecId === sec.id;
                      const isMoveMenuOpen = moveMenuSecId === sec.id;
                      const subsections = getSubsections(sec);

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
                            className={`group/sec relative flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer select-none ${
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
                            <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                              <span className="truncate text-xs flex-1">{sec.label}</span>
                            </div>

                            {/* Chevron when active or action buttons */}
                            {isSecActive ? (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                            ) : (
                              <div className="flex items-center space-x-1 shrink-0 ml-1">
                                {onDeleteSection && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSection(sec.id);
                                    }}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover/sec:opacity-100"
                                    title={`Delete ${sec.label}`}
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Subsections Flow Display */}
                          {isSecActive && subsections.length > 0 && (
                            <div className="ml-3 pl-3 py-1 space-y-1.5 border-l border-indigo-500/20 animate-in fade-in duration-150">
                              {subsections.map((sub, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2 py-0.5 text-indigo-300/80 hover:text-indigo-200 text-xs"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shrink-0" />
                                  <span className="truncate font-normal">{sub}</span>
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
