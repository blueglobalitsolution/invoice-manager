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
      const t = parseFloat(item.total) || q * r;
      subtotal += isNaN(t) ? 0 : t;
    });

    const sgstAmt = (subtotal * sgstPct) / 100;
    const cgstAmt = (subtotal * cgstPct) / 100;
    const netAmt = subtotal + sgstAmt + cgstAmt;
    const roundedAmt = Math.round(netAmt);

    updateInv({
      items: currentItems,
      totalAmount: subtotal.toFixed(2),
      sgstRate: `${sgstPct}%`,
      sgstAmount: sgstAmt.toFixed(2),
      cgstRate: `${cgstPct}%`,
      cgstAmount: cgstAmt.toFixed(2),
      netAmount: netAmt.toFixed(2),
      finalAmount: roundedAmt.toFixed(2),
    });
  };

  const handleUpdateItem = (index: number, field: keyof TaxInvoiceItem, val: string) => {
    const updated = [...inv.items];
    updated[index] = { ...updated[index], [field]: val };

    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(field === 'qty' ? val : updated[index].qty) || 0;
      const r = parseFloat(field === 'rate' ? val : updated[index].rate) || 0;
      if (q && r) {
        updated[index].total = (q * r).toFixed(2);
      }
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
      alert('Invoice must have at least 1 item.');
      return;
    }
    const updated = inv.items.filter((_, i) => i !== index);
    handleRecalculateTotals(updated);
  };

  return (
    <aside className="w-full bg-[#080d1a] text-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden text-xs">
      {/* Header Tabs */}
      <div className="px-3 py-2 border-b border-[#141f33] bg-[#0a1120] flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-1">
          <Receipt className="w-4 h-4 text-blue-300" />
          <span className="font-bold text-xs uppercase tracking-wider text-gray-200">
            Tax Invoice Editor
          </span>
        </div>
        {onOpenGlobalVariables && (
          <button
            onClick={onOpenGlobalVariables}
            className="px-2 py-0.5 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 border border-[#0d3479] text-blue-200 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-blue-300" />
            <span>Variables</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 bg-[#080d1a] border-b border-[#141f33] text-[11px] shrink-0 font-medium">
        <button
          onClick={() => {
            setActiveTab('client');
            onSelectSection?.('client_info');
          }}
          className={`py-2 px-1 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'client'
              ? 'border-[#2563eb] text-blue-300 font-bold bg-[#0b1426]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          1. Client & Meta
        </button>
        <button
          onClick={() => {
            setActiveTab('items');
            onSelectSection?.('items');
          }}
          className={`py-2 px-1 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'items'
              ? 'border-[#2563eb] text-blue-300 font-bold bg-[#0b1426]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          2. Items & Tax
        </button>
        <button
          onClick={() => {
            setActiveTab('bank');
            onSelectSection?.('statutory');
          }}
          className={`py-2 px-1 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'bank'
              ? 'border-[#2563eb] text-blue-300 font-bold bg-[#0b1426]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          3. Bank & Terms
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: CLIENT & INVOICE META ================= */}
        {activeTab === 'client' && (
          <div className="space-y-4">
            <div className="bg-[#152238] border border-[#141f33] rounded p-3 space-y-3">
              <h3 className="font-bold text-blue-300 text-xs flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Client / Customer Particulars</span>
              </h3>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">M/s. Client Name</label>
                <input
                  type="text"
                  value={inv.clientName}
                  onChange={(e) => updateInv({ clientName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-100 font-semibold focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  placeholder="M/s. ALEMBIC LTD,"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={inv.clientAddressLine1}
                  onChange={(e) => updateInv({ clientAddressLine1: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  placeholder="Alembic Road, Gorwa,"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">City, State (Line 2)</label>
                <input
                  type="text"
                  value={inv.clientAddressLine2}
                  onChange={(e) => updateInv({ clientAddressLine2: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  placeholder="Vadodara. Gujarat"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Client GST NO.</label>
                <input
                  type="text"
                  value={inv.clientGstNo}
                  onChange={(e) => updateInv({ clientGstNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-blue-200 font-mono focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  placeholder="24AABCA7950P1ZB"
                />
              </div>
            </div>

            <div className="bg-[#152238] border border-[#141f33] rounded p-3 space-y-3">
              <h3 className="font-bold text-sky-400 text-xs flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice Numbers & References</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Invoice No.</label>
                  <input
                    type="text"
                    value={inv.invoiceNo}
                    onChange={(e) => updateInv({ invoiceNo: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono font-bold focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Invoice Date</label>
                  <input
                    type="text"
                    value={inv.invoiceDate}
                    onChange={(e) => updateInv({ invoiceDate: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">P.O. No.</label>
                  <input
                    type="text"
                    value={inv.poNo}
                    onChange={(e) => updateInv({ poNo: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">P.O. Date</label>
                  <input
                    type="text"
                    value={inv.poDate}
                    onChange={(e) => updateInv({ poDate: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">PROJECT NAME</label>
                <input
                  type="text"
                  value={inv.projectName}
                  onChange={(e) => updateInv({ projectName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-amber-300 font-semibold focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  placeholder="Tadpole Academy"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ITEMS & TAXES ================= */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-300">Goods & Work Items</span>
              <button
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {inv.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-[#152238] border border-[#141f33] rounded p-3 space-y-2.5 relative group"
              >
                <div className="flex justify-between items-center border-b border-[#141f33]/80 pb-1.5">
                  <span className="font-bold text-blue-300 text-xs">Item #{idx + 1}</span>
                  {inv.items.length > 1 && (
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      className="text-red-400 hover:text-red-300 text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Description of Goods / Scope</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 text-xs focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">HSN Code</label>
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => handleUpdateItem(idx, 'hsn', e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Qty</label>
                    <input
                      type="text"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Rate (₹)</label>
                    <input
                      type="text"
                      value={item.rate}
                      onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Total (₹)</label>
                    <input
                      type="text"
                      value={item.total}
                      onChange={(e) => handleUpdateItem(idx, 'total', e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#0e1624] border border-[#16233a] rounded text-blue-200 text-right font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Calculations & GST */}
            <div className="bg-[#152238] border border-[#141f33] rounded p-3 space-y-3">
              <div className="flex justify-between items-center border-b border-[#141f33] pb-2">
                <span className="font-bold text-xs text-amber-300 flex items-center space-x-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>GST & Net Calculations</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Total Amount (Subtotal)</label>
                  <input
                    type="text"
                    value={inv.totalAmount}
                    onChange={(e) => updateInv({ totalAmount: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Net Amount (With Tax)</label>
                  <input
                    type="text"
                    value={inv.netAmount}
                    onChange={(e) => updateInv({ netAmount: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono text-right font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">SGST Rate</label>
                  <input
                    type="text"
                    value={inv.sgstRate}
                    onChange={(e) => handleRecalculateTotals(undefined, e.target.value, undefined)}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono"
                    placeholder="9%"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">SGST Amount</label>
                  <input
                    type="text"
                    value={inv.sgstAmount}
                    onChange={(e) => updateInv({ sgstAmount: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">CGST Rate</label>
                  <input
                    type="text"
                    value={inv.cgstRate}
                    onChange={(e) => handleRecalculateTotals(undefined, undefined, e.target.value)}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono"
                    placeholder="9%"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">CGST Amount</label>
                  <input
                    type="text"
                    value={inv.cgstAmount}
                    onChange={(e) => updateInv({ cgstAmount: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Final Amount (Payable)</label>
                <input
                  type="text"
                  value={inv.finalAmount}
                  onChange={(e) => updateInv({ finalAmount: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-emerald-600 rounded text-blue-300 font-mono font-bold text-sm text-right"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Amount In Words</label>
                <textarea
                  rows={2}
                  value={inv.amountInWords}
                  onChange={(e) => updateInv({ amountInWords: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-medium text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BANK & TERMS ================= */}
        {activeTab === 'bank' && (
          <div className="space-y-4">
            <div className="bg-[#152238] border border-[#141f33] rounded p-3 space-y-3">
              <h3 className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                <Landmark className="w-3.5 h-3.5" />
                <span>Company Bank Details</span>
              </h3>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Bank Name</label>
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
                  className="w-full px-2 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-semibold"
                  placeholder="BANK OF BARODA"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">IFSC Code</label>
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
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono"
                    placeholder="BARB0INDMAK"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Account No.</label>
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
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-blue-200 font-mono font-bold"
                    placeholder="05730400000392"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Branch</label>
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
                  className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200"
                  placeholder="MAKARPURA GIDC."
                />
              </div>
            </div>

            <div className="bg-[#152238] border border-[#141f33] rounded p-3 space-y-3">
              <h3 className="font-bold text-gray-300 text-xs">Statutory Numbers & Signatory</h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">PAN NO.</label>
                  <input
                    type="text"
                    value={inv.companyPanNo || ''}
                    onChange={(e) => updateInv({ companyPanNo: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">EPF NO.</label>
                  <input
                    type="text"
                    value={inv.companyEpfNo || ''}
                    onChange={(e) => updateInv({ companyEpfNo: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={inv.signatoryCompany || ''}
                  onChange={(e) => updateInv({ signatoryCompany: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0e1624] border border-[#16233a] rounded text-gray-200 font-semibold"
                  placeholder="For, GLOBAL INDUSTRIES"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
