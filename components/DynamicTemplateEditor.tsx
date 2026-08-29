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
        <label className="block text-xs font-bold text-black mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-medium focus:border-[#0d3479] focus:outline-none min-h-[80px] shadow-xs"
          />
        ) : field.type === 'date' ? (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:border-[#0d3479] focus:outline-none shadow-xs"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:border-[#0d3479] focus:outline-none shadow-xs"
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
        className={`bg-white rounded-xl border overflow-hidden shadow-xs transition-colors ${
          isActive ? 'border-[#0d3479] ring-2 ring-[#0d3479]/20' : 'border-[#cccccc]'
        } cursor-default`}
      >
        <div 
          onClick={(e) => {
            e.stopPropagation();
            toggleSection(section.id);
          }}
          className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex justify-between items-center cursor-pointer select-none"
        >
          <h3 className="font-bold text-xs text-[#0d3479] uppercase tracking-wider flex items-center space-x-1.5">
            <span>{section.title}</span>
          </h3>
          {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#0d3479]" /> : <ChevronUp className="w-4 h-4 text-[#0d3479]" />}
        </div>

        {!isCollapsed && (
          <div className="p-4 space-y-4 bg-white">
            {section.description && (
              <p className="text-xs text-[#666666]">{section.description}</p>
            )}

            {section.fields && (
              <div className="grid grid-cols-1 gap-3">
                {section.fields.map(renderField)}
              </div>
            )}
            
            {section.type === 'table' && (
              <div className="text-xs text-[#0d3479] font-semibold p-3 bg-[#dfe7f4] border border-[#b9c7de] rounded-lg">
                Dynamic table editor coming soon in Phase 2.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-[#f4f3eb] overflow-y-auto w-full custom-scrollbar text-black">
      <div className="p-4 md:p-6 space-y-6">
        
        {/* Schema Header Info */}
        <div className="bg-white rounded-xl border border-[#cccccc] p-4 shadow-xs">
          <h2 className="text-base font-bold text-black">{schema.name}</h2>
          <p className="text-xs text-[#666666] mt-1">{schema.description}</p>
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-4">
          {schema.sections.map(renderSection)}
        </div>
        
      </div>
    </div>
  );
};
