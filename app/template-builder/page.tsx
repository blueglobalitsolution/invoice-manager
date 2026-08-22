'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateBuilderStudio } from '@/components/TemplateBuilderStudio';
import { LatexDocument } from '@/types/document';
import { LABOUR_PO_TEMPLATE } from '@/lib/templates';

export default function TemplateBuilderPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('latex_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleSaveCustomTemplate = (tName: string, tDesc: string, tDoc: LatexDocument) => {
    if (!currentUser) return;
    const newTemplate = {
      id: `tmpl_${Date.now()}`,
      userId: currentUser.email,
      name: tName,
      description: tDesc,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      document: tDoc,
    };

    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTemplate),
    }).catch((e) => {
      console.error('Failed to save template to SQLite', e);
    });
  };

  const handleCreateProjectFromTemplate = (templateDoc: LatexDocument, projectName: string, meta?: any) => {
    if (!currentUser) return;

    const newProjId = `proj_${Date.now()}`;
    
    // Replace template placeholders dynamically
    let templateStr = JSON.stringify(templateDoc);
    if (meta) {
      if (meta.clientName) {
        templateStr = templateStr.replace(/\{\{CONTRACTOR_NAME\}\}/g, meta.clientName);
        templateStr = templateStr.replace(/\{\{CLIENT_NAME\}\}/g, meta.clientName);
      }
      if (meta.location) {
        templateStr = templateStr.replace(/\{\{PROJECT_LOCATION\}\}/g, meta.location);
        templateStr = templateStr.replace(/\{\{LOCATION\}\}/g, meta.location);
      }
      templateStr = templateStr.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    }
    const processedTemplate: LatexDocument = JSON.parse(templateStr);

    const newProj = {
      id: newProjId,
      userId: currentUser.email,
      title: projectName,
      code: meta?.code || `GI-PRJ-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      clientName: meta?.clientName || 'Valued Contractor / Client',
      location: meta?.location || 'Site Location',
      category: meta?.category || 'Civil & PEB Construction',
      status: 'active',
      owner: currentUser.name,
      lastModified: 'Just now',
      tags: [meta?.category || 'Template'],
      isArchived: false,
      document: processedTemplate,
    };

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    })
      .then((res) => res.json())
      .then(() => {
        router.push(`/editor/${newProjId}`);
      })
      .catch((err) => console.error('Create project from template error:', err));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1320] flex items-center justify-center text-emerald-400 font-mono text-sm">
        Opening Template Studio...
      </div>
    );
  }

  return (
    <TemplateBuilderStudio
      onBack={() => router.push('/dashboard')}
      onSaveTemplate={handleSaveCustomTemplate}
      onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
      initialDocument={undefined}
    />
  );
}
