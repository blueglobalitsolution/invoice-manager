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
    <div className="flex flex-col h-full w-full bg-[#0d1522] text-gray-200 overflow-hidden select-none">
      {/* Top Banner Toolbar */}
      <div className="h-13 bg-[#131c2d] border-b border-[#1f2c42] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Section & Preset Library
            </h2>
            <p className="text-[10px] text-gray-400">
              Customize pre-filled sections and tables for document templates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toast alert */}
          {toastMessage && (
            <div className="text-xs font-medium text-emerald-300 bg-emerald-950/90 border border-emerald-800 px-2.5 py-1 rounded-lg animate-in fade-in">
              ✓ {toastMessage}
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleResetDefaults}
            className="px-2.5 py-1 text-gray-400 hover:text-white bg-[#1a2538] hover:bg-gray-800 border border-gray-700/80 rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            title="Reset library to system defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Architecture */}
      <div className="flex-1 flex overflow-hidden">
        {/* =========================================================================
            COLUMN 1: TEMPLATE & CATEGORIES LIST
            ========================================================================= */}
        <div className="w-64 bg-[#101827] border-r border-[#1e293b] flex flex-col shrink-0 overflow-hidden">
          {/* Template Blueprint Switcher */}
          <div className="p-3 border-b border-[#1e293b] bg-[#0c1320] space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
              Template Blueprint
            </label>
            <select
              value={activeTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full bg-[#162133] border border-[#25354e] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              {libraries.map((lib) => (
                <option key={lib.templateId} value={lib.templateId}>
                  {lib.templateName}
                </option>
              ))}
            </select>
          </div>

          {/* Categories Header */}
          <div className="p-3 border-b border-[#1e293b] flex items-center justify-between bg-[#0e1624]">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
              Categories ({activeLibrary?.categories.length || 0})
            </span>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeLibrary?.categories.map((cat) => {
              const Icon = getIconComponent(cat.iconName);
              const isSelected = cat.id === activeCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#18263c] border-emerald-500/80 shadow-md text-white'
                      : 'bg-[#121b2a] border-[#1e293b] text-gray-300 hover:bg-[#152236]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">{cat.name}</div>
                      <div className="text-[10px] text-gray-400 flex items-center space-x-1.5">
                        <span>{cat.sections.length} sections</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">{cat.badge}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-emerald-400' : 'text-gray-600'
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
        <div className="w-72 bg-[#121a28] border-r border-[#1e293b] flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-[#1e293b] flex items-center justify-between bg-[#0e1624]">
            <div>
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                {activeCategory?.name || 'Sections'}
              </span>
              <span className="text-[10px] text-gray-400">
                {activeCategory?.sections.length || 0} template presets
              </span>
            </div>

            {/* Add Section Button */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleOpenAddSectionModal}
                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Create a new section under this category"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {/* Preset List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {(!activeCategory?.sections || activeCategory.sections.length === 0) ? (
              <div className="p-6 text-center text-gray-500 space-y-2 border border-dashed border-gray-800 rounded-xl my-4">
                <p className="text-xs">No sections in this category yet.</p>
                <button
                  onClick={handleOpenAddSectionModal}
                  className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
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
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-[#1b283d] border-emerald-500/80 shadow text-white ring-1 ring-emerald-500/30'
                        : 'bg-[#141e2e] border-[#1e293b] text-gray-300 hover:bg-[#172336]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate max-w-[170px]">
                        {sec.name}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                        {sec.contentType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 text-[10px] text-gray-500">
                      <span className="truncate max-w-[150px] font-medium text-gray-400">{sec.title}</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateSection(sec);
                          }}
                          className="hover:text-emerald-400 cursor-pointer p-0.5"
                          title="Duplicate Section"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.id);
                          }}
                          className="hover:text-red-400 cursor-pointer p-0.5"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3 h-3" />
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
        <div className="flex-1 flex overflow-hidden bg-[#0c1320]">
          {!editingSection ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/50 flex items-center justify-center text-gray-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-400">Select a section to customize</h3>
              <p className="text-xs max-w-sm">
                Choose any preset from the left columns to modify its contents, table rows, bullet lists, or statutory clauses.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Editor Header */}
              <div className="p-4 bg-[#141e2e] border-b border-[#1f2d42] flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Editing Preset: {editingSection.name}</span>
                    {hasUnsavedChanges && (
                      <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded font-mono">
                        Unsaved Changes
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Category: <strong className="text-emerald-400">{activeCategory?.name}</strong> • Template:{' '}
                    <strong className="text-gray-300">{activeLibrary?.templateName}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveSection}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Section</span>
                  </button>
                </div>
              </div>

              {/* Editor Body (Form on left, A4 Preview on right) */}
              <div className="flex-1 flex overflow-hidden">
                {/* Form Controls */}
                <div className="w-1/2 p-5 overflow-y-auto space-y-5 border-r border-[#1f2d42] text-xs scrollbar-thin pb-28">
                  {/* Meta Settings */}
                  <div className="bg-[#152133] p-3.5 rounded-xl border border-[#21324c] space-y-3">
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Section Metadata</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                          Preset Display Name
                        </label>
                        <input
                          type="text"
                          value={editingSection.name}
                          onChange={(e) => {
                            setEditingSection({ ...editingSection, name: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">
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
                          className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-white font-mono"
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
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                        Document Printed Header Title
                      </label>
                      <input
                        type="text"
                        value={editingSection.title}
                        onChange={(e) => {
                          setEditingSection({ ...editingSection, title: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* ==================== CONTENT TYPE EDITORS ==================== */}

                  {/* 1. BULLET LIST EDITOR */}
                  {editingSection.contentType === 'bullet_list' && (
                    <div className="bg-[#152133] p-4 rounded-xl border border-[#21324c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Bullet Items ({editingSection.bullets?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...(editingSection.bullets || []), 'New requirement bullet point.'];
                            setEditingSection({ ...editingSection, bullets: updated });
                            setHasUnsavedChanges(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-700/40 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          + Add Item
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(editingSection.bullets || []).map((bullet, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="text-xs font-mono text-gray-500 pt-1.5">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...(editingSection.bullets || [])];
                                updated[idx] = e.target.value;
                                setEditingSection({ ...editingSection, bullets: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-white text-xs leading-relaxed focus:border-emerald-500 focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const updated = (editingSection.bullets || []).filter((_, i) => i !== idx);
                                setEditingSection({ ...editingSection, bullets: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-400 pt-2 cursor-pointer transition-colors"
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
                    <div className="bg-[#152133] p-4 rounded-xl border border-[#21324c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
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
                          className="px-2.5 py-1 bg-emerald-700/40 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          + Add Clause
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(editingSection.paragraphs || []).map((para, idx) => (
                          <div key={idx} className="bg-[#0e1624] p-3 rounded-lg border border-[#253752] space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                              <span>Clause {idx + 1}.0</span>
                              <button
                                onClick={() => {
                                  const updated = (editingSection.paragraphs || []).filter((_, i) => i !== idx);
                                  setEditingSection({ ...editingSection, paragraphs: updated });
                                  setHasUnsavedChanges(true);
                                }}
                                className="text-gray-500 hover:text-red-400 cursor-pointer p-0.5"
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
                              className="w-full px-2.5 py-1.5 bg-[#141f30] border border-[#253752] rounded-lg text-white text-xs leading-relaxed focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. TABLE EDITOR */}
                  {editingSection.contentType === 'table' && (
                    <div className="bg-[#152133] p-4 rounded-xl border border-[#21324c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
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
                            className="px-2.5 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
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
                            className="px-2.5 py-1 bg-emerald-700/40 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            + Add Row
                          </button>
                        </div>
                      </div>

                      {/* Header Inputs */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Column Headers</label>
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
                              className="px-2.5 py-1 bg-[#0e1624] border border-gray-700 rounded-lg text-xs font-bold text-emerald-300 min-w-[100px] focus:border-emerald-500 focus:outline-none"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Rows Inputs */}
                      <div className="space-y-2">
                        {(editingSection.tableRows || []).map((row, rIdx) => (
                          <div key={rIdx} className="flex items-center space-x-1.5 bg-[#0e1624] p-2 rounded-lg border border-[#253752]">
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
                                className="flex-1 px-2 py-1 bg-[#141f30] border border-gray-800 rounded text-xs text-white focus:border-emerald-500 focus:outline-none"
                              />
                            ))}
                            <button
                              onClick={() => {
                                const updatedRows = (editingSection.tableRows || []).filter((_, i) => i !== rIdx);
                                setEditingSection({ ...editingSection, tableRows: updatedRows });
                                setHasUnsavedChanges(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. KEY VALUE MATRIX */}
                  {editingSection.contentType === 'key_value' && (
                    <div className="bg-[#152133] p-4 rounded-xl border border-[#21324c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Key-Value Pairs ({editingSection.keyValuePairs?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...(editingSection.keyValuePairs || []), { key: 'Parameter', value: 'Value' }];
                            setEditingSection({ ...editingSection, keyValuePairs: updated });
                            setHasUnsavedChanges(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-700/40 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          + Add Pair
                        </button>
                      </div>

                      <div className="space-y-2">
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
                              className="w-2/5 px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-xs text-emerald-300 font-semibold focus:border-emerald-500 focus:outline-none"
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
                              className="flex-1 px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const updated = (editingSection.keyValuePairs || []).filter((_, i) => i !== idx);
                                setEditingSection({ ...editingSection, keyValuePairs: updated });
                                setHasUnsavedChanges(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
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
                    <div className="bg-[#152133] p-3.5 rounded-xl border border-[#21324c] space-y-3">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Notice & Alert Box Settings</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Callout Tone</label>
                        <select
                          value={editingSection.calloutType || 'warning'}
                          onChange={(e) => {
                            setEditingSection({
                              ...editingSection,
                              calloutType: e.target.value as any,
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-white"
                        >
                          <option value="warning">Warning / Penalty Alert</option>
                          <option value="important">Important Directive</option>
                          <option value="info">Informational Notice</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Callout Message</label>
                        <textarea
                          rows={4}
                          value={editingSection.calloutText || ''}
                          onChange={(e) => {
                            setEditingSection({ ...editingSection, calloutText: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#253752] rounded-lg text-white text-[11px] leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Live A4 Print Preview Pane */}
                <div className="w-1/2 p-4 bg-[#080d17] overflow-y-auto flex flex-col items-center">
                  <div className="w-full max-w-[420px] bg-white text-black p-6 rounded shadow-2xl border border-gray-300 font-sans space-y-3 min-h-[300px]">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h4 className="font-bold text-[13px] uppercase tracking-wide text-[#111]">
                        {editingSection.title}
                      </h4>
                      <span className="text-[9px] font-mono uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                        Live Preview
                      </span>
                    </div>

                    {/* Preview Content */}
                    {editingSection.contentType === 'bullet_list' && (
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-snug">
                        {(editingSection.bullets || []).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}

                    {editingSection.contentType === 'legal_clause' && (
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        {(editingSection.paragraphs || []).map((p, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="font-bold shrink-0">{i + 1}.0</span>
                            <p>{p}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingSection.contentType === 'paragraphs' && (
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        {(editingSection.paragraphs || []).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}

                    {editingSection.contentType === 'table' && (
                      <table className="w-full border-collapse border border-black text-[10px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-black font-bold">
                            {(editingSection.tableHeaders || []).map((h, i) => (
                              <th key={i} className="border-r border-black p-1 text-left last:border-r-0">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(editingSection.tableRows || []).map((row, rI) => (
                            <tr key={rI} className="border-b border-black last:border-b-0">
                              {row.map((c, cI) => (
                                <td key={cI} className="border-r border-black p-1 last:border-r-0">
                                  {c}
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
                            <div className="w-1/3 bg-gray-50 border-r border-black p-1 font-bold">
                              {kv.key}
                            </div>
                            <div className="w-2/3 p-1">{kv.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingSection.contentType === 'callout' && (
                      <div
                        className={`p-2.5 rounded border text-[10.5px] leading-snug ${
                          editingSection.calloutType === 'warning'
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-medium'
                            : editingSection.calloutType === 'important'
                            ? 'bg-red-50 border-red-400 text-red-950 font-medium'
                            : 'bg-blue-50 border-blue-400 text-blue-950'
                        }`}
                      >
                        {editingSection.calloutText}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
          <div className="bg-[#141d2b] border border-gray-700/80 rounded-2xl max-w-lg w-full p-6 text-gray-200 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/60 shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Create New Section</h3>
                  <p className="text-xs text-gray-400">
                    Category: <strong className="text-emerald-400">{activeCategory?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form: Section Metadata */}
            <div className="space-y-4 text-xs">
              {/* Preset Display Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Preset Display Name <span className="text-red-400">*</span>
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
                  className="w-full px-3 py-2 bg-[#0e1624] border border-[#253752] rounded-lg text-white font-medium focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Document Printed Header Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Document Printed Header Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. MANDATORY MATERIAL INSPECTION MATRIX"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e1624] border border-[#253752] rounded-lg text-white font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Section Content Type Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-2">
                  Section Content Type <span className="text-red-400">*</span>
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
                        className={`p-2.5 rounded-xl border text-left flex items-start space-x-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-xs'
                            : 'bg-[#0e1624] border-[#253752] text-gray-400 hover:bg-[#152236] hover:text-gray-200'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isSelected ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate text-white">{opt.label}</div>
                          <div className="text-[10px] text-gray-400 truncate">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 border-t border-gray-800 pt-3">
              <button
                type="button"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateSection}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
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
