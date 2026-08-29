'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  ListOrdered,
  Plus,
  Trash2,
} from 'lucide-react';
import { CompanyProfile } from '@/types/project';
import {
  formatGstInput,
  formatPanInput,
  sanitizePhoneInput,
} from '@/lib/validation';

interface CompanyProfileEditorProps {
  profile: CompanyProfile;
  onChange: (profile: CompanyProfile) => void;
}

export const CompanyProfileEditor: React.FC<CompanyProfileEditorProps> = ({
  profile,
  onChange,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6 text-black">
      
      {/* Brand & Identity */}
      <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
        <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-[#0d3479]" />
          <h3 className="text-xs font-bold text-[#0d3479] tracking-wider uppercase">
            Letterhead & Company Branding
          </h3>
        </div>
        <div className="p-4 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Company Name</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => onChange({ ...profile, companyName: e.target.value })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black placeholder-[#888888] focus:outline-none focus:border-[#0d3479] transition-all font-bold shadow-xs"
                placeholder="GLOBAL"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Subtitle</label>
              <input
                type="text"
                value={profile.companySubtitle}
                onChange={(e) => onChange({ ...profile, companySubtitle: e.target.value })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black placeholder-[#888888] focus:outline-none focus:border-[#0d3479] transition-all font-bold shadow-xs"
                placeholder="INDUSTRIES"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Company GST No.</label>
            <input
              type="text"
              value={profile.companyGstNo}
              onChange={(e) => onChange({ ...profile, companyGstNo: formatGstInput(e.target.value) })}
              maxLength={15}
              className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-[#0d3479] transition-all font-mono font-bold shadow-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Company PAN No.</label>
              <input
                type="text"
                value={profile.companyPanNo}
                onChange={(e) => onChange({ ...profile, companyPanNo: formatPanInput(e.target.value) })}
                maxLength={10}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-[#0d3479] transition-all font-mono font-bold shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Company EPF No.</label>
              <input
                type="text"
                value={profile.companyEpfNo}
                onChange={(e) => onChange({ ...profile, companyEpfNo: e.target.value })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-[#0d3479] transition-all font-mono font-bold shadow-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Header Address</label>
            <input
              type="text"
              value={profile.companyAddressHeader}
              onChange={(e) => onChange({ ...profile, companyAddressHeader: e.target.value })}
              className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black placeholder-[#888888] focus:outline-none focus:border-[#0d3479] transition-all font-medium shadow-xs"
              placeholder="Regd. Off. : SO7B / 2nd floor..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#cccccc]">
            {/* Left Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#0d3479] uppercase">Left Services</label>
                <button
                  onClick={() => onChange({ ...profile, leftServices: [...profile.leftServices, ''] })}
                  className="p-1 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded-md transition-colors cursor-pointer shadow-xs"
                  title="Add Left Service"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {profile.leftServices.map((svc, i) => (
                  <div key={i} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={svc}
                      onChange={(e) => {
                        const arr = [...profile.leftServices];
                        arr[i] = e.target.value;
                        onChange({ ...profile, leftServices: arr });
                      }}
                      className="flex-1 bg-white border border-[#cccccc] rounded-lg px-2.5 py-1.5 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                    <button
                      onClick={() => {
                        const arr = profile.leftServices.filter((_, idx) => idx !== i);
                        onChange({ ...profile, leftServices: arr });
                      }}
                      className="text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {profile.leftServices.length === 0 && (
                  <div className="text-xs text-[#888888] italic">No left services added.</div>
                )}
              </div>
            </div>

            {/* Right Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#0d3479] uppercase">Right Services</label>
                <button
                  onClick={() => onChange({ ...profile, rightServices: [...profile.rightServices, ''] })}
                  className="p-1 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded-md transition-colors cursor-pointer shadow-xs"
                  title="Add Right Service"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {profile.rightServices.map((svc, i) => (
                  <div key={i} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={svc}
                      onChange={(e) => {
                        const arr = [...profile.rightServices];
                        arr[i] = e.target.value;
                        onChange({ ...profile, rightServices: arr });
                      }}
                      className="flex-1 bg-white border border-[#cccccc] rounded-lg px-2.5 py-1.5 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                    <button
                      onClick={() => {
                        const arr = profile.rightServices.filter((_, idx) => idx !== i);
                        onChange({ ...profile, rightServices: arr });
                      }}
                      className="text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {profile.rightServices.length === 0 && (
                  <div className="text-xs text-[#888888] italic">No right services added.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
        <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#0d3479]" />
          <h3 className="text-xs font-bold text-[#0d3479] tracking-wider uppercase">
            Footer Details
          </h3>
        </div>
        <div className="p-4 space-y-4 bg-white">
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Address (Footer)</label>
            <textarea
              value={profile.companyAddressFooter}
              onChange={(e) => onChange({ ...profile, companyAddressFooter: e.target.value })}
              className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black placeholder-[#888888] focus:outline-none focus:border-[#0d3479] transition-all min-h-[65px] font-medium shadow-xs"
              placeholder="Block No. 1068..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Phone</label>
              <input
                type="text"
                value={profile.companyPhone}
                onChange={(e) => onChange({ ...profile, companyPhone: sanitizePhoneInput(e.target.value) })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] transition-all shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Email</label>
              <input
                type="text"
                value={profile.companyEmail}
                onChange={(e) => onChange({ ...profile, companyEmail: e.target.value })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] transition-all shadow-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Website</label>
            <input
              type="text"
              value={profile.companyWebsite}
              onChange={(e) => onChange({ ...profile, companyWebsite: e.target.value })}
              className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] transition-all shadow-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
