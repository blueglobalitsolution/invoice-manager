'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Save,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ListChecks,
  Scale,
  Table as TableIcon,
  AlertTriangle,
  FileText,
  Check,
  Eye,
  Sliders,
  HelpCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  SectionTemplateCategory,
  SectionPresetItem,
  TemplateSectionLibrary,
  loadTemplateSectionLibrary,
  saveTemplateSectionLibrary,
  resetLibraryToDefaults,
  getIconComponent,
} from '@/lib/section-presets';
import { SectionContentType } from '@/types/document';
import { FormattedText } from '@/lib/format-text';

interface SectionLibraryManagerProps {
  onInsertToDocument?: (section: SectionPresetItem) => void;
}

export const SectionLibraryManager: React.FC<SectionLibraryManagerProps> = ({
  onInsertToDocument,
}) => {
  const [libraries, setLibraries] = useState<TemplateSectionLibrary[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('labour_po');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  // Add Section Modal State
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState<boolean>(false);
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [newSectionTitle, setNewSectionTitle] = useState<string>('');
  const [newSectionContentType, setNewSectionContentType] = useState<SectionContentType>('table');

  // Editing Section State
  const [editingSection, setEditingSection] = useState<SectionPresetItem | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const loaded = loadTemplateSectionLibrary();
    setLibraries(loaded);
    if (loaded.length > 0) {
      setActiveTemplateId(loaded[0].templateId);
      if (loaded[0].categories.length > 0) {
        setActiveCategoryId(loaded[0].categories[0].id);
        if (loaded[0].categories[0].sections.length > 0) {
          setActiveSectionId(loaded[0].categories[0].sections[0].id);
          setEditingSection(JSON.parse(JSON.stringify(loaded[0].categories[0].sections[0])));
        }
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeLibrary = libraries.find((l) => l.templateId === activeTemplateId) || libraries[0];
  const activeCategory =
    activeLibrary?.categories.find((c) => c.id === activeCategoryId) ||
    activeLibrary?.categories[0];
  const activeSection =
    activeCategory?.sections.find((s) => s.id === activeSectionId) ||
    activeCategory?.sections[0];

  // Change Template selection
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    const lib = libraries.find((l) => l.templateId === templateId);
    if (lib && lib.categories.length > 0) {
      setActiveCategoryId(lib.categories[0].id);
      if (lib.categories[0].sections.length > 0) {
        setActiveSectionId(lib.categories[0].sections[0].id);
        setEditingSection(JSON.parse(JSON.stringify(lib.categories[0].sections[0])));
      } else {
        setActiveSectionId('');
        setEditingSection(null);
      }
    } else {
      setActiveCategoryId('');
      setActiveSectionId('');
      setEditingSection(null);
    }
  };

  // Change Category selection
  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    const cat = activeLibrary?.categories.find((c) => c.id === catId);
    if (cat && cat.sections.length > 0) {
      setActiveSectionId(cat.sections[0].id);
      setEditingSection(JSON.parse(JSON.stringify(cat.sections[0])));
    } else {
      setActiveSectionId('');
      setEditingSection(null);
    }
  };

  // Change Section selection
  const handleSelectSection = (secId: string) => {
    setActiveSectionId(secId);
    const sec = activeCategory?.sections.find((s) => s.id === secId);
    if (sec) {
      setEditingSection(JSON.parse(JSON.stringify(sec)));
      setHasUnsavedChanges(false);
    }
  };

  // Save current section changes to library
  const handleSaveSection = () => {
    if (!editingSection || !activeLibrary || !activeCategory) return;
    const updatedLibraries = JSON.parse(JSON.stringify(libraries)) as TemplateSectionLibrary[];
    const targetLib = updatedLibraries.find((l) => l.templateId === activeTemplateId);
    if (!targetLib) return;

    const targetCat = targetLib.categories.find((c) => c.id === activeCategoryId);
    if (!targetCat) return;

    const secIdx = targetCat.sections.findIndex((s) => s.id === editingSection.id);
    if (secIdx !== -1) {
      targetCat.sections[secIdx] = JSON.parse(JSON.stringify(editingSection));
    } else {
      targetCat.sections.push(JSON.parse(JSON.stringify(editingSection)));
    }

    setLibraries(updatedLibraries);
    saveTemplateSectionLibrary(updatedLibraries);
    setHasUnsavedChanges(false);
    showToast(`Saved "${editingSection.name}" to library!`);
  };

  // Open Add Section Modal Popup
  const handleOpenAddSectionModal = () => {
    setNewSectionName('');
    setNewSectionTitle('');
    setNewSectionContentType('table');
    setIsAddSectionModalOpen(true);
  };

  // Confirm Creation of Section with Metadata
  const handleConfirmCreateSection = () => {
    if (!activeLibrary || !activeCategory) return;

    const nameToUse = newSectionName.trim() || `New ${newSectionContentType.replace('_', ' ')} Section`;
    const titleToUse = newSectionTitle.trim() || nameToUse.toUpperCase();
    const type = newSectionContentType;

    const newSec: SectionPresetItem = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: nameToUse,
      title: titleToUse,
      description: 'Custom user defined section preset template',
      contentType: type,
      bullets: type === 'bullet_list' ? ['First requirement bullet point item here.'] : undefined,
      paragraphs:
        type === 'paragraphs' || type === 'legal_clause'
          ? ['The parties agree to fulfill all contractual obligations specified herein.']
          : undefined,
      tableHeaders:
        type === 'table' ? ['Item No', 'Description of Work', 'Unit', 'Specification'] : undefined,
      tableRows:
        type === 'table'
          ? [
              ['1.01', 'Primary Structural Member Supply', 'MT', 'IS 2062 Grade E250 / ASTM A572'],
              ['1.02', 'Sandblasting & Epoxy Primer Coating', 'SQM', 'Min DFT 75 microns'],
            ]
          : undefined,
      keyValuePairs:
        type === 'key_value'
          ? [
              { key: 'Parameter / Spec', value: 'Value / Rating' },
              { key: 'Compliance Standard', value: 'IS Standard Reference' },
            ]
          : undefined,
      calloutText:
        type === 'callout'
          ? 'MANDATORY DIRECTIVE: Ensure all quality, safety, and site engineering specifications are strictly complied with.'
          : undefined,
      calloutType: type === 'callout' ? 'warning' : undefined,
    };

    const updatedLibraries = JSON.parse(JSON.stringify(libraries)) as TemplateSectionLibrary[];
    const targetLib = updatedLibraries.find((l) => l.templateId === activeTemplateId);
    if (!targetLib) return;

    const targetCat = targetLib.categories.find((c) => c.id === activeCategoryId);
    if (!targetCat) return;

    targetCat.sections.push(newSec);
    setLibraries(updatedLibraries);
    saveTemplateSectionLibrary(updatedLibraries);

    setActiveSectionId(newSec.id);
    setEditingSection(newSec);
    setIsAddSectionModalOpen(false);
    showToast(`Created section "${newSec.name}"`);
  };

  // Duplicate Section
  const handleDuplicateSection = (sec: SectionPresetItem) => {
    if (!activeLibrary || !activeCategory) return;
    const cloned: SectionPresetItem = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${sec.name} (Copy)`,
      title: `${sec.title} (Copy)`,
    };

    const updatedLibraries = JSON.parse(JSON.stringify(libraries)) as TemplateSectionLibrary[];
    const targetLib = updatedLibraries.find((l) => l.templateId === activeTemplateId);
    if (!targetLib) return;

    const targetCat = targetLib.categories.find((c) => c.id === activeCategoryId);
    if (!targetCat) return;

    targetCat.sections.push(cloned);
    setLibraries(updatedLibraries);
    saveTemplateSectionLibrary(updatedLibraries);

    setActiveSectionId(cloned.id);
    setEditingSection(cloned);
    showToast(`Duplicated section to "${cloned.name}"`);
  };

  // Delete Section
  const handleDeleteSection = (secId: string) => {
    if (!activeLibrary || !activeCategory) return;
    if (!confirm('Are you sure you want to remove this section from the category?')) return;

    const updatedLibraries = JSON.parse(JSON.stringify(libraries)) as TemplateSectionLibrary[];
    const targetLib = updatedLibraries.find((l) => l.templateId === activeTemplateId);
    if (!targetLib) return;

    const targetCat = targetLib.categories.find((c) => c.id === activeCategoryId);
    if (!targetCat) return;

    targetCat.sections = targetCat.sections.filter((s) => s.id !== secId);
    setLibraries(updatedLibraries);
    saveTemplateSectionLibrary(updatedLibraries);

    if (targetCat.sections.length > 0) {
      setActiveSectionId(targetCat.sections[0].id);
      setEditingSection(JSON.parse(JSON.stringify(targetCat.sections[0])));
    } else {
      setActiveSectionId('');
      setEditingSection(null);
    }
    showToast('Section removed from library.');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (!confirm('Reset all template sections to system defaults?')) return;
    const defs = resetLibraryToDefaults();
    setLibraries(defs);
    setActiveTemplateId(defs[0].templateId);
    setActiveCategoryId(defs[0].categories[0].id);
    setActiveSectionId(defs[0].categories[0].sections[0].id);
    setEditingSection(JSON.parse(JSON.stringify(defs[0].categories[0].sections[0])));
    showToast('Section library reset to defaults.');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f4f3eb] text-black overflow-hidden select-none">
      {/* Top Banner Toolbar */}
      <div className="h-11 bg-[#002057] border-b border-[#15428a] px-4 flex items-center justify-between shrink-0 text-white shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-[#0d3479] text-white border border-[#2356a8] rounded-lg">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Section & Preset Library
            </h2>
            <p className="text-[10px] text-white/70">
              Customize pre-filled sections and tables for document templates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toast alert */}
          {toastMessage && (
            <div className="text-xs font-bold text-white bg-emerald-700 border border-emerald-600 px-2.5 py-1 rounded-lg animate-in fade-in">
              ✓ {toastMessage}
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-[#002057] hover:bg-slate-100 bg-white font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
            title="Reset library to system defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#002057]" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Architecture */}
      <div className="flex-1 flex overflow-hidden">
        {/* =========================================================================
            COLUMN 1: TEMPLATE & CATEGORIES LIST
            ========================================================================= */}
        <div className="w-64 bg-[#f7f7f2] border-r border-[#cccccc] flex flex-col shrink-0 overflow-hidden">
          {/* Template Blueprint Switcher */}
          <div className="p-3 border-b border-[#cccccc] bg-[#f0efe6] space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-[#0d3479] tracking-wider">
              Template Blueprint
            </label>
            <select
              value={activeTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full bg-white border border-[#cccccc] rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#0d3479] font-bold shadow-xs cursor-pointer"
            >
              {libraries.map((lib) => (
                <option key={lib.templateId} value={lib.templateId}>
                  {lib.templateName}
                </option>
              ))}
            </select>
          </div>

          {/* Categories Header */}
          <div className="p-3 border-b border-[#cccccc] flex items-center justify-between bg-[#f0efe6]">
            <span className="text-[11px] font-bold text-[#0d3479] uppercase tracking-wider">
              Categories ({activeLibrary?.categories.length || 0})
            </span>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {activeLibrary?.categories.map((cat) => {
              const Icon = getIconComponent(cat.iconName);
              const isSelected = cat.id === activeCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-xs ${
                    isSelected
                      ? 'bg-[#dfe7f4] border-[#0d3479] text-[#0d3479] font-bold ring-1 ring-[#0d3479]/30'
                      : 'bg-white border-[#cccccc] text-black hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-[#0d3479] text-white'
                          : 'bg-[#dfe7f4] text-[#0d3479]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs truncate">{cat.name}</div>
                      <div className="text-[10px] text-[#666666] flex items-center space-x-1.5">
                        <span>{cat.sections.length} sections</span>
                        <span>•</span>
                        <span className="text-[#0d3479] font-mono font-semibold">{cat.badge}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-[#0d3479]' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2: SECTIONS LIST UNDER SELECTED CATEGORY
            ========================================================================= */}
        <div className="w-72 bg-[#f7f7f2] border-r border-[#cccccc] flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-[#cccccc] flex items-center justify-between bg-[#f0efe6]">
            <div>
              <span className="text-[11px] font-bold text-[#0d3479] uppercase tracking-wider block">
                {activeCategory?.name || 'Sections'}
              </span>
              <span className="text-[10px] text-[#666666]">
                {activeCategory?.sections.length || 0} template presets
              </span>
            </div>

            {/* Add Section Button */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleOpenAddSectionModal}
                className="px-2.5 py-1 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                title="Create a new section under this category"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {/* Preset List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {(!activeCategory?.sections || activeCategory.sections.length === 0) ? (
              <div className="p-6 text-center text-[#666666] space-y-2 border border-dashed border-[#cccccc] rounded-xl my-4 bg-white">
                <p className="text-xs">No sections in this category yet.</p>
                <button
                  onClick={handleOpenAddSectionModal}
                  className="text-xs text-[#0d3479] hover:underline font-bold cursor-pointer"
                >
                  + Add First Section
                </button>
              </div>
            ) : (
              activeCategory.sections.map((sec) => {
                const isSelected = sec.id === activeSectionId;
                return (
                  <div
                    key={sec.id}
                    onClick={() => handleSelectSection(sec.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 shadow-xs ${
                      isSelected
                        ? 'bg-[#dfe7f4] border-[#0d3479] text-[#0d3479] font-bold ring-1 ring-[#0d3479]/30'
                        : 'bg-white border-[#cccccc] text-black hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs truncate max-w-[160px] ${isSelected ? 'font-bold text-[#0d3479]' : 'font-semibold text-black'}`}>
                        {sec.name}
                      </span>
                      <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                        isSelected 
                          ? 'bg-[#0d3479] text-white border-[#0d3479]' 
                          : 'bg-[#f0efe6] text-[#0d3479] border-[#cccccc]'
                      }`}>
                        {sec.contentType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#cccccc] text-[10px]">
                      <span className={`truncate max-w-[140px] ${isSelected ? 'text-[#0d3479]/80 font-semibold' : 'text-[#666666]'}`}>{sec.title}</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateSection(sec);
                          }}
                          className="text-[#666666] hover:text-[#0d3479] cursor-pointer p-0.5 transition-colors"
                          title="Duplicate Section"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.id);
                          }}
                          className="text-[#666666] hover:text-red-600 cursor-pointer p-0.5 transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================================================
            COLUMN 3: INTERACTIVE LIVE SECTION EDITOR & LIVE A4 PREVIEW
            ========================================================================= */}
        <div className="flex-1 flex overflow-hidden bg-[#f4f3eb]">
          {!editingSection ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#666666] p-8 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#cccccc] flex items-center justify-center text-[#0d3479] shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-black">Select a section to customize</h3>
              <p className="text-xs max-w-sm text-[#666666]">
                Choose any preset from the left columns to modify its contents, table rows, bullet lists, or statutory clauses.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Editor Header */}
              <div className="px-5 py-3 bg-[#f0efe6] border-b border-[#cccccc] flex items-center justify-between shrink-0 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-black flex items-center space-x-2">
                    <span>Editing Preset: {editingSection.name}</span>
                    {hasUnsavedChanges && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded font-mono">
                        Unsaved Changes
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    Category: <strong className="text-[#0d3479]">{activeCategory?.name}</strong> • Template:{' '}
                    <strong className="text-black font-semibold">{activeLibrary?.templateName}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveSection}
                    className="px-3.5 py-1.5 bg-[#002057] hover:bg-[#0d3479] text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Section</span>
                  </button>
                </div>
              </div>

              {/* Editor Body (Form on left, A4 Preview on right) */}
              <div className="flex-1 flex overflow-hidden">
                {/* Form Controls */}
                <div className="w-1/2 p-5 overflow-y-auto space-y-4 border-r border-[#cccccc] bg-[#f4f3eb] text-xs scrollbar-thin pb-28">
                  {/* Meta Settings */}
                  <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
                    <div className="bg-[#f0efe6] px-4 py-2.5 border-b border-[#cccccc] flex items-center space-x-2 font-bold text-xs text-[#0d3479] uppercase tracking-wider">
                      <Sliders className="w-4 h-4 text-[#0d3479]" />
                      <span>Section Metadata</span>
                    </div>

                    <div className="p-4 space-y-3 bg-white">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-black mb-1.5">
                            Preset Display Name
                          </label>
                          <input
                            type="text"
                            value={editingSection.name}
                            onChange={(e) => {
                              setEditingSection({ ...editingSection, name: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-1.5">
                            Section Content Type
                          </label>
                          <select
                            value={editingSection.contentType}
                            onChange={(e) => {
                              const newType = e.target.value as SectionContentType;
                              setEditingSection({
                                ...editingSection,
                                contentType: newType,
                                bullets: newType === 'bullet_list' ? (editingSection.bullets || ['New item here']) : editingSection.bullets,
                                tableHeaders: newType === 'table' ? (editingSection.tableHeaders || ['Item', 'Description', 'Unit']) : editingSection.tableHeaders,
                                tableRows: newType === 'table' ? (editingSection.tableRows || [['1', 'Sample Description', 'Nos']]) : editingSection.tableRows,
                                keyValuePairs: newType === 'key_value' ? (editingSection.keyValuePairs || [{ key: 'Key', value: 'Value' }]) : editingSection.keyValuePairs,
                              });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                          >
                            <option value="bullet_list">bullet_list (Itemized List)</option>
                            <option value="legal_clause">legal_clause (Numbered Terms)</option>
                            <option value="table">table (Tabular Matrix)</option>
                            <option value="key_value">key_value (Properties Grid)</option>
                            <option value="callout">callout (Alert / Notice Box)</option>
                            <option value="paragraphs">paragraphs (Narrative Text)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-black mb-1.5">
                          Document Printed Header Title
                        </label>
                        <input
                          type="text"
                          value={editingSection.title}
                          onChange={(e) => {
                            setEditingSection({ ...editingSection, title: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ==================== CONTENT TYPE EDITORS ==================== */}

                  {/* 1. BULLET LIST EDITOR */}
                  {editingSection.contentType === 'bullet_list' && (
                    <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
                      <div className="bg-[#f0efe6] px-4 py-2.5 border-b border-[#cccccc] flex items-center justify-between">
                        <span className="font-bold text-[#0d3479] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-[#0d3479]" />
                          <span>Bullet Items ({editingSection.bullets?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...(editingSection.bullets || []), 'New requirement bullet point.'];
                            setEditingSection({ ...editingSection, bullets: updated });
                            setHasUnsavedChanges(true);
                          }}
                          className="px-2.5 py-1 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          + Add Item
                        </button>
                      </div>

                      <div className="p-4 space-y-2 bg-white">
                        {(editingSection.bullets || []).map((bullet, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="text-xs font-bold text-black pt-2">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...(editingSection.bullets || [])];
                                updated[idx] = e.target.value;
                                setEditingSection({ ...editingSection, bullets: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="flex-1 bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs resize-none"
                            />
                            <button
                              onClick={() => {
                                const updated = (editingSection.bullets || []).filter((_, i) => i !== idx);
                                setEditingSection({ ...editingSection, bullets: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="p-1.5 text-[#888888] hover:text-red-600 pt-2 cursor-pointer transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. LEGAL CLAUSE & PARAGRAPHS EDITOR */}
                  {(editingSection.contentType === 'legal_clause' || editingSection.contentType === 'paragraphs') && (
                    <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
                      <div className="bg-[#f0efe6] px-4 py-2.5 border-b border-[#cccccc] flex items-center justify-between">
                        <span className="font-bold text-[#0d3479] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#0d3479]" />
                          <span>Legal Clauses & Paragraphs ({editingSection.paragraphs?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => {
                            const updated = [
                              ...(editingSection.paragraphs || []),
                              'The parties agree to {{PROJECT_NAME}} compliance conditions as governed by law.',
                            ];
                            setEditingSection({ ...editingSection, paragraphs: updated });
                            setHasUnsavedChanges(true);
                          }}
                          className="px-2.5 py-1 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          + Add Clause
                        </button>
                      </div>

                      <div className="p-4 space-y-3 bg-white">
                        {(editingSection.paragraphs || []).map((para, idx) => (
                          <div key={idx} className="bg-[#f7f7f2] p-3 rounded-xl border border-[#cccccc] space-y-2 shadow-xs">
                            <div className="flex items-center justify-between text-[11px] text-black font-bold font-mono">
                              <span>Clause {idx + 1}.0</span>
                              <button
                                onClick={() => {
                                  const updated = (editingSection.paragraphs || []).filter((_, i) => i !== idx);
                                  setEditingSection({ ...editingSection, paragraphs: updated });
                                  setHasUnsavedChanges(true);
                                }}
                                className="text-[#888888] hover:text-red-600 cursor-pointer p-0.5 transition-colors"
                                title="Delete Clause"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={para}
                              onChange={(e) => {
                                const updated = [...(editingSection.paragraphs || [])];
                                updated[idx] = e.target.value;
                                setEditingSection({ ...editingSection, paragraphs: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. TABLE EDITOR */}
                  {editingSection.contentType === 'table' && (
                    <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
                      <div className="bg-[#f0efe6] px-4 py-2.5 border-b border-[#cccccc] flex items-center justify-between">
                        <span className="font-bold text-[#0d3479] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <TableIcon className="w-3.5 h-3.5 text-[#0d3479]" />
                          <span>Table Matrix ({editingSection.tableRows?.length || 0} rows)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const headers = [...(editingSection.tableHeaders || ['Col 1', 'Col 2']), `Col ${(editingSection.tableHeaders?.length || 2) + 1}`];
                              const rows = (editingSection.tableRows || []).map((r) => [...r, 'New']);
                              setEditingSection({ ...editingSection, tableHeaders: headers, tableRows: rows });
                              setHasUnsavedChanges(true);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#002057] border border-[#cccccc] rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            + Add Column
                          </button>
                          <button
                            onClick={() => {
                              const colCount = editingSection.tableHeaders?.length || 2;
                              const newRow = Array(colCount).fill('Sample Data');
                              const rows = [...(editingSection.tableRows || []), newRow];
                              setEditingSection({ ...editingSection, tableRows: rows });
                              setHasUnsavedChanges(true);
                            }}
                            className="px-2.5 py-1 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            + Add Row
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 bg-white">
                        {/* Header Inputs */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wider">Column Headers</label>
                          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
                            {(editingSection.tableHeaders || []).map((hdr, hIdx) => (
                              <input
                                key={hIdx}
                                type="text"
                                value={hdr}
                                onChange={(e) => {
                                  const updatedHeaders = [...(editingSection.tableHeaders || [])];
                                  updatedHeaders[hIdx] = e.target.value;
                                  setEditingSection({ ...editingSection, tableHeaders: updatedHeaders });
                                  setHasUnsavedChanges(true);
                                }}
                                className="px-2.5 py-1.5 bg-[#f7f7f2] border border-[#cccccc] rounded-lg text-xs font-bold text-[#0d3479] min-w-[100px] focus:outline-none focus:border-[#0d3479] shadow-xs"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Rows Inputs */}
                        <div className="space-y-2">
                          {(editingSection.tableRows || []).map((row, rIdx) => (
                            <div key={rIdx} className="flex items-center space-x-1.5 bg-[#f7f7f2] p-2 rounded-xl border border-[#cccccc] shadow-xs">
                              {row.map((cell, cIdx) => (
                                <input
                                  key={cIdx}
                                  type="text"
                                  value={cell}
                                  onChange={(e) => {
                                    const updatedRows = (editingSection.tableRows || []).map((r) => [...r]);
                                    updatedRows[rIdx][cIdx] = e.target.value;
                                    setEditingSection({ ...editingSection, tableRows: updatedRows });
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                                />
                              ))}
                              <button
                                onClick={() => {
                                  const updatedRows = (editingSection.tableRows || []).filter((_, i) => i !== rIdx);
                                  setEditingSection({ ...editingSection, tableRows: updatedRows });
                                  setHasUnsavedChanges(true);
                                }}
                                className="p-1.5 text-[#888888] hover:text-red-600 cursor-pointer transition-colors"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. KEY VALUE MATRIX */}
                  {editingSection.contentType === 'key_value' && (
                    <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
                      <div className="bg-[#f0efe6] px-4 py-2.5 border-b border-[#cccccc] flex items-center justify-between">
                        <span className="font-bold text-[#0d3479] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#0d3479]" />
                          <span>Key-Value Pairs ({editingSection.keyValuePairs?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...(editingSection.keyValuePairs || []), { key: 'Parameter', value: 'Value' }];
                            setEditingSection({ ...editingSection, keyValuePairs: updated });
                            setHasUnsavedChanges(true);
                          }}
                          className="px-2.5 py-1 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          + Add Pair
                        </button>
                      </div>

                      <div className="p-4 space-y-2 bg-white">
                        {(editingSection.keyValuePairs || []).map((kv, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Property / Parameter"
                              value={kv.key}
                              onChange={(e) => {
                                const updated = [...(editingSection.keyValuePairs || [])];
                                updated[idx] = { ...updated[idx], key: e.target.value };
                                setEditingSection({ ...editingSection, keyValuePairs: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-2/5 px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                            />
                            <input
                              type="text"
                              placeholder="Value / Spec"
                              value={kv.value}
                              onChange={(e) => {
                                const updated = [...(editingSection.keyValuePairs || [])];
                                updated[idx] = { ...updated[idx], value: e.target.value };
                                setEditingSection({ ...editingSection, keyValuePairs: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="flex-1 px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                            />
                            <button
                              onClick={() => {
                                const updated = (editingSection.keyValuePairs || []).filter((_, i) => i !== idx);
                                setEditingSection({ ...editingSection, keyValuePairs: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="p-1.5 text-[#888888] hover:text-red-600 cursor-pointer transition-colors"
                              title="Delete Pair"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. CALLOUT NOTICE EDITOR */}
                  {editingSection.contentType === 'callout' && (
                    <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
                      <div className="bg-[#f0efe6] px-4 py-2.5 border-b border-[#cccccc] flex items-center space-x-2 font-bold text-xs text-[#0d3479] uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Notice & Alert Box Settings</span>
                      </div>

                      <div className="p-4 space-y-3 bg-white">
                        <div>
                          <label className="block text-xs font-bold text-black mb-1.5">Callout Tone</label>
                          <select
                            value={editingSection.calloutType || 'warning'}
                            onChange={(e) => {
                              setEditingSection({
                                ...editingSection,
                                calloutType: e.target.value as any,
                              });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                          >
                            <option value="warning">Warning / Penalty Alert</option>
                            <option value="important">Important Directive</option>
                            <option value="info">Informational Notice</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-1.5">Callout Message</label>
                          <textarea
                            rows={4}
                            value={editingSection.calloutText || ''}
                            onChange={(e) => {
                              setEditingSection({ ...editingSection, calloutText: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live A4 Print Preview Pane */}
                <div className="w-1/2 p-6 bg-[#64748b] overflow-y-auto flex flex-col items-center justify-start scrollbar-thin">
                  <div className="w-full max-w-[440px] bg-white text-black p-8 rounded-xl shadow-2xl border border-gray-300 font-sans space-y-4 min-h-[360px]">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-[13px] uppercase tracking-wide text-black">
                        <FormattedText text={editingSection.title} />
                      </h4>
                      <span className="text-[9px] font-mono uppercase bg-[#dfe7f4] text-[#0d3479] font-bold px-2 py-0.5 rounded-full border border-[#b9c7de]">
                        Live Preview
                      </span>
                    </div>

                    {/* Preview Content */}
                    {editingSection.contentType === 'bullet_list' && (
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-snug">
                        {(editingSection.bullets || []).map((b, i) => (
                          <li key={i}><FormattedText text={b} /></li>
                        ))}
                      </ul>
                    )}

                    {editingSection.contentType === 'legal_clause' && (
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        {(editingSection.paragraphs || []).map((p, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="font-bold shrink-0">{i + 1}.0</span>
                            <p><FormattedText text={p} /></p>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingSection.contentType === 'paragraphs' && (
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        {(editingSection.paragraphs || []).map((p, i) => (
                          <p key={i}><FormattedText text={p} /></p>
                        ))}
                      </div>
                    )}

                    {editingSection.contentType === 'table' && (
                      <table className="w-full border-collapse border border-black text-[10px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-black font-bold">
                            {(editingSection.tableHeaders || []).map((h, i) => (
                              <th key={i} className="border-r border-black p-1.5 text-left last:border-r-0">
                                <FormattedText text={h} />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(editingSection.tableRows || []).map((row, rI) => (
                            <tr key={rI} className="border-b border-black last:border-b-0">
                              {row.map((c, cI) => (
                                <td key={cI} className="border-r border-black p-1.5 last:border-r-0">
                                  <FormattedText text={c} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {editingSection.contentType === 'key_value' && (
                      <div className="border border-black text-[10.5px]">
                        {(editingSection.keyValuePairs || []).map((kv, i) => (
                          <div key={i} className="flex border-b border-black last:border-b-0">
                            <div className="w-1/3 bg-gray-50 border-r border-black p-1.5 font-bold">
                              <FormattedText text={kv.key} />
                            </div>
                            <div className="w-2/3 p-1.5"><FormattedText text={kv.value} /></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingSection.contentType === 'callout' && (
                      <div
                        className={`p-3 rounded-lg border text-[10.5px] leading-snug ${
                          editingSection.calloutType === 'warning'
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-medium'
                            : editingSection.calloutType === 'important'
                            ? 'bg-red-50 border-red-400 text-red-950 font-medium'
                            : 'bg-blue-50 border-blue-400 text-blue-950'
                        }`}
                      >
                        <FormattedText text={editingSection.calloutText} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD SECTION METADATA MODAL POPUP */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
          <div className="bg-[#f4f3eb] border border-[#cccccc] rounded-2xl max-w-lg w-full overflow-hidden text-black shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#f0efe6] border-b border-[#cccccc] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#dfe7f4] text-[#0d3479] rounded-xl border border-[#b9c7de] shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-black">Create New Section</h3>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Category: <strong className="text-[#0d3479]">{activeCategory?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="text-[#666666] hover:text-black p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form: Section Metadata */}
            <div className="p-6 space-y-4 text-xs bg-[#f4f3eb]">
              {/* Preset Display Name */}
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Preset Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mandatory Material Inspection Matrix"
                  value={newSectionName}
                  onChange={(e) => {
                    setNewSectionName(e.target.value);
                    if (!newSectionTitle || newSectionTitle === newSectionName.toUpperCase()) {
                      setNewSectionTitle(e.target.value.toUpperCase());
                    }
                  }}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  autoFocus
                />
              </div>

              {/* Document Printed Header Title */}
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Document Printed Header Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. MANDATORY MATERIAL INSPECTION MATRIX"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>

              {/* Section Content Type Selection */}
              <div>
                <label className="block text-xs font-bold text-black mb-2">
                  Section Content Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'table', label: 'Tabular Matrix', desc: 'Columns & Rows Grid', icon: TableIcon },
                    { type: 'bullet_list', label: 'Itemized List', desc: 'Bullet Requirements', icon: ListChecks },
                    { type: 'legal_clause', label: 'Numbered Terms', desc: '1.0, 2.0 Legal Clauses', icon: Scale },
                    { type: 'key_value', label: 'Properties Grid', desc: 'Key-Value Parameter Pairs', icon: Layers },
                    { type: 'callout', label: 'Alert / Notice Box', desc: 'Warning Directive Callout', icon: AlertTriangle },
                    { type: 'paragraphs', label: 'Narrative Text', desc: 'Prose & Statements', icon: FileText },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = newSectionContentType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setNewSectionContentType(opt.type as SectionContentType)}
                        className={`p-2.5 rounded-xl border text-left flex items-start space-x-2.5 transition-all cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-[#dfe7f4] border-[#0d3479] text-[#0d3479] ring-1 ring-[#0d3479]/30'
                            : 'bg-white border-[#cccccc] text-black hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isSelected ? 'bg-[#0d3479] text-white' : 'bg-[#dfe7f4] text-[#0d3479]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold text-xs truncate ${isSelected ? 'text-[#0d3479]' : 'text-black'}`}>{opt.label}</div>
                          <div className="text-[10px] text-[#666666] truncate">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-[#f0efe6] border-t border-[#cccccc] flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-black border border-[#cccccc] font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateSection}
                className="px-5 py-2 bg-[#002057] hover:bg-[#0d3479] active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
