'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectItem, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/project';
import { CompanyProfileEditor } from '@/components/CompanyProfileEditor';
import { CompanyProfilePreview } from '@/components/CompanyProfilePreview';
import { syncProjectMasterToDocuments } from '@/lib/project-doc-templates';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function CompanyProfilePage() {
  const { projectId } = useParams() as { projectId: string };
  const router = useRouter();
  
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch project');
        return res.json();
      })
      .then((data: ProjectItem) => {
        setProject(data);
        const activeDoc = data.documents?.[0]?.document || data.document;
        const activePO = activeDoc?.purchaseOrder;
        const activeQ = activeDoc?.quotation;
        const activeTax = activeDoc?.taxInvoice;

        const mergedProfile: CompanyProfile = {
          companyName:
            data.companyProfile?.companyName ||
            activePO?.tableCompanyName ||
            activePO?.companyName ||
            activeQ?.companyName ||
            activeTax?.companyName ||
            DEFAULT_COMPANY_PROFILE.companyName,
          companySubtitle:
            data.companyProfile?.companySubtitle !== undefined && data.companyProfile.companySubtitle !== ''
              ? data.companyProfile.companySubtitle
              : activePO?.tableCompanySubtitle ||
                activePO?.companySubtitle ||
                activeQ?.companySubtitle ||
                activeTax?.companySubtitle ||
                DEFAULT_COMPANY_PROFILE.companySubtitle,
          companyAddressHeader:
            data.companyProfile?.companyAddressHeader ||
            (activePO?.tableCompanyAddress || activePO?.companyAddress
              ? (activePO.tableCompanyAddress || activePO.companyAddress).join('\n')
              : '') ||
            activeQ?.companyAddressHeader ||
            activeTax?.companyAddressHeader ||
            DEFAULT_COMPANY_PROFILE.companyAddressHeader,
          companyAddressFooter:
            data.companyProfile?.companyAddressFooter ||
            activePO?.companyAddressFooter ||
            activeQ?.companyAddressFooter ||
            activeTax?.companyAddressFooter ||
            DEFAULT_COMPANY_PROFILE.companyAddressFooter,
          companyGstNo:
            data.companyProfile?.companyGstNo ||
            activePO?.gstNo ||
            activeQ?.companyGstNo ||
            activeTax?.companyGstNo ||
            DEFAULT_COMPANY_PROFILE.companyGstNo,
          companyPanNo:
            data.companyProfile?.companyPanNo ||
            activeTax?.companyPanNo ||
            DEFAULT_COMPANY_PROFILE.companyPanNo,
          companyEpfNo:
            data.companyProfile?.companyEpfNo ||
            activeTax?.companyEpfNo ||
            DEFAULT_COMPANY_PROFILE.companyEpfNo,
          companyPhone:
            data.companyProfile?.companyPhone ||
            activePO?.companyPhone ||
            activeQ?.companyPhone ||
            activeTax?.companyPhone ||
            DEFAULT_COMPANY_PROFILE.companyPhone,
          companyEmail:
            data.companyProfile?.companyEmail ||
            activePO?.companyEmail ||
            activeQ?.companyEmail ||
            activeTax?.companyEmail ||
            DEFAULT_COMPANY_PROFILE.companyEmail,
          companyWebsite:
            data.companyProfile?.companyWebsite ||
            activePO?.companyWebsite ||
            activeQ?.companyWebsite ||
            activeTax?.companyWebsite ||
            DEFAULT_COMPANY_PROFILE.companyWebsite,
          leftServices:
            data.companyProfile?.leftServices && data.companyProfile.leftServices.length > 0
              ? data.companyProfile.leftServices
              : activePO?.leftServices ||
                activeQ?.leftServices ||
                activeTax?.leftServices ||
                DEFAULT_COMPANY_PROFILE.leftServices,
          rightServices:
            data.companyProfile?.rightServices && data.companyProfile.rightServices.length > 0
              ? data.companyProfile.rightServices
              : activePO?.rightServices ||
                activeQ?.rightServices ||
                activeTax?.rightServices ||
                DEFAULT_COMPANY_PROFILE.rightServices,
        };

        setProfile(mergedProfile);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [projectId]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const updatedProject: ProjectItem = {
        ...project,
        companyProfile: profile,
        lastModified: 'Just now by You',
      };
      const syncedDocs = syncProjectMasterToDocuments(updatedProject);
      updatedProject.documents = syncedDocs;
      if (syncedDocs[0]?.document) {
        updatedProject.document = syncedDocs[0].document;
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Company Profile saved and synced across all documents!');
      // Redirect back to project detail view
      router.push(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f3eb]">
        <Loader2 className="w-8 h-8 text-[#0d3479] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f4f3eb] text-black">
      {/* Sleek Top Header in Signature Deep Navy */}
      <header className="h-11 bg-[#002057] border-b border-[#15428a] flex items-center justify-between px-4 shrink-0 shadow-xs select-none">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/project/${projectId}`)}
            className="p-1.5 hover:bg-[#0d3479] text-white/90 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Back to Project"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs">
            <span className="uppercase font-mono font-bold text-white bg-[#0d3479] px-2.5 py-0.5 rounded-full border border-[#2356a8]">
              PROJECT / {project?.code}
            </span>
            <span className="text-white/40">|</span>
            <span className="text-white font-semibold">Company Profile (Header & Footer)</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-[#002057] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 text-[#002057] animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#002057]" />
            )}
            <span>{saving ? 'Saving...' : 'Save to Project'}</span>
          </button>
        </div>
      </header>

      {/* Split View Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Inputs */}
        <div className="w-1/2 lg:w-5/12 xl:w-1/3 border-r border-[#cccccc] bg-[#f4f3eb] overflow-y-auto custom-scrollbar">
          <CompanyProfileEditor profile={profile} onChange={setProfile} />
        </div>
        
        {/* Right: PDF Preview */}
        <div className="flex-1 bg-[#64748b] relative overflow-hidden flex flex-col">
          <CompanyProfilePreview profile={profile} />
        </div>
      </div>
    </div>
  );
}
