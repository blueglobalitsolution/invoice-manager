'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  DollarSign,
  Receipt,
  FileText,
  Plus,
  Trash2,
  Calculator,
  Landmark,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LatexDocument, TaxInvoiceData, TaxInvoiceItem } from '@/types/document';
import { numberToIndianWords } from '@/lib/number-to-words';
import {
  validateGstNumber,
  formatGstInput,
  formatPanInput,
  formatHsnInput,
  formatDateInput,
  sanitizePhoneInput,
  sanitizeNumericInput,
} from '@/lib/validation';
import { toast } from '@/components/ui/Toast';

interface TaxInvoiceFormEditorProps {
  document: LatexDocument;
  activeSectionId: string;
  onSelectSection?: (sectionId: string) => void;
  onChange: (updatedDoc: LatexDocument) => void;
  onOpenGlobalVariables?: () => void;
}

export const TaxInvoiceFormEditor: React.FC<TaxInvoiceFormEditorProps> = ({
  document: doc,
  activeSectionId,
  onSelectSection,
  onChange,
  onOpenGlobalVariables,
}) => {
  const inv = doc.taxInvoice!;

  const [activeTab, setActiveTab] = useState<'client' | 'items' | 'bank'>(() => {
    if (activeSectionId === 'items' || activeSectionId === 'rate_items' || activeSectionId === 'invoice_items') return 'items';
    if (activeSectionId === 'statutory' || activeSectionId === 'terms' || activeSectionId === 'bank' || activeSectionId === 'signatures') return 'bank';
    return 'client';
  });

  // Keep active tab in sync whenever user clicks on a section in the live preview
  useEffect(() => {
    if (!activeSectionId) return;
    if (activeSectionId === 'items' || activeSectionId === 'rate_items' || activeSectionId === 'invoice_items') {
      setActiveTab('items');
    } else if (activeSectionId === 'statutory' || activeSectionId === 'terms' || activeSectionId === 'bank' || activeSectionId === 'signatures') {
      setActiveTab('bank');
    } else if (activeSectionId === 'client_info' || activeSectionId === 'client' || activeSectionId === 'info' || activeSectionId === 'invoice_meta') {
      setActiveTab('client');
    }
  }, [activeSectionId]);

  const updateInv = (fields: Partial<TaxInvoiceData>) => {
    onChange({
      ...doc,
      taxInvoice: {
        ...inv,
        ...fields,
      },
    });
  };

  // Helper to recalculate taxes automatically
  const handleRecalculateTotals = (newItems?: TaxInvoiceItem[], newSgstRate?: string, newCgstRate?: string) => {
    const currentItems = newItems || inv.items;
    const sgstPct = parseFloat(newSgstRate || inv.sgstRate.replace('%', '')) || 9;
    const cgstPct = parseFloat(newCgstRate || inv.cgstRate.replace('%', '')) || 9;

    let subtotal = 0;
    currentItems.forEach((item) => {
      const q = parseFloat(item.qty) || 0;
      const r = parseFloat(item.rate) || 0;
      const t = (q !== 0 && r !== 0) ? (q * r) : (parseFloat(item.total) || 0);
      subtotal += isNaN(t) ? 0 : t;
    });

    const sgstAmt = (subtotal * sgstPct) / 100;
    const cgstAmt = (subtotal * cgstPct) / 100;
    const netAmt = subtotal + sgstAmt + cgstAmt;
    const roundedAmt = Math.round(netAmt);
    const amountWords = numberToIndianWords(roundedAmt, 'Rupee: ');

    updateInv({
      items: currentItems,
      totalAmount: subtotal.toFixed(2),
      sgstRate: `${sgstPct}%`,
      sgstAmount: sgstAmt.toFixed(2),
      cgstRate: `${cgstPct}%`,
      cgstAmount: cgstAmt.toFixed(2),
      netAmount: netAmt.toFixed(2),
      finalAmount: roundedAmt.toFixed(2),
      amountInWords: amountWords,
    });
  };

  const handleUpdateItem = (index: number, field: keyof TaxInvoiceItem, val: string) => {
    let sanitizedVal = val;
    if (field === 'qty' || field === 'rate' || field === 'total') {
      sanitizedVal = sanitizeNumericInput(val, true);
    } else if (field === 'hsn') {
      sanitizedVal = formatHsnInput(val);
    }

    const updated = [...inv.items];
    updated[index] = { ...updated[index], [field]: sanitizedVal };

    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(updated[index].qty) || 0;
      const r = parseFloat(updated[index].rate) || 0;
      updated[index].total = (q * r).toFixed(2);
    }

    handleRecalculateTotals(updated);
  };

  const handleAddItem = () => {
    const newItem: TaxInvoiceItem = {
      id: `item_${Date.now()}`,
      srNo: `${inv.items.length + 1}.`,
      description: 'Supply, Fabrication and Erection Work',
      hsn: '73089010',
      qty: '1.0',
      rate: '50000.00',
      total: '50000.00',
    };
    handleRecalculateTotals([...inv.items, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    if (inv.items.length <= 1) {
      toast.warning('Invoice must have at least 1 item.');
      return;
    }
    const updated = inv.items.filter((_, i) => i !== index);
    handleRecalculateTotals(updated);
  };

  return (
    <aside className="w-full bg-[#f4f3eb] text-black flex flex-col h-full shrink-0 select-none overflow-hidden text-xs">
      {/* Header Tabs */}
      <div className="h-[49px] px-4 border-b border-[#cccccc] bg-[#f0efe6] flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#dfe7f4] border border-[#b9c7de] text-[#0d3479] flex items-center justify-center shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-black block">
              Tax Invoice Editor
            </span>
            <span className="text-[10px] text-[#666666] block">
              GST Calculations & Itemized Invoicing
            </span>
          </div>
        </div>
        {onOpenGlobalVariables && (
          <button
            onClick={onOpenGlobalVariables}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#cccccc] text-[#0d3479] rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0d3479]" />
            <span>Variables</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 bg-white border-b border-[#cccccc] text-xs shrink-0 font-bold">
        <button
          onClick={() => {
            setActiveTab('client');
            onSelectSection?.('client_info');
          }}
          className={`py-2.5 px-2 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'client'
              ? 'border-[#0d3479] text-[#0d3479] bg-[#f4f3eb]'
              : 'border-transparent text-[#666666] hover:text-black hover:bg-slate-50'
          }`}
        >
          1. Client & Meta
        </button>
        <button
          onClick={() => {
            setActiveTab('items');
            onSelectSection?.('items');
          }}
          className={`py-2.5 px-2 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'items'
              ? 'border-[#0d3479] text-[#0d3479] bg-[#f4f3eb]'
              : 'border-transparent text-[#666666] hover:text-black hover:bg-slate-50'
          }`}
        >
          2. Items & Tax
        </button>
        <button
          onClick={() => {
            setActiveTab('bank');
            onSelectSection?.('statutory');
          }}
          className={`py-2.5 px-2 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'bank'
              ? 'border-[#0d3479] text-[#0d3479] bg-[#f4f3eb]'
              : 'border-transparent text-[#666666] hover:text-black hover:bg-slate-50'
          }`}
        >
          3. Bank & Terms
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 bg-[#f4f3eb]">
        {/* ================= TAB 1: CLIENT & INVOICE META ================= */}
        {activeTab === 'client' && (
          <div className="space-y-5">
            {/* Client Particulars Card */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <Building className="w-4 h-4 text-[#0d3479]" />
                <h3 className="font-bold text-[#0d3479] text-xs tracking-wider uppercase">
                  Client / Customer Particulars
                </h3>
              </div>

              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">M/s. Client Name</label>
                  <input
                    type="text"
                    value={inv.clientName}
                    onChange={(e) => updateInv({ clientName: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-bold placeholder-[#888888] focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="M/s. ALEMBIC LTD,"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Address Line 1</label>
                  <input
                    type="text"
                    value={inv.clientAddressLine1}
                    onChange={(e) => updateInv({ clientAddressLine1: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium placeholder-[#888888] focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="Alembic Road, Gorwa,"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">City, State (Line 2)</label>
                  <input
                    type="text"
                    value={inv.clientAddressLine2}
                    onChange={(e) => updateInv({ clientAddressLine2: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium placeholder-[#888888] focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="Vadodara, Gujarat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Client GST NO.</label>
                  <input
                    type="text"
                    value={inv.clientGstNo}
                    onChange={(e) => updateInv({ clientGstNo: formatGstInput(e.target.value) })}
                    maxLength={15}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-bold placeholder-[#888888] focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="24AABCA7950P1ZB"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Numbers & References Card */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0d3479]" />
                <h3 className="font-bold text-[#0d3479] text-xs tracking-wider uppercase">
                  Invoice Numbers & References
                </h3>
              </div>

              <div className="p-4 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">Invoice No.</label>
                    <input
                      type="text"
                      value={inv.invoiceNo}
                      onChange={(e) => updateInv({ invoiceNo: e.target.value })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">Invoice Date</label>
                    <input
                      type="text"
                      value={inv.invoiceDate}
                      onChange={(e) => updateInv({ invoiceDate: formatDateInput(e.target.value) })}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">P.O. No.</label>
                    <input
                      type="text"
                      value={inv.poNo}
                      onChange={(e) => updateInv({ poNo: e.target.value })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">P.O. Date</label>
                    <input
                      type="text"
                      value={inv.poDate}
                      onChange={(e) => updateInv({ poDate: formatDateInput(e.target.value) })}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={inv.projectName}
                    onChange={(e) => updateInv({ projectName: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="Tadpole Academy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ITEMS & TAXES ================= */}
        {activeTab === 'items' && (
          <div className="space-y-5">
            {/* Goods & Work Items Table View (Exact placement matching preview) */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-[#0d3479]" />
                  <span className="font-bold text-[#0d3479] text-xs uppercase tracking-wider">
                    Goods & Work Items ({inv.items.length} {inv.items.length === 1 ? 'Item' : 'Items'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Item</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f7f7f2] border-b border-[#cccccc] text-black font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-2.5 w-12 text-center">Sr.</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Description of Goods</th>
                      <th className="py-2.5 px-2 w-24 text-center">HSN</th>
                      <th className="py-2.5 px-2 w-20 text-center">Qty.</th>
                      <th className="py-2.5 px-2 w-24 text-center">Rate (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cccccc] bg-white">
                    {inv.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors align-top">
                        <td className="py-2.5 px-2 text-center font-bold text-black text-xs pt-3">
                          {idx + 1}.
                        </td>
                        <td className="py-2 px-2">
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            placeholder="Description of goods / scope..."
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-2.5 py-1.5 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs resize-none"
                          />
                        </td>
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => handleUpdateItem(idx, 'hsn', e.target.value)}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-xs text-black text-center font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                            placeholder="73089010"
                          />
                        </td>
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-xs text-black text-center font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                            placeholder="1.0"
                          />
                        </td>
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-xs text-black text-center font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.total}
                            onChange={(e) => handleUpdateItem(idx, 'total', e.target.value)}
                            className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-xs text-[#0d3479] text-right font-mono font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-2 px-2 text-center pt-3">
                          {inv.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(idx)}
                              className="text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations & GST Card */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-[#0d3479]" />
                <h3 className="font-bold text-[#0d3479] text-xs tracking-wider uppercase">
                  GST & Net Calculations
                </h3>
              </div>

              <div className="p-4 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">Total Amount (Subtotal)</label>
                    <input
                      type="text"
                      value={inv.totalAmount}
                      onChange={(e) => updateInv({ totalAmount: e.target.value })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono text-right font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">Net Amount (With Tax)</label>
                    <input
                      type="text"
                      value={inv.netAmount}
                      onChange={(e) => updateInv({ netAmount: e.target.value })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-[#0d3479] font-mono text-right font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">SGST Rate</label>
                    <input
                      type="text"
                      value={inv.sgstRate}
                      onChange={(e) => handleRecalculateTotals(undefined, sanitizeNumericInput(e.target.value, true), undefined)}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                      placeholder="9%"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">SGST Amount</label>
                    <input
                      type="text"
                      value={inv.sgstAmount}
                      onChange={(e) => updateInv({ sgstAmount: sanitizeNumericInput(e.target.value, true) })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono text-right font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">CGST Rate</label>
                    <input
                      type="text"
                      value={inv.cgstRate}
                      onChange={(e) => handleRecalculateTotals(undefined, undefined, sanitizeNumericInput(e.target.value, true))}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                      placeholder="9%"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">CGST Amount</label>
                    <input
                      type="text"
                      value={inv.cgstAmount}
                      onChange={(e) => updateInv({ cgstAmount: e.target.value })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono text-right font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Final Amount (Payable)</label>
                  <input
                    type="text"
                    value={inv.finalAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      const words = numberToIndianWords(val, 'Rupee: ');
                      updateInv({ finalAmount: val, amountInWords: words });
                    }}
                    className="w-full bg-white border border-[#0d3479] rounded-lg px-3 py-2 text-base text-[#0d3479] font-mono font-bold text-right shadow-xs focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-black">Amount In Words</label>
                    <button
                      type="button"
                      onClick={() => {
                        const words = numberToIndianWords(inv.finalAmount || inv.netAmount || '0', 'Rupee: ');
                        updateInv({ amountInWords: words });
                      }}
                      className="text-xs text-[#0d3479] hover:text-[#002057] flex items-center space-x-1 cursor-pointer font-bold"
                      title="Auto generate words from Final Amount"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Convert</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={inv.amountInWords}
                    onChange={(e) => updateInv({ amountInWords: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BANK & TERMS ================= */}
        {activeTab === 'bank' && (
          <div className="space-y-5">
            {/* Bank Details Card */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-[#0d3479]" />
                <h3 className="font-bold text-[#0d3479] text-xs tracking-wider uppercase">
                  Company Bank Details
                </h3>
              </div>

              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={inv.bankDetails?.bankName || ''}
                    onChange={(e) =>
                      updateInv({
                        bankDetails: {
                          ...(inv.bankDetails || { bankName: '', ifsc: '', accountNo: '', branch: '' }),
                          bankName: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="BANK OF BARODA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">IFSC Code</label>
                    <input
                      type="text"
                      value={inv.bankDetails?.ifsc || ''}
                      onChange={(e) =>
                        updateInv({
                          bankDetails: {
                            ...(inv.bankDetails || { bankName: '', ifsc: '', accountNo: '', branch: '' }),
                            ifsc: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                      placeholder="BARB0INDMAK"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">Account No.</label>
                    <input
                      type="text"
                      value={inv.bankDetails?.accountNo || ''}
                      onChange={(e) =>
                        updateInv({
                          bankDetails: {
                            ...(inv.bankDetails || { bankName: '', ifsc: '', accountNo: '', branch: '' }),
                            accountNo: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-[#0d3479] font-mono font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                      placeholder="05730400000392"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Branch</label>
                  <input
                    type="text"
                    value={inv.bankDetails?.branch || ''}
                    onChange={(e) =>
                      updateInv({
                        bankDetails: {
                          ...(inv.bankDetails || { bankName: '', ifsc: '', accountNo: '', branch: '' }),
                          branch: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="MAKARPURA GIDC."
                  />
                </div>
              </div>
            </div>

            {/* Statutory Numbers Card */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0d3479]" />
                <h3 className="font-bold text-[#0d3479] text-xs tracking-wider uppercase">
                  Statutory Numbers & Signatory
                </h3>
              </div>

              <div className="p-4 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">PAN NO.</label>
                    <input
                      type="text"
                      value={inv.companyPanNo || ''}
                      onChange={(e) => updateInv({ companyPanNo: formatPanInput(e.target.value) })}
                      maxLength={10}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">EPF NO.</label>
                    <input
                      type="text"
                      value={inv.companyEpfNo || ''}
                      onChange={(e) => updateInv({ companyEpfNo: e.target.value })}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Signatory Title</label>
                  <input
                    type="text"
                    value={inv.signatoryCompany || ''}
                    onChange={(e) => updateInv({ signatoryCompany: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    placeholder="For, GLOBAL INDUSTRIES"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
