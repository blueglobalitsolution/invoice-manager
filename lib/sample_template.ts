import { DynamicTemplateSchema } from '@/types/template';

export const SAMPLE_GENERIC_TEMPLATE: DynamicTemplateSchema = {
  id: 'generic_letter_01',
  name: 'Standard Business Letter',
  description: 'A generic template for business correspondence',
  sections: [
    {
      id: 'header_info',
      title: 'Sender & Recipient Info',
      type: 'form',
      fields: [
        { id: 'date', name: 'date', label: 'Date', type: 'date', required: true },
        { id: 'ref_no', name: 'refNo', label: 'Reference No.', type: 'string' },
        { id: 'to_name', name: 'toName', label: 'Recipient Name', type: 'string', required: true },
        { id: 'to_address', name: 'toAddress', label: 'Recipient Address', type: 'textarea' },
      ],
    },
    {
      id: 'subject_line',
      title: 'Subject',
      type: 'form',
      fields: [
        { id: 'subject', name: 'subject', label: 'Subject Line', type: 'string', required: true },
      ]
    },
    {
      id: 'body_paragraphs',
      title: 'Letter Body',
      type: 'paragraphs',
      fields: [
        // Using a single textarea that will split by newline in the UI
        { id: 'body_content', name: 'bodyContent', label: 'Body Content (paragraphs separated by newlines)', type: 'textarea', required: true }
      ]
    },
    {
      id: 'signatory',
      title: 'Signatory',
      type: 'form',
      fields: [
        { id: 'sign_name', name: 'signName', label: 'Signatory Name', type: 'string', required: true },
        { id: 'sign_title', name: 'signTitle', label: 'Signatory Title', type: 'string' },
      ]
    }
  ],
  defaults: {
    date: new Date().toISOString().split('T')[0],
  }
};
