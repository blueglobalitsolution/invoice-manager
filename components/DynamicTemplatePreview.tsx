'use client';

import React from 'react';
import { DynamicTemplateSchema, DynamicDocumentData, TemplateSection } from '@/types/template';
import { FormattedText } from '@/lib/format-text';

interface DynamicTemplatePreviewProps {
  schema: DynamicTemplateSchema;
  documentData: DynamicDocumentData;
  zoomLevel: number;
  activeSectionId?: string;
  hoveredSectionId?: string | null;
  onHoverSection?: (id: string | null) => void;
  onSelectSection?: (id: string) => void;
}

export const DynamicTemplatePreview: React.FC<DynamicTemplatePreviewProps> = ({
  schema,
  documentData,
  zoomLevel,
  activeSectionId,
  hoveredSectionId,
  onHoverSection,
  onSelectSection,
}) => {
  const getSectionHighlightClass = (sectionId: string) => {
    const isActive = activeSectionId === sectionId;
    const isHovered = hoveredSectionId === sectionId && !isActive;
    if (isActive) return 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs print:ring-0 print:bg-transparent print:shadow-none';
    if (isHovered) return 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs print:ring-0 print:bg-transparent print:shadow-none';
    return 'hover:ring-1 hover:ring-emerald-300/40 print:ring-0 print:bg-transparent print:shadow-none';
  };

  const renderSection = (section: TemplateSection) => {
    const data = documentData.data;

    return (
      <div
        key={section.id}
        id={`preview-sec-${section.id}`}
        onClick={() => onSelectSection?.(section.id)}
        onMouseEnter={() => onHoverSection?.(section.id)}
        onMouseLeave={() => onHoverSection?.(null)}
        className={`my-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(section.id)}`}
      >
        {/* Hover Badge */}
        {hoveredSectionId === section.id && !activeSectionId && (
          <span className="absolute top-1 right-1 text-[9px] bg-gray-800 text-white font-mono px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
            {section.title}
          </span>
        )}

        {/* Optional Section Header */}
        {section.layout?.headerStyle !== 'hidden' && (
          <h2 className={`text-[12.5px] font-bold text-[#404040] mb-1.5 tracking-wide ${section.layout?.headerStyle === 'h1' ? 'text-lg uppercase' : ''}`}>
            {section.title}
          </h2>
        )}

        {/* Section Content based on Type */}
        {section.type === 'form' && section.fields && (
          <div className="space-y-2">
            {section.fields.map((field) => (
              <div key={field.id} className="text-[11.5px] flex flex-col md:flex-row md:space-x-2">
                <span className="font-bold text-gray-700 w-1/4">{field.label}:</span>
                <span className="flex-1 whitespace-pre-wrap">
                  <FormattedText text={data[field.name]?.toString() || ''} />
                </span>
              </div>
            ))}
          </div>
        )}

        {section.type === 'paragraphs' && section.fields && (
          <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11.5px] whitespace-pre-line">
            {section.fields.map((field) => {
              const val = data[field.name];
              if (!val) return null;
              const paragraphs = typeof val === 'string' ? val.split('\n') : [val.toString()];
              return paragraphs.map((p: string, idx: number) => (
                <p key={`${field.id}-${idx}`} className="whitespace-pre-line">
                  <FormattedText text={p} />
                </p>
              ));
            })}
          </div>
        )}

        {section.type === 'key_value' && section.fields && (
          <div className="border border-black my-2 text-[11.5px]">
            <table className="w-full border-collapse">
              <tbody>
                {section.fields.map((field) => (
                  <tr key={field.id} className="border-b border-black last:border-b-0">
                    <td className="p-1.5 font-bold border-r border-black w-1/3 bg-gray-50/50 align-top">
                      {field.label}
                    </td>
                    <td className="p-1.5 align-top whitespace-pre-wrap">
                      <FormattedText text={data[field.name]?.toString() || ''} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section.type === 'table' && (
          <div className="border border-dashed border-gray-400 p-4 text-center text-xs text-gray-500 italic">
            Dynamic Table Renderer Placeholder (Phase 2)
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="latex-paper print-area bg-white mx-auto shadow-2xl relative"
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: '20mm', // standard A4 padding
      }}
    >
      <div className="max-w-full">
        {schema.sections.map(renderSection)}
      </div>
    </div>
  );
};
