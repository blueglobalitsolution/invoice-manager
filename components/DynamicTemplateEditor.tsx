'use client';

import React, { useState } from 'react';
import { DynamicTemplateSchema, DynamicDocumentData, TemplateSection, TemplateField } from '@/types/template';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DynamicTemplateEditorProps {
  schema: DynamicTemplateSchema;
  documentData: DynamicDocumentData;
  onChange: (data: DynamicDocumentData) => void;
  activeSectionId?: string;
  onSelectSection?: (id: string) => void;
}

export const DynamicTemplateEditor: React.FC<DynamicTemplateEditorProps> = ({
  schema,
  documentData,
  onChange,
  activeSectionId,
  onSelectSection,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...documentData,
      data: {
        ...documentData.data,
        [fieldName]: value
      }
    });
  };

  const renderField = (field: TemplateField) => {
    const value = documentData.data[field.name] || '';

    return (
      <div key={field.id} className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-lg text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none min-h-[80px]"
          />
        ) : field.type === 'date' ? (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-lg text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-lg text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
          />
        )}
      </div>
    );
  };

  const renderSection = (section: TemplateSection) => {
    const isCollapsed = collapsedSections[section.id];
    const isActive = activeSectionId === section.id;

    return (
      <div 
        key={section.id} 
        id={`form-sec-${section.id}`}
        onClick={() => onSelectSection?.(section.id)}
        className={`bg-[#0b1426] p-3.5 rounded-2xl border transition-colors ${
          isActive ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-[#141f33]'
        } space-y-3 cursor-default`}
      >
        <div className="flex justify-between items-center">
          <h3 
            onClick={(e) => {
              e.stopPropagation();
              toggleSection(section.id);
            }}
            className="font-bold text-xs text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5 cursor-pointer hover:text-emerald-300 transition-colors select-none"
          >
            <span>{section.title}</span>
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />}
          </h3>
        </div>

        {!isCollapsed && (
          <div className="space-y-4 mt-2">
            {section.description && (
              <p className="text-[11px] text-gray-400">{section.description}</p>
            )}

            {section.fields && (
              <div className="grid grid-cols-1 gap-3">
                {section.fields.map(renderField)}
              </div>
            )}
            
            {section.type === 'table' && (
              <div className="text-xs text-amber-500/80 italic p-2 bg-amber-500/10 rounded">
                Dynamic table editor coming soon in Phase 2.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-[#030712] overflow-y-auto w-full custom-scrollbar">
      <div className="p-4 space-y-4">
        
        {/* Schema Header Info */}
        <div className="mb-6 pb-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">{schema.name}</h2>
          <p className="text-xs text-gray-400 mt-1">{schema.description}</p>
        </div>

        {/* Dynamic Sections */}
        {schema.sections.map(renderSection)}
        
      </div>
    </div>
  );
};
