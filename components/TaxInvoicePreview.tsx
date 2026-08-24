'use client';

import React from 'react';
import { LatexDocument, TaxInvoiceData } from '@/types/document';
import { CompanyProfile } from '@/types/project';
import { applyVariables } from '@/lib/variables';

interface TaxInvoicePreviewProps {
  doc: LatexDocument;
  invoice: TaxInvoiceData;
  fontFamilyStyle: string;
  printRef: React.RefObject<HTMLDivElement | null>;
  activeSectionId?: string;
  hoveredSectionId?: string | null;
  onHoverSection?: (sectionId: string | null) => void;
  onSelectSection?: (sectionId: string) => void;
  globalVars?: Record<string, string>;
  companyProfile?: CompanyProfile;
}

export const TaxInvoicePreview: React.FC<TaxInvoicePreviewProps> = ({
  doc,
  invoice: inv,
  fontFamilyStyle,
  printRef,
  activeSectionId,
  hoveredSectionId,
  onHoverSection,
  onSelectSection,
  globalVars,
  companyProfile,
}) => {
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  
  const companyName = applyVariables(pProfile.companyName || inv.companyName || 'GLOBAL', globalVars);
  const companySubtitle = applyVariables(pProfile.companySubtitle || inv.companySubtitle || 'INDUSTRIES', globalVars);
  const leftServices = pProfile.leftServices || inv.leftServices || [];
  const rightServices = pProfile.rightServices || inv.rightServices || [];

  const companyAddressHeader = pProfile.companyAddressHeader || inv.companyAddressHeader || '';
  const companyGstNo = pProfile.companyGstNo || inv.companyGstNo || '24CLNPS9550H1ZI';
  const companyPhone = pProfile.companyPhone || inv.companyPhone || '+91 97254 45370';
  const companyAddressFooter = pProfile.companyAddressFooter || inv.companyAddressFooter || 'Block No. 1068/99...';
  const companyEmail = pProfile.companyEmail || inv.companyEmail || 'info@globalindustries.co';
  const companyWebsite = pProfile.companyWebsite || inv.companyWebsite || 'www.globalindustries.co';

  const clientName = applyVariables(inv.clientName, globalVars);
  const clientAddr1 = applyVariables(inv.clientAddressLine1, globalVars);
  const clientAddr2 = applyVariables(inv.clientAddressLine2, globalVars);
  const clientGst = applyVariables(inv.clientGstNo, globalVars);
  const invoiceNo = applyVariables(inv.invoiceNo, globalVars);
  const invoiceDate = applyVariables(inv.invoiceDate, globalVars);
  const poNo = applyVariables(inv.poNo, globalVars);
  const poDate = applyVariables(inv.poDate, globalVars);
  const projectName = applyVariables(inv.projectName, globalVars);

  const isClientActive = activeSectionId === 'client_info' || activeSectionId === 'info';
  const isClientHovered = hoveredSectionId === 'client_info' && !isClientActive;

  const isItemsActive = activeSectionId === 'items' || activeSectionId === 'rate_items';
  const isItemsHovered = hoveredSectionId === 'items' && !isItemsActive;

  const isStatutoryActive = activeSectionId === 'statutory' || activeSectionId === 'terms';
  const isStatutoryHovered = hoveredSectionId === 'statutory' && !isStatutoryActive;

  const isHeaderActive = activeSectionId === 'header_footer';
  const isHeaderHovered = hoveredSectionId === 'header_footer' && !isHeaderActive;

  return (
    <div
      ref={printRef}
      style={{
        fontFamily: fontFamilyStyle || 'Helvetica, Arial, sans-serif',
        width: '794px',
        minHeight: '1123px',
      }}
      className="latex-paper print-area bg-white text-black shadow-2xl relative flex flex-col justify-between p-[0.6in] pt-[0.4in] pb-[0.4in] box-border text-[13px] leading-[1.15]"
    >
      <div className="flex-1 flex flex-col">
        {/* ================= HEADER ================= */}
        <div
          id="preview-sec-header"
          onClick={() => onSelectSection?.('header_footer')}
          onMouseEnter={() => onHoverSection?.('header_footer')}
          onMouseLeave={() => onHoverSection?.(null)}
          className={`p-1.5 rounded transition-all cursor-pointer ${
            isHeaderActive
              ? 'ring-2 ring-emerald-600 bg-emerald-50/20'
              : isHeaderHovered
              ? 'ring-2 ring-emerald-400/80 bg-emerald-50/10'
              : 'hover:ring-1 hover:ring-emerald-300/40'
          }`}
          title="Click to edit Header & Footer"
        >
          <div className="flex items-center justify-between">
            {/* Left Brand */}
            <div className="w-[35%] pr-2">
              <div className="text-[26px] font-black tracking-tight leading-none text-black">
                {companyName}
              </div>
              <div className="text-[17px] font-extrabold tracking-wider leading-tight text-black mt-0.5">
                {companySubtitle}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-[0.8pt] bg-black self-stretch mx-2" />

            {/* Right Services List */}
            <div className="w-[60%] pl-2 text-[10px] leading-[1.3] text-black">
              <div className="grid grid-cols-2 gap-x-3">
                <div>
                  {leftServices.map((svc, i) => (
                    <div key={i} className="truncate">
                      {svc}
                    </div>
                  ))}
                </div>
                <div>
                  {rightServices.map((svc, i) => (
                    <div key={i} className="truncate">
                      {svc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider and GST */}
          <div className="h-[0.8pt] bg-black w-full my-1.5" />
          <div className="flex justify-between items-center text-[10px] font-bold text-black tracking-wide">
            <div>{applyVariables(companyAddressHeader, globalVars)}</div>
            <div>GST NO. : {applyVariables(companyGstNo, globalVars)}</div>
          </div>
        </div>

        {/* ================= TITLE ================= */}
        <div className="text-center my-2 select-none">
          <span className="text-[15px] font-bold tracking-wide uppercase underline decoration-black decoration-1 underline-offset-2">
            TAX-INVOICE
          </span>
        </div>

        {/* ================= INVOICE TABLE ================= */}
        <div
          id="preview-sec-table"
          className="border-[0.8pt] border-black mt-1 text-[11px] leading-tight"
        >
          {/* Header Metadata Section (Client & Invoice Meta) */}
          <div
            onClick={() => onSelectSection?.('client_info')}
            onMouseEnter={() => onHoverSection?.('client_info')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`grid grid-cols-12 border-b-[0.8pt] border-black transition-all cursor-pointer ${
              isClientActive
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20'
                : isClientHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-50/10'
                : 'hover:bg-gray-50/50'
            }`}
            title="Click to edit Client and Invoice details"
          >
            {/* Client Info (Left) */}
            <div className="col-span-6 border-r-[0.8pt] border-black p-2 flex flex-col justify-between">
              <div>
                <div className="font-bold text-[12px]">{clientName}</div>
                <div className="font-bold">{clientAddr1}</div>
                <div className="font-bold">{clientAddr2}</div>
              </div>
              <div className="mt-4 font-bold">
                GST NO. {clientGst}
              </div>
            </div>

            {/* Invoice Meta (Right) */}
            <div className="col-span-6 grid grid-cols-2 divide-y-[0.8pt] divide-black text-[11px]">
              <div className="p-1.5 font-bold border-r-[0.8pt] border-black">Invoice No.</div>
              <div className="p-1.5 font-bold">{invoiceNo}</div>

              <div className="p-1.5 font-bold border-r-[0.8pt] border-black">Invoice Date:</div>
              <div className="p-1.5 font-bold">{invoiceDate}</div>

              <div className="p-1.5 font-bold border-r-[0.8pt] border-black">P.O. No.</div>
              <div className="p-1.5 font-bold">{poNo}</div>

              <div className="p-1.5 font-bold border-r-[0.8pt] border-black">P.O. Date:</div>
              <div className="p-1.5 font-bold">{poDate}</div>

              <div className="p-1.5 font-bold border-r-[0.8pt] border-black">PROJECT NAME</div>
              <div className="p-1.5 font-bold">{projectName}</div>
            </div>
          </div>

          {/* Table Column Headers */}
          <div className="grid grid-cols-12 bg-gray-50 border-b-[0.8pt] border-black font-bold text-center text-[11px]">
            <div className="col-span-1 border-r-[0.8pt] border-black py-1.5">Sr. No.</div>
            <div className="col-span-5 border-r-[0.8pt] border-black py-1.5">Description of Goods</div>
            <div className="col-span-2 border-r-[0.8pt] border-black py-1.5">HSN</div>
            <div className="col-span-1 border-r-[0.8pt] border-black py-1.5">Qty.</div>
            <div className="col-span-1 border-r-[0.8pt] border-black py-1.5">Rate</div>
            <div className="col-span-2 py-1.5">Total</div>
          </div>

          {/* Table Items */}
          <div
            onClick={() => onSelectSection?.('items')}
            onMouseEnter={() => onHoverSection?.('items')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`divide-y-[0.8pt] divide-black transition-all cursor-pointer ${
              isItemsActive
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20'
                : isItemsHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-50/10'
                : 'hover:bg-gray-50/40'
            }`}
            title="Click to edit Invoice Items and Taxes"
          >
            {inv.items.map((item, idx) => (
              <div key={item.id || idx} className="grid grid-cols-12 text-[11px] min-h-[44px]">
                <div className="col-span-1 border-r-[0.8pt] border-black p-2 text-center font-medium">
                  {item.srNo}
                </div>
                <div className="col-span-5 border-r-[0.8pt] border-black p-2 leading-relaxed">
                  {applyVariables(item.description, globalVars)}
                </div>
                <div className="col-span-2 border-r-[0.8pt] border-black p-2 text-center font-mono font-medium">
                  {item.hsn}
                </div>
                <div className="col-span-1 border-r-[0.8pt] border-black p-2 text-center font-mono">
                  {item.qty}
                </div>
                <div className="col-span-1 border-r-[0.8pt] border-black p-2 text-center font-mono">
                  {item.rate}
                </div>
                <div className="col-span-2 p-2 text-right font-mono font-medium">
                  {item.total}
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Tax Calculation Breakdown */}
          <div className="border-t-[0.8pt] border-black grid grid-cols-12 divide-x-[0.8pt] divide-black">
            <div className="col-span-8 p-2" />
            <div className="col-span-4 divide-y-[0.8pt] divide-black text-[11px]">
              <div className="grid grid-cols-2 p-1.5">
                <span className="font-bold">Total Amount</span>
                <span className="text-right font-mono font-medium">{inv.totalAmount}</span>
              </div>
              <div className="grid grid-cols-2 p-1.5">
                <span className="font-bold">SGST@{inv.sgstRate}</span>
                <span className="text-right font-mono">{inv.sgstAmount}</span>
              </div>
              <div className="grid grid-cols-2 p-1.5">
                <span className="font-bold">CGST@{inv.cgstRate}</span>
                <span className="text-right font-mono">{inv.cgstAmount}</span>
              </div>
              <div className="grid grid-cols-2 p-1.5">
                <span className="font-bold">Net Amount</span>
                <span className="text-right font-mono font-medium">{inv.netAmount}</span>
              </div>
            </div>
          </div>

          {/* Amount In Words & Final Amount */}
          <div className="border-t-[0.8pt] border-black grid grid-cols-12 divide-x-[0.8pt] divide-black bg-gray-50/70">
            <div className="col-span-8 p-2.5 flex items-center">
              <div className="font-bold text-[11px] leading-snug">
                {inv.amountInWords}
              </div>
            </div>
            <div className="col-span-4 p-2 grid grid-cols-2 items-center">
              <span className="font-extrabold text-[12px]">Final Amount</span>
              <span className="text-right font-mono font-black text-[13px]">{inv.finalAmount}</span>
            </div>
          </div>

          {/* Statutory, Bank Details & Signature Section */}
          <div
            onClick={() => onSelectSection?.('statutory')}
            onMouseEnter={() => onHoverSection?.('statutory')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`border-t-[0.8pt] border-black grid grid-cols-12 divide-x-[0.8pt] divide-black transition-all cursor-pointer ${
              isStatutoryActive
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20'
                : isStatutoryHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-50/10'
                : 'hover:bg-gray-50/30'
            }`}
            title="Click to edit Terms, Bank details and Signatory"
          >
            {/* Left Statutory & Bank Info */}
            <div className="col-span-8 p-3 text-[10.5px] leading-[1.35]">
              <div className="font-bold">GSTTIN: {inv.companyGstNo || '24CLNPS9550H1ZI'}</div>
              <div className="font-bold mt-0.5">PAN NO. {inv.companyPanNo || 'CLNPS9550H'}</div>
              <div className="font-bold mt-0.5 mb-1.5">EPF NO. {inv.companyEpfNo || 'VDBRD18741500'}</div>

              <div className="text-[9.5px] space-y-0.5 font-bold text-gray-800">
                {(inv.termsLines || [
                  '1. GOODS ONCE SOLD WILL NOT BE TAKEN BACK.',
                  '2. PAYMENT SHOULD BE MADE AS PER TERMS.',
                  '3. SUBECT TO BE VADODARA JURISDICATION ONLY.',
                ]).map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
                <div>
                  4. COMPANAY&apos;S BANK DETAIS- {inv.bankDetails?.bankName || 'BANK OF BARODA'} - IFSC {inv.bankDetails?.ifsc || 'BARB0INDMAK'}
                </div>
                <div className="pl-4">
                  BANK A/C NO- {inv.bankDetails?.accountNo || '05730400000392'}, BRANCH: {inv.bankDetails?.branch || 'MAKARPURA GIDC.'}
                </div>
              </div>
            </div>

            {/* Right Signatory Box */}
            <div className="col-span-4 p-3 flex flex-col justify-between text-right">
              <div className="font-bold text-[11px]">
                {inv.signatoryCompany || 'For, GLOBAL INDUSTRIES'}
              </div>
              <div className="text-center font-bold text-[10.5px] pt-12 pb-1 border-t border-dotted border-gray-300 mt-6">
                (Authorized Signatory)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div
        onClick={() => onSelectSection?.('header_footer')}
        onMouseEnter={() => onHoverSection?.('header_footer')}
        onMouseLeave={() => onHoverSection?.(null)}
        className={`mt-auto pt-4 border-t-[0.8pt] border-black text-[10px] leading-tight text-black p-1 rounded relative cursor-pointer transition-all duration-200 ${
          isHeaderActive
            ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
            : isHeaderHovered
            ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
            : 'hover:ring-1 hover:ring-emerald-300/40'
        }`}
        title="Header & Footer (Click to edit)"
      >
        {isHeaderHovered && !isHeaderActive && (
          <span className="absolute -top-6 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
            Header & Footer
          </span>
        )}
        <div className="font-medium">Phone: {applyVariables(companyPhone, globalVars)}</div>
        <div className="font-medium mt-0.5">
          {applyVariables(companyAddressFooter, globalVars)}
        </div>
        <div className="font-medium mt-0.5 flex space-x-6">
          <span>Email: {applyVariables(companyEmail, globalVars)}</span>
          <span>Website: {applyVariables(companyWebsite, globalVars)}</span>
        </div>
      </div>
    </div>
  );
};
