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

interface CompanyProfileEditorProps {
  profile: CompanyProfile;
  onChange: (profile: CompanyProfile) => void;
}

export const CompanyProfileEditor: React.FC<CompanyProfileEditorProps> = ({
  profile,
  onChange,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      
      {/* Brand & Identity */}
      <div className="bg-[#1a2332] rounded-lg border border-gray-800 overflow-hidden shadow-sm">
        <div className="bg-[#151d29] px-4 py-3 border-b border-gray-800 flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-gray-200 tracking-wider uppercase">
            Letterhead & Company Branding
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Company Name</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => onChange({ ...profile, companyName: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-semibold"
                style={{ color: '#ffffff' }}
                placeholder="GLOBAL"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Subtitle</label>
              <input
                type="text"
                value={profile.companySubtitle}
                onChange={(e) => onChange({ ...profile, companySubtitle: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-semibold"
                style={{ color: '#ffffff' }}
                placeholder="INDUSTRIES"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Company GST No.</label>
            <input
              type="text"
              value={profile.companyGstNo}
              onChange={(e) => onChange({ ...profile, companyGstNo: e.target.value })}
              className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Company PAN No.</label>
              <input
                type="text"
                value={profile.companyPanNo}
                onChange={(e) => onChange({ ...profile, companyPanNo: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                style={{ color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Company EPF No.</label>
              <input
                type="text"
                value={profile.companyEpfNo}
                onChange={(e) => onChange({ ...profile, companyEpfNo: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                style={{ color: '#ffffff' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Header Address</label>
            <input
              type="text"
              value={profile.companyAddressHeader}
              onChange={(e) => onChange({ ...profile, companyAddressHeader: e.target.value })}
              className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              style={{ color: '#ffffff' }}
              placeholder="Regd. Off. : SO7B / 2nd floor..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Left Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-400 uppercase">Left Services</label>
                <button
                  onClick={() => onChange({ ...profile, leftServices: [...profile.leftServices, ''] })}
                  className="p-1 hover:bg-[#2a3649] text-emerald-500 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {profile.leftServices.map((svc, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={svc}
                      onChange={(e) => {
                        const arr = [...profile.leftServices];
                        arr[i] = e.target.value;
                        onChange({ ...profile, leftServices: arr });
                      }}
                      className="flex-1 bg-white/10 border border-white/15 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      style={{ color: '#ffffff' }}
                    />
                    <button
                      onClick={() => {
                        const arr = profile.leftServices.filter((_, idx) => idx !== i);
                        onChange({ ...profile, leftServices: arr });
                      }}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {profile.leftServices.length === 0 && (
                  <div className="text-xs text-gray-600 italic">No left services added.</div>
                )}
              </div>
            </div>

            {/* Right Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-400 uppercase">Right Services</label>
                <button
                  onClick={() => onChange({ ...profile, rightServices: [...profile.rightServices, ''] })}
                  className="p-1 hover:bg-[#2a3649] text-emerald-500 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {profile.rightServices.map((svc, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={svc}
                      onChange={(e) => {
                        const arr = [...profile.rightServices];
                        arr[i] = e.target.value;
                        onChange({ ...profile, rightServices: arr });
                      }}
                      className="flex-1 bg-white/10 border border-white/15 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      style={{ color: '#ffffff' }}
                    />
                    <button
                      onClick={() => {
                        const arr = profile.rightServices.filter((_, idx) => idx !== i);
                        onChange({ ...profile, rightServices: arr });
                      }}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {profile.rightServices.length === 0 && (
                  <div className="text-xs text-gray-600 italic">No right services added.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="bg-[#1a2332] rounded-lg border border-gray-800 overflow-hidden shadow-sm">
        <div className="bg-[#151d29] px-4 py-3 border-b border-gray-800 flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-gray-200 tracking-wider uppercase">
            Footer Details
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Address (Footer)</label>
            <textarea
              value={profile.companyAddressFooter}
              onChange={(e) => onChange({ ...profile, companyAddressFooter: e.target.value })}
              className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[60px]"
              style={{ color: '#ffffff' }}
              placeholder="Block No. 1068..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
              <input
                type="text"
                value={profile.companyPhone}
                onChange={(e) => onChange({ ...profile, companyPhone: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                style={{ color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="text"
                value={profile.companyEmail}
                onChange={(e) => onChange({ ...profile, companyEmail: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                style={{ color: '#ffffff' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Website</label>
            <input
              type="text"
              value={profile.companyWebsite}
              onChange={(e) => onChange({ ...profile, companyWebsite: e.target.value })}
              className="w-full bg-white/10 border border-white/15 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              style={{ color: '#ffffff' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
