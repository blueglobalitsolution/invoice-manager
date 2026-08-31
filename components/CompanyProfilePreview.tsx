'use client';

import React from 'react';
import { CompanyProfile } from '@/types/project';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { FormattedText } from '@/lib/format-text';
import { ShortcutsDropdown } from './ShortcutsDropdown';
import { WatermarkOverlay } from './WatermarkOverlay';

interface CompanyProfilePreviewProps {
  profile: CompanyProfile;
}

export const CompanyProfilePreview: React.FC<CompanyProfilePreviewProps> = ({ profile }) => {
  const [zoomLevel, setZoomLevel] = React.useState(100);

  const fontFamilyStyle = 'Arial, Helvetica, sans-serif';
  const fontSizeClass = 'text-[13px] leading-relaxed';
  const companyName = profile.companyName || 'GLOBAL';
  const companySubtitle = profile.companySubtitle || 'INDUSTRIES';

  const leftServices =
    profile.leftServices && profile.leftServices.length > 0
      ? profile.leftServices
      : [
          '• Pre Engineering Building',
          '• Roofing Solution',
          '• Engineering Project & Designing',
          '• "Z" & "C" Purlins',
        ];
  const rightServices =
    profile.rightServices && profile.rightServices.length > 0
      ? profile.rightServices
      : [
          '• Infra Materials',
          '• Puf Panels & Insulation Roofing',
          '• Skylight Sheets',
          '• Air Ventilators',
        ];

  const renderHeader = () => (
    <div className="flex flex-col relative z-20">
      <div className="flex items-center justify-between">
        {/* Left Brand */}
        <div className="w-[35%] pr-2">
          <div className="text-[26px] font-black tracking-tight leading-none text-black">
            <FormattedText text={companyName} />
          </div>
          <div className="text-[17px] font-extrabold tracking-wider leading-tight text-black mt-0.5">
            <FormattedText text={companySubtitle} />
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
                  <FormattedText text={svc} />
                </div>
              ))}
            </div>
            <div>
              {rightServices.map((svc, i) => (
                <div key={i} className="truncate">
                  <FormattedText text={svc} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Divider and GST */}
      <div className="h-[0.8pt] bg-black w-full my-1.5" />
      <div className="flex justify-between items-center text-[10px] font-bold text-black tracking-wide">
        <div><FormattedText text={profile.companyAddressHeader || 'Regd. Off. : SO7B / 2nd floor, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara, Gujarat - 391243'} /></div>
        <div>GST NO. : <FormattedText text={profile.companyGstNo || '24CLNPS9550H1ZI'} /></div>
      </div>
      
      <div className="absolute inset-0 rounded-lg ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 pointer-events-none z-30" style={{ left: '-8px', right: '-8px', top: '-8px', bottom: '-8px' }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#002057] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm">HEADER</div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-auto relative z-20">
      <div className="absolute inset-0 rounded-lg ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 pointer-events-none z-30" style={{ left: '-8px', right: '-8px', top: '-12px', bottom: '-8px' }}>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#002057] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm">FOOTER</div>
      </div>
      
      <div className="h-[0.8pt] bg-black mb-1" />
      <div className="flex justify-between items-center text-[9px] leading-tight text-black">
        <div className="flex-1 text-center font-semibold">
          Phone: <FormattedText text={profile.companyPhone || '+91 9000000000'} /> &bull;{' '}
          <FormattedText text={profile.companyAddressFooter || 'Block No. 1068, Vadodara'} />
          <br />
          Email: <FormattedText text={profile.companyEmail || 'info@company.com'} /> &bull; Website:{' '}
          <FormattedText text={profile.companyWebsite || 'www.company.com'} />
        </div>
        <div className="text-[10px] font-mono font-bold text-gray-700 shrink-0 pl-2">
          Page 1 of 1
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#64748b] overflow-hidden relative h-full">
      {/* Top Preview Toolbar */}
      <div className="h-[49px] bg-[#f0efe6] flex items-center justify-between px-4 border-b border-[#cccccc] shrink-0 z-10 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex bg-white rounded-lg border border-[#cccccc] overflow-hidden text-xs text-black shadow-xs">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
              className="px-2.5 py-1.5 hover:bg-slate-100 text-black transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 bg-[#f0efe6] text-[#0d3479] font-mono font-bold text-[11px] border-x border-[#cccccc]">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(175, zoomLevel + 15))}
              className="px-2.5 py-1.5 hover:bg-slate-100 text-black transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-3 py-1.5 hover:bg-slate-100 text-black transition-colors font-bold text-[11px] cursor-pointer"
            >
              Reset
            </button>
          </div>
          
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#0d3479] bg-[#dfe7f4] px-3 py-1.5 rounded-lg border border-[#b9c7de] font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0d3479] animate-pulse" />
            <span>section: header footer</span>
          </div>
        </div>

        <ShortcutsDropdown />
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#64748b] scrollbar-thin text-center">
        <div
          style={{
            zoom: zoomLevel / 100,
            transition: 'zoom 0.15s ease-out',
            display: 'inline-block',
            margin: '0 auto',
            textAlign: 'left',
          }}
          className="mb-20"
        >
          <div
            style={{
              fontFamily: fontFamilyStyle,
              width: '794px',
              minHeight: '1123px',
            }}
            className={`latex-paper print-area bg-white text-gray-900 p-12 md:p-16 shadow-2xl relative overflow-hidden flex flex-col justify-between ${fontSizeClass}`}
          >
            {/* Background Center Watermark */}
            <WatermarkOverlay />

            {/* Header Block */}
            <div className="relative z-1">{renderHeader()}</div>

            {/* Placeholder Middle */}
            <div className="flex-1 flex items-center justify-center relative z-1">
              <div className="text-gray-300 font-mono text-2xl rotate-[-25deg] uppercase tracking-widest border-[4px] border-gray-200 px-8 py-4 rounded-xl opacity-60 select-none">
                BODY PREVIEW
              </div>
            </div>

            {/* Footer Block */}
            <div className="relative z-1">{renderFooter()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
