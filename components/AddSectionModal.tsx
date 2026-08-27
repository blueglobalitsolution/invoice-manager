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
        return { label: 'Bullet Points', color: 'bg-blue-950/80 text-blue-300 border-blue-800' };
      case 'table':
        return { label: 'Data Table', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' };
      case 'legal_clause':
        return { label: 'Numbered Clauses', color: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      case 'key_value':
        return { label: 'Key-Value Table', color: 'bg-purple-950/80 text-purple-300 border-purple-800' };
      case 'callout':
        return { label: 'Notice Box', color: 'bg-rose-950/80 text-rose-300 border-rose-800' };
      default:
        return { label: 'Standard Text', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 bottom-0 left-14 right-0 z-40 overflow-hidden select-none">
      {/* Backdrop (Only covers workspace to the right of left sidebar rail) */}
      <div
        onClick={onClose}
        className="fixed top-0 bottom-0 left-14 right-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* Spacious Studio Drawer anchored seamlessly to the right edge of Left Rail */}
      <div className="fixed top-0 bottom-0 left-14 w-full md:w-[1160px] lg:w-[1240px] max-w-[calc(100vw-3.5rem)] bg-[#0c1322] border-r border-gray-700/80 shadow-[14px_0_45px_rgba(0,0,0,0.85)] z-50 flex flex-col p-6 text-gray-200 animate-in slide-in-from-left duration-300 ease-out space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <h3 className="font-bold text-lg text-white">Add Section to Document</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Choose a pre-built section from the library or search for specific clauses, tables, and terms
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Template Library Filter Pills & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          {/* Library Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => handleSelectLibrary('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#1e293b] text-gray-300 hover:bg-gray-700'
              }`}
            >
              🌟 All Sections (30+)
            </button>
            <button
              onClick={() => handleSelectLibrary('quotation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'quotation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#1e293b] text-gray-300 hover:bg-gray-700'
              }`}
            >
              🏢 Quotation Sections
            </button>
            <button
              onClick={() => handleSelectLibrary('labour_po')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'labour_po'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#1e293b] text-gray-300 hover:bg-gray-700'
              }`}
            >
              🔨 Work Order & Labour PO
            </button>
            <button
              onClick={() => handleSelectLibrary('invoice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'invoice'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#1e293b] text-gray-300 hover:bg-gray-700'
              }`}
            >
              🧾 Tax Invoice & Billing
            </button>
            <button
              onClick={() => handleSelectLibrary('subcontract')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeLibraryId === 'subcontract'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#1e293b] text-gray-300 hover:bg-gray-700'
              }`}
            >
              📋 Subcontract Agreements
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sections (e.g. payment, safety, scope)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main 2-Column Spacious Studio Layout */}
        <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
          
          {/* Left Column: Categories & Preset Templates Browser (5 Cols) */}
          <div className="col-span-5 flex flex-col space-y-3 min-h-0 bg-[#0d1420] p-4 rounded-2xl border border-gray-800">
            
            {/* Step 1 Label */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider flex items-center space-x-1.5">
                <span>1. Select Section Template</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {displayedPresets.length} available
              </span>
            </div>

            {/* Category Dropdown Filter (Replaces horizontal slider) */}
            {!searchQuery && (
              <div className="flex items-center justify-between gap-2 bg-[#16202f] border border-gray-700/80 rounded-xl px-3 py-2 shrink-0">
                <span className="text-[11px] font-bold text-gray-300 shrink-0 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
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
                  className="bg-transparent text-xs text-emerald-300 font-bold focus:outline-none cursor-pointer w-full text-right"
                >
                  <option value="all_cats" className="bg-[#16202f] text-white">
                    🌟 All Categories ({availableCategories.reduce((a, c) => a + c.sections.length, 0)} templates)
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#16202f] text-white">
                      {cat.name} ({cat.sections.length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Presets List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {displayedPresets.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
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
                          ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50'
                          : 'bg-[#16202f] border-gray-800 text-gray-300 hover:bg-[#1d2b3f] hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs leading-snug text-white flex-1">
                          {preset.name}
                        </h4>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="text-[9px] text-emerald-400/90 font-mono flex items-center space-x-1 pt-0.5">
                        <span>📁 {parentCat.name}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Spacious Real Document Paper Preview (7 Cols) */}
          <div className="col-span-7 flex flex-col space-y-3 bg-[#0d1420] p-4 rounded-2xl border border-gray-800 overflow-hidden">
            
            {/* Step 2 Header & Custom Title Input */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Live Document Print Preview</span>
                </span>
                <span className="text-[10px] text-gray-400">
                  Exact print appearance
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 mb-1">
                  Section Header on Document:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter section title in document..."
                  className="w-full bg-[#16202f] border border-gray-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white font-bold placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Large White Document Canvas Sheet */}
            <div className="flex-1 bg-[#070b13] border border-gray-800 rounded-xl p-4 overflow-y-auto scrollbar-thin flex flex-col items-center">
              {!activePresetItem ? (
                <div className="text-gray-500 text-center py-20 text-xs">
                  Select a section from the left panel to preview how it will appear in your document.
                </div>
              ) : (
                <div className="w-full bg-white text-gray-900 rounded-lg p-6 shadow-2xl border border-gray-300 font-sans min-h-full">
                  {/* Authentic Document Section Header */}
                  <h2 className="text-[13px] font-bold text-[#505050] mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
                    {customTitle.trim() || activePresetItem.title || activePresetItem.name}
                  </h2>

                  {/* Bullet List Content */}
                  {activePresetItem.contentType === 'bullet_list' && (
                    <ul className="list-disc list-inside space-y-2 pl-1 text-[11.5px] text-black leading-relaxed text-justify">
                      {(activePresetItem.bullets || []).map((b, i) => (
                        <li key={i} className="text-black">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Legal Clauses Content */}
                  {activePresetItem.contentType === 'legal_clause' && (
                    <div className="space-y-2.5 text-justify leading-relaxed text-black text-[11.5px]">
                      {(activePresetItem.paragraphs || []).map((p, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <span className="font-bold text-black font-mono shrink-0 text-[11.5px]">
                            {i + 1}.0
                          </span>
                          <p className="flex-1 text-black">{p}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Paragraphs Content */}
                  {activePresetItem.contentType === 'paragraphs' && (
                    <div className="space-y-2.5 text-justify leading-relaxed text-black text-[11.5px]">
                      {(activePresetItem.paragraphs || []).map((p, i) => (
                        <p key={i} className="text-black">{p}</p>
                      ))}
                    </div>
                  )}

                  {/* Data Table Content */}
                  {activePresetItem.contentType === 'table' && (
                    <div className="border border-black my-2 overflow-x-auto">
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-black bg-gray-100 font-bold">
                            {(activePresetItem.tableHeaders || []).map((h, i) => (
                              <th key={i} className="p-2 border-r border-black last:border-r-0 text-left text-black font-bold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(activePresetItem.tableRows || []).map((row, rI) => (
                            <tr key={rI} className="border-b border-black last:border-b-0">
                              {row.map((cell, cI) => (
                                <td key={cI} className="p-2 border-r border-black last:border-r-0 align-top text-black">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Key-Value Table Content */}
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

                  {/* Notice Box / Callout Content */}
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

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-gray-800 pt-3.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!activePresetItem}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-900/50 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Section to Document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
