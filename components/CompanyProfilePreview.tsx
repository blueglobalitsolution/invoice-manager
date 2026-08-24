'use client';

import React from 'react';
import { CompanyProfile } from '@/types/project';
import { FileCode, ZoomIn, ZoomOut } from 'lucide-react';

interface CompanyProfilePreviewProps {
  profile: CompanyProfile;
}

export const CompanyProfilePreview: React.FC<CompanyProfilePreviewProps> = ({ profile }) => {
  const [zoomLevel, setZoomLevel] = React.useState(100);

  const fontFamilyStyle = 'Arial, Helvetica, sans-serif';
  const fontSizeClass = 'text-[13px] leading-relaxed';
  const companyName = profile.companyName || 'GLOBAL';
  const companySubtitle = profile.companySubtitle || 'INDUSTRIES';

  const maxServices = Math.max(profile.leftServices.length, profile.rightServices.length);
  const servicesRows = [];
  for (let i = 0; i < maxServices; i++) {
    servicesRows.push({
      left: profile.leftServices[i] || '',
      right: profile.rightServices[i] || '',
    });
  }

  const renderHeader = () => (
    <div className="flex flex-col relative z-20">
      <div className="flex items-center justify-between pb-1">
        <div className="w-[35%] pr-3">
          <div className="text-2xl font-black tracking-wider text-black leading-tight">
            {companyName}
          </div>
          <div className="text-lg font-bold tracking-widest text-black leading-tight">
            {companySubtitle}
          </div>
        </div>
        <div className="w-[1px] bg-black self-stretch mx-2" />
        <div className="w-[60%] pl-2 text-[10px] leading-tight text-gray-900">
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <div>
              {profile.leftServices.map((svc, i) => (
                <div key={i} className="truncate">
                  {svc}
                </div>
              ))}
            </div>
            <div>
              {profile.rightServices.map((svc, i) => (
                <div key={i} className="truncate">
                  {svc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1.5 my-1">
        <div className="flex-1 h-[2px] bg-black" />
        <div className="w-1.5 h-1.5 rotate-45 border border-black" />
        <div className="flex-1 h-[2px] bg-black" />
      </div>
      
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-900">
        <div>{profile.companyAddressHeader || 'Regd. Off. : SO7B / 2nd floor...'}</div>
        <div>GST NO: {profile.companyGstNo || '24AA...'}</div>
      </div>
      
      <div className="h-[1px] bg-black my-1" />
      
      <div className="absolute inset-0 rounded border-2 border-emerald-500 pointer-events-none z-30" style={{ left: '-8px', right: '-8px', top: '-8px', bottom: '-8px' }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow">HEADER</div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-auto relative z-20">
      <div className="absolute inset-0 rounded border-2 border-blue-500 pointer-events-none z-30" style={{ left: '-8px', right: '-8px', top: '-12px', bottom: '-8px' }}>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow">FOOTER</div>
      </div>
      
      <div className="h-[1.5px] bg-black mb-1" />
      <div className="flex justify-between items-center text-[9px] leading-tight text-black">
        <div className="flex-1 text-center font-semibold">
          Phone: {profile.companyPhone || '+91 9000000000'} &bull;{' '}
          {profile.companyAddressFooter || 'Block No. 1068, Vadodara'}
          <br />
          Email: {profile.companyEmail || 'info@company.com'} &bull; Website:{' '}
          {profile.companyWebsite || 'www.company.com'}
        </div>
        <div className="text-[10px] font-mono font-bold text-gray-700 shrink-0 pl-2">
          Page 1 of 1
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#4B5563] overflow-hidden relative h-full">
      {/* Top Preview Toolbar */}
      <div className="h-10 bg-[#374151] flex items-center justify-between px-4 border-b border-gray-600 shrink-0 z-10 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex bg-[#1F2937] rounded border border-gray-700 overflow-hidden text-xs text-gray-300">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
              className="px-2 py-1 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-1 bg-[#111827] text-white font-mono font-medium text-[11px] border-x border-gray-700">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(175, zoomLevel + 15))}
              className="px-2 py-1 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2.5 py-1 hover:bg-gray-700 hover:text-white transition-colors font-medium text-[11px] cursor-pointer"
            >
              Reset
            </button>
          </div>
          
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-[#1F2937]/90 px-2.5 py-1 rounded border border-emerald-800/60 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>section: header footer</span>
          </div>
        </div>

        <button
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#1F2937] hover:bg-gray-700 text-sky-300 hover:text-white rounded border border-gray-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <FileCode className="w-3.5 h-3.5 text-sky-400" />
          <span>LaTeX Code</span>
        </button>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#52525B] scrollbar-thin text-center">
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
            className={`latex-paper print-area bg-white text-gray-900 p-12 md:p-16 shadow-2xl relative flex flex-col justify-between ${fontSizeClass}`}
          >
            {/* Header Block */}
            {renderHeader()}

            {/* Placeholder Middle */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-300 font-mono text-2xl rotate-[-25deg] uppercase tracking-widest border-[4px] border-gray-200 px-8 py-4 rounded-xl opacity-60">
                BODY PREVIEW
              </div>
            </div>

            {/* Footer Block */}
            {renderFooter()}
          </div>
        </div>
      </div>
    </div>
  );
};
