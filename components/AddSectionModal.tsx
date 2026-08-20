'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  ChevronRight,
  Check,
  ListChecks,
  Scale,
  Table as TableIcon,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import {
  PREDEFINED_SECTION_TYPES,
  SectionTypeOption,
  createSectionFromPreset,
} from '@/lib/section-presets';
import { CustomSectionItem, SectionContentType } from '@/types/document';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPageNum: number;
  groupTitle?: string;
  onAddSectionItem: (section: CustomSectionItem) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  targetPageNum,
  groupTitle = `Page ${targetPageNum}`,
  onAddSectionItem,
}) => {
  const [selectedType, setSelectedType] = useState<SectionContentType>('bullet_list');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState<string>('');

  if (!isOpen) return null;

  const currentTypeOption =
    PREDEFINED_SECTION_TYPES.find((t) => t.type === selectedType) ||
    PREDEFINED_SECTION_TYPES[0];

  const currentPreset =
    currentTypeOption.presets[selectedPresetIdx] || currentTypeOption.presets[0];

  const handleSelectType = (type: SectionContentType) => {
    setSelectedType(type);
    setSelectedPresetIdx(0);
    const newTypeOption = PREDEFINED_SECTION_TYPES.find((t) => t.type === type);
    if (newTypeOption && newTypeOption.presets[0]) {
      setCustomTitle(newTypeOption.presets[0].title);
    }
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const preset = currentTypeOption.presets[idx];
    if (preset) {
      setCustomTitle(preset.title);
    }
  };

  const handleCreate = () => {
    const titleToUse = customTitle.trim() || currentPreset.title || currentTypeOption.defaultTitle;
    const newSection = createSectionFromPreset(
      selectedType,
      selectedPresetIdx,
      targetPageNum,
      titleToUse
    );
    onAddSectionItem(newSection);
    onClose();
  };

  const sampleData = currentPreset.factory();

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#141d2b] border border-gray-700/80 rounded-xl max-w-3xl w-full p-6 text-gray-200 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/60 shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <span>Add Pre-defined Section</span>
                <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-mono font-medium">
                  {groupTitle}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Choose a pre-defined section type with curated commercial & engineering templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Category Selection Tabs */}
        <div className="grid grid-cols-5 gap-2 border-b border-gray-800 pb-3">
          {PREDEFINED_SECTION_TYPES.map((typeOption) => {
            const Icon = typeOption.icon;
            const isSelected = selectedType === typeOption.type;
            return (
              <button
                key={typeOption.type}
                onClick={() => handleSelectType(typeOption.type)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-900/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                    : 'bg-[#1a2536] border-gray-800 text-gray-300 hover:bg-[#202e42] hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`p-1.5 rounded ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold truncate leading-tight mt-1">
                  {typeOption.shortLabel}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">
                  {typeOption.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. Main Body: Presets & Live Sample Preview */}
        <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden min-h-[300px]">
          {/* Left Column: Preset Templates */}
          <div className="col-span-5 flex flex-col space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Choose Preset Template</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {currentTypeOption.presets.length} available
              </span>
            </div>

            <div className="space-y-1.5 flex-1">
              {currentTypeOption.presets.map((preset, idx) => {
                const isSelected = selectedPresetIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-600 text-white shadow-xs'
                        : 'bg-[#182333] border-gray-800 text-gray-300 hover:bg-[#1f2d40] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="truncate">{preset.name}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-emerald-400' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Title Configuration & Live Preview */}
          <div className="col-span-7 bg-[#101722] border border-gray-800 rounded-lg p-3.5 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              {/* Custom Title Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Section Header / Title in Document
                </label>
                <input
                  type="text"
                  value={customTitle || currentPreset.title}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter Section Title..."
                  className="w-full bg-[#182435] border border-gray-700 rounded px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Sample Structure Preview */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Pre-filled Starter Content Preview</span>
                </div>

                <div className="bg-[#172232] border border-gray-800 rounded p-3 text-[11px] space-y-2 text-gray-300 font-sans">
                  {/* List preview */}
                  {selectedType === 'bullet_list' && sampleData.bullets && (
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px]">
                      {sampleData.bullets.map((b, i) => (
                        <li key={i} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Legal clause preview */}
                  {selectedType === 'legal_clause' && sampleData.paragraphs && (
                    <div className="space-y-2">
                      {sampleData.paragraphs.map((p, i) => (
                        <div key={i} className="flex items-start space-x-1.5">
                          <span className="font-bold text-emerald-400 font-mono text-[10px]">
                            {i + 1}.0
                          </span>
                          <p className="text-[11px] leading-relaxed text-gray-300">{p}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table preview */}
                  {selectedType === 'table' && sampleData.tableHeaders && sampleData.tableRows && (
                    <div className="border border-gray-700 rounded overflow-hidden text-[10px]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#1f2e42] text-gray-200 border-b border-gray-700">
                            {sampleData.tableHeaders.map((h, i) => (
                              <th key={i} className="p-1.5 text-left font-bold border-r border-gray-700 last:border-r-0">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleData.tableRows.slice(0, 3).map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-gray-800 last:border-b-0">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-1.5 border-r border-gray-800 last:border-r-0 truncate max-w-[120px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Key-Value preview */}
                  {selectedType === 'key_value' && sampleData.keyValuePairs && (
                    <div className="space-y-1 text-[11px]">
                      {sampleData.keyValuePairs.slice(0, 4).map((kv, i) => (
                        <div key={i} className="flex items-start justify-between py-0.5 border-b border-gray-800/80">
                          <span className="font-semibold text-gray-400 text-[10.5px] w-1/3">{kv.key}:</span>
                          <span className="text-gray-200 font-mono text-[10.5px] w-2/3">{kv.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Callout preview */}
                  {selectedType === 'callout' && (
                    <div className="p-2.5 bg-amber-950/30 border border-amber-600/50 rounded text-amber-200 text-[11px] leading-relaxed">
                      <div className="font-bold text-[11px] text-amber-300 uppercase tracking-wide mb-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{sampleData.calloutType?.toUpperCase() || 'IMPORTANT NOTICE'}</span>
                      </div>
                      <p>{sampleData.calloutText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-800 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center space-x-1.5 shadow transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section to Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
