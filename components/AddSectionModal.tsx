'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Sparkles,
  ChevronRight,
  Check,
  Search,
  Layers,
  Building,
  Briefcase,
  Receipt,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  ListChecks,
  Scale,
  AlertTriangle,
  FileCode,
  Eye,
} from 'lucide-react';
import {
  loadTemplateSectionLibrary,
  TemplateSectionLibrary,
  SectionTemplateCategory,
  SectionPresetItem,
  getIconComponent,
} from '@/lib/section-presets';
import { CustomSectionItem, SectionContentType } from '@/types/document';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPageNum: number;
  groupTitle?: string;
  templateId?: string;
  onAddSectionItem: (section: CustomSectionItem) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  targetPageNum,
  groupTitle = `Page ${targetPageNum}`,
  templateId,
  onAddSectionItem,
}) => {
  const [libraries, setLibraries] = useState<TemplateSectionLibrary[]>(() => loadTemplateSectionLibrary());
  const [activeLibraryId, setActiveLibraryId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all_cats');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const allLibs = loadTemplateSectionLibrary();
      setLibraries(allLibs);
      
      const initialLib = templateId && allLibs.some((l) => l.templateId === templateId) ? templateId : 'all';
      setActiveLibraryId(initialLib);
      setSelectedCategoryId('all_cats');
      setSearchQuery('');

      const relevantCategories = initialLib === 'all' 
        ? allLibs.flatMap((l) => l.categories) 
        : allLibs.find((l) => l.templateId === initialLib || (initialLib === 'invoice' && l.templateId === 'tax_invoice'))?.categories || [];

      if (relevantCategories.length > 0 && relevantCategories[0].sections.length > 0) {
        const firstSec = relevantCategories[0].sections[0];
        setSelectedPresetId(firstSec.id);
        setCustomTitle(firstSec.title);
      }
    }
  }, [isOpen, templateId]);

  // Filter categories by selected library
  const availableCategories = useMemo(() => {
    const allLibs = libraries.length > 0 ? libraries : loadTemplateSectionLibrary();
    if (activeLibraryId === 'all') {
      return allLibs.flatMap((l) => l.categories);
    }
    const lib = allLibs.find((l) => l.templateId === activeLibraryId || (activeLibraryId === 'invoice' && l.templateId === 'tax_invoice'));
    return lib ? lib.categories : [];
  }, [libraries, activeLibraryId]);

  // Find active category
  const activeCategory = useMemo(() => {
    return availableCategories.find((c) => c.id === selectedCategoryId) || availableCategories[0];
  }, [availableCategories, selectedCategoryId]);

  // Filter presets by search or active category
  const displayedPresets = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const allSections: { section: SectionPresetItem; category: SectionTemplateCategory }[] = [];
      availableCategories.forEach((cat) => {
        cat.sections.forEach((sec) => {
          if (
            sec.name.toLowerCase().includes(q) ||
            sec.title.toLowerCase().includes(q) ||
            sec.description.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
          ) {
            allSections.push({ section: sec, category: cat });
          }
        });
      });
      return allSections;
    }

    if (!selectedCategoryId || selectedCategoryId === 'all_cats') {
      const allSections: { section: SectionPresetItem; category: SectionTemplateCategory }[] = [];
      availableCategories.forEach((cat) => {
        cat.sections.forEach((sec) => {
          allSections.push({ section: sec, category: cat });
        });
      });
      return allSections;
    }

    const cat = availableCategories.find((c) => c.id === selectedCategoryId);
    if (!cat) return [];
    return cat.sections.map((sec) => ({ section: sec, category: cat }));
  }, [searchQuery, availableCategories, selectedCategoryId]);

  // Active preset item
  const activePresetItem = useMemo(() => {
    if (selectedPresetId) {
      for (const cat of availableCategories) {
        const match = cat.sections.find((s) => s.id === selectedPresetId);
        if (match) return match;
      }
    }
    return displayedPresets[0]?.section || null;
  }, [availableCategories, selectedPresetId, displayedPresets]);

  useEffect(() => {
    if (activePresetItem) {
      setCustomTitle(activePresetItem.title || activePresetItem.name);
    }
  }, [activePresetItem?.id]);

  const handleSelectLibrary = (libId: string) => {
    setActiveLibraryId(libId);
    setSelectedCategoryId('all_cats');
    setSearchQuery('');
    const allLibs = libraries.length > 0 ? libraries : loadTemplateSectionLibrary();
    const cats = libId === 'all' 
      ? allLibs.flatMap((l) => l.categories) 
      : allLibs.find((l) => l.templateId === libId || (libId === 'invoice' && l.templateId === 'tax_invoice'))?.categories || [];

    if (cats.length > 0 && cats[0].sections.length > 0) {
      setSelectedPresetId(cats[0].sections[0].id);
      setCustomTitle(cats[0].sections[0].title);
    } else {
      setSelectedPresetId('');
      setCustomTitle('');
    }
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setSearchQuery('');
    const cat = availableCategories.find((c) => c.id === catId);
    if (cat && cat.sections.length > 0) {
      setSelectedPresetId(cat.sections[0].id);
      setCustomTitle(cat.sections[0].title);
    }
  };

  const handleSelectPreset = (preset: SectionPresetItem) => {
    setSelectedPresetId(preset.id);
    setCustomTitle(preset.title);
  };

  const handleCreate = () => {
    if (!activePresetItem) return;

    const titleToUse = customTitle.trim() || activePresetItem.title || activePresetItem.name;

    const newSection: CustomSectionItem = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: titleToUse,
      pageNumber: targetPageNum,
      contentType: activePresetItem.contentType,
      bullets: activePresetItem.bullets ? [...activePresetItem.bullets] : undefined,
      paragraphs: activePresetItem.paragraphs ? [...activePresetItem.paragraphs] : undefined,
      tableHeaders: activePresetItem.tableHeaders ? [...activePresetItem.tableHeaders] : undefined,
      tableRows: activePresetItem.tableRows ? activePresetItem.tableRows.map((r) => [...r]) : undefined,
      keyValuePairs: activePresetItem.keyValuePairs ? activePresetItem.keyValuePairs.map((kv) => ({ ...kv })) : undefined,
      calloutText: activePresetItem.calloutText,
      calloutType: activePresetItem.calloutType,
    };

    onAddSectionItem(newSection);
    onClose();
  };

  const getFormatBadge = (contentType: SectionContentType) => {
    switch (contentType) {
      case 'bullet_list':
        return { label: 'Bullet Points', color: 'bg-[#dfe7f4] text-[#0d3479] border-[#b9c7de]' };
      case 'table':
        return { label: 'Data Table', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'legal_clause':
        return { label: 'Numbered Clauses', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'key_value':
        return { label: 'Key-Value Table', color: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'callout':
        return { label: 'Notice Box', color: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: 'Standard Text', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 bottom-0 left-14 right-0 z-40 overflow-hidden select-none">
      <div
        onClick={onClose}
        className="fixed top-0 bottom-0 left-14 right-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      <div className="fixed top-0 bottom-0 left-14 w-full md:w-[1160px] lg:w-[1240px] max-w-[calc(100vw-3.5rem)] bg-[#f7f7f2] border-r border-[#cccccc] shadow-[14px_0_45px_rgba(0,0,0,0.25)] z-50 flex flex-col p-6 text-black animate-in slide-in-from-left duration-300 ease-out space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#cccccc] pb-3">
          <div>
            <h3 className="font-bold text-lg text-black">Add Section to Document</h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Choose a pre-built section from the library or search for specific clauses, tables, and terms
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-black p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#cccccc] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#cccccc] pb-3">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => handleSelectLibrary('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'all'
                  ? 'bg-[#0d3479] text-white shadow-xs'
                  : 'bg-white text-[#444444] border border-[#cccccc] hover:bg-slate-50'
              }`}
            >
              🌟 All Sections (30+)
            </button>
            <button
              onClick={() => handleSelectLibrary('quotation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'quotation'
                  ? 'bg-[#0d3479] text-white shadow-xs'
                  : 'bg-white text-[#444444] border border-[#cccccc] hover:bg-slate-50'
              }`}
            >
              🏢 Quotation Sections
            </button>
            <button
              onClick={() => handleSelectLibrary('labour_po')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'labour_po'
                  ? 'bg-[#0d3479] text-white shadow-xs'
                  : 'bg-white text-[#444444] border border-[#cccccc] hover:bg-slate-50'
              }`}
            >
              🔨 Work Order & Labour PO
            </button>
            <button
              onClick={() => handleSelectLibrary('invoice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'invoice'
                  ? 'bg-[#0d3479] text-white shadow-xs'
                  : 'bg-white text-[#444444] border border-[#cccccc] hover:bg-slate-50'
              }`}
            >
              🧾 Tax Invoice & Billing
            </button>
            <button
              onClick={() => handleSelectLibrary('subcontract')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'subcontract'
                  ? 'bg-[#0d3479] text-white shadow-xs'
                  : 'bg-white text-[#444444] border border-[#cccccc] hover:bg-slate-50'
              }`}
            >
              📋 Subcontract Agreements
            </button>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#8b9dbc] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sections (e.g. payment, safety, scope)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#cccccc] rounded-xl pl-9 pr-3 py-2 text-xs text-black placeholder-[#888888] focus:outline-none focus:border-[#0d3479] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#888888] hover:text-black text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
          
          <div className="col-span-5 flex flex-col space-y-3 min-h-0 bg-white p-4 rounded-2xl border border-[#cccccc] shadow-xs">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#0d3479] tracking-wider flex items-center space-x-1.5">
                <span>1. Select Section Template</span>
              </span>
              <span className="text-[10px] text-[#666666] font-mono">
                {displayedPresets.length} available
              </span>
            </div>

            {!searchQuery && (
              <div className="flex items-center justify-between gap-2 bg-[#f7f7f2] border border-[#cccccc] rounded-xl px-3 py-2 shrink-0">
                <span className="text-[11px] font-bold text-[#333333] shrink-0 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Category:</span>
                </span>
                <select
                  value={selectedCategoryId || 'all_cats'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCategoryId(val);
                    if (val !== 'all_cats') {
                      const cat = availableCategories.find((c) => c.id === val);
                      if (cat && cat.sections.length > 0) {
                        setSelectedPresetId(cat.sections[0].id);
                        setCustomTitle(cat.sections[0].title);
                      }
                    }
                  }}
                  className="bg-transparent text-xs text-[#0d3479] font-bold focus:outline-none cursor-pointer w-full text-right"
                >
                  <option value="all_cats" className="bg-white text-black">
                    🌟 All Categories ({availableCategories.reduce((a, c) => a + c.sections.length, 0)} templates)
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white text-black">
                      {cat.name} ({cat.sections.length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {displayedPresets.length === 0 ? (
                <div className="p-8 text-center text-[#888888] text-xs">
                  No sections match your search. Try another keyword.
                </div>
              ) : (
                displayedPresets.map(({ section: preset, category: parentCat }) => {
                  const isSelected = activePresetItem?.id === preset.id;
                  const badge = getFormatBadge(preset.contentType);

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        isSelected
                          ? 'bg-[#dfe7f4] border-[#0d3479] text-black shadow-xs ring-1 ring-[#0d3479]/30'
                          : 'bg-[#f7f7f2] border-[#cccccc] text-[#333333] hover:bg-white hover:border-[#999999]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs leading-snug text-black flex-1">
                          {preset.name}
                        </h4>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#555555] line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="text-[9px] text-[#0d3479] font-mono flex items-center space-x-1 pt-0.5 font-semibold">
                        <span>📁 {parentCat.name}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          <div className="col-span-7 flex flex-col space-y-3 bg-white p-4 rounded-2xl border border-[#cccccc] overflow-hidden shadow-xs">
            
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#0d3479] tracking-wider flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>2. Live Document Print Preview</span>
                </span>
                <span className="text-[10px] text-[#666666]">
                  Exact print appearance
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-1">
                  Section Header on Document:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter section title in document..."
                  className="w-full bg-[#f7f7f2] border border-[#cccccc] focus:border-[#0d3479] rounded-xl px-3.5 py-2 text-xs text-black font-bold placeholder-[#888888] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#e5e3d9] p-4 rounded-xl border border-[#cccccc] shadow-inner">
              {!activePresetItem ? (
                <div className="h-full flex items-center justify-center text-[#888888] text-xs">
                  Select a section template from the left list to view live preview
                </div>
              ) : (
                <div className="bg-white text-black p-6 rounded-lg shadow-sm border border-gray-200 text-xs font-serif leading-relaxed space-y-3 min-h-[360px]">
                  
                  <div className="border-b border-black pb-1.5 mb-2">
                    <h3 className="font-bold text-[13px] uppercase tracking-wide text-black">
                      {customTitle || activePresetItem.title}
                    </h3>
                  </div>

                  {activePresetItem.contentType === 'paragraphs' && (
                    <div className="space-y-2 text-[11.5px] leading-relaxed text-black text-justify">
                      {(activePresetItem.paragraphs || []).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  )}

                  {activePresetItem.contentType === 'bullet_list' && (
                    <ul className="list-disc list-inside space-y-1.5 text-[11.5px] pl-1 text-black">
                      {(activePresetItem.bullets || []).map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  )}

                  {activePresetItem.contentType === 'legal_clause' && (
                    <ol className="list-decimal list-inside space-y-2 text-[11.5px] pl-1 text-black text-justify">
                      {(activePresetItem.paragraphs || []).map((p, i) => (
                        <li key={i} className="leading-relaxed">{p}</li>
                      ))}
                    </ol>
                  )}

                  {activePresetItem.contentType === 'table' && (
                    <div className="border border-black my-2 text-[11px]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b border-black font-bold">
                            {(activePresetItem.tableHeaders || []).map((h, i) => (
                              <th key={i} className="p-1.5 text-left border-r border-black last:border-r-0 text-black">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(activePresetItem.tableRows || []).map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-black last:border-b-0">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 text-black">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {activePresetItem.contentType === 'key_value' && (
                    <div className="border border-black my-2 text-[11.5px]">
                      <table className="w-full border-collapse">
                        <tbody>
                          {(activePresetItem.keyValuePairs || []).map((kv, i) => (
                            <tr key={i} className="border-b border-black last:border-b-0">
                              <td className="p-2 font-bold border-r border-black w-1/3 bg-gray-50 align-top text-black">
                                {kv.key}
                              </td>
                              <td className="p-2 align-top text-black">
                                {kv.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activePresetItem.contentType === 'callout' && (
                    <div className="border-2 border-black p-3 my-2 bg-gray-50 text-[11.5px] leading-relaxed">
                      <div className="font-bold text-[12px] uppercase tracking-wider mb-1 text-black">
                        {activePresetItem.calloutType === 'warning'
                          ? 'MANDATORY DIRECTIVE / WARNING'
                          : activePresetItem.calloutType === 'important'
                          ? 'IMPORTANT NOTICE'
                          : 'SPECIAL NOTICE'}
                      </div>
                      <p className="italic text-black">{activePresetItem.calloutText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-[#cccccc] pt-3.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-black border border-[#cccccc] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!activePresetItem}
            className="bg-[#0d3479] hover:bg-[#123f8f] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer active:scale-95 px-6 py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Section to Document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
