export type FieldType = 'string' | 'textarea' | 'number' | 'date' | 'boolean';

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
}

export interface TemplateTableColumn {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  width?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  type: 'form' | 'table' | 'list' | 'key_value' | 'paragraphs';
  
  // For 'form' or 'key_value' types
  fields?: TemplateField[];
  
  // For 'table' types
  columns?: TemplateTableColumn[];
  
  // Visual layout in preview
  layout?: {
    showBorder?: boolean;
    pageBreakBefore?: boolean;
    headerStyle?: 'h1' | 'h2' | 'h3' | 'hidden';
  };
}

export interface DynamicTemplateSchema {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  
  // Default values or global template config
  defaults?: Record<string, any>;
}

export interface DynamicDocumentData {
  templateId: string;
  // A flat or nested key-value store containing user data mapping to the schema
  data: Record<string, any>;
}
