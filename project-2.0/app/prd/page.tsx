"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Download, Sparkles, Loader2, RefreshCw, Link as LinkIcon, CheckCircle, ChevronDown } from "lucide-react";
import { useAppContext } from "../../lib/AppContext";
import { STATUS_CONFIG } from "../../lib/features";
import { useSearchParams } from "next/navigation";

import { TutorialButton } from "../../components/ui/TutorialButton";

export default function PRDGeneratorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-600 dark:text-gray-500">Loading...</div>}>
      <PRDInner />
    </Suspense>
  );
}

function PRDInner() {
  const { features, updateFeature } = useAppContext();
  const searchParams = useSearchParams();

  const [context, setContext] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [technicalConstraints, setTechnicalConstraints] = useState("");
  const [linkedFeatureId, setLinkedFeatureId] = useState<string>("");
  const [justLinked, setJustLinked] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrd, setGeneratedPrd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const prdRef = useRef<HTMLDivElement>(null);

  // Auto-select feature if featureId is in URL
  useEffect(() => {
    const id = searchParams.get("featureId");
    if (id) setLinkedFeatureId(id);
  }, [searchParams]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context || !businessGoal || !targetAudience || !proposedSolution) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedPrd("");

    try {
      const res = await fetch("/api/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          businessGoal,
          targetAudience,
          proposedSolution,
          technicalConstraints,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate PRD");
      }

      setGeneratedPrd(data.result);

      // Link back to the feature if one was selected
      if (linkedFeatureId) {
        const prdId = `productos_prd_${linkedFeatureId}`;
        localStorage.setItem(prdId, data.result);
        updateFeature(linkedFeatureId, { prdGenerated: true, prdId });
        setJustLinked(true);
        setTimeout(() => setJustLinked(false), 4000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = () => {
    if (!prdRef.current) return;
    try {
      // Taking the rendered HTML and wrapping it in standard MS Word HTML headers
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Product Requirements Document</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1, h2, h3 { color: #333; margin-top: 24px; padding-bottom: 4px; }
            h2 { border-bottom: 1px solid #ccc; }
            p { margin-bottom: 12px; }
            ul { margin-bottom: 16px; }
            li { margin-bottom: 4px; }
            strong { color: #000; }
          </style>
        </head>
        <body>
          ${prdRef.current.innerHTML}
        </body>
        </html>
      `;
      
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Product_Requirements_Document.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word Generation failed", err);
      alert("Failed to generate Word Doc. Check console for details.");
    }
  };

  return (
    <div className="h-screen flex text-slate-900 dark:text-white overflow-hidden">
      {/* Left Column: Input Form */}
      <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0f0f1a]">
        <div className="p-6 border-b border-slate-200 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Sparkles size={20} className="text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">AI PRD Generator</h1>
                <TutorialButton tutorialKey="prd" />
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-500 font-medium">Structured Product Requirements</p>
            </div>
          </div>

          {/* Feature linker */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-500 uppercase tracking-wider mb-1.5">Link to a Board Feature (optional)</label>
            <div className="relative">
              <select
                value={linkedFeatureId}
                onChange={e => setLinkedFeatureId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-[#1e2132]">No feature linked</option>
                {features.map(f => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-[#1e2132]">
                    {f.productId} — {f.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-2.5 text-slate-600 dark:text-gray-500 pointer-events-none" />
            </div>
            {linkedFeatureId && (() => {
              const f = features.find(x => x.id === linkedFeatureId);
              if (!f) return null;
              const cfg = STATUS_CONFIG[f.status];
              return (
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <LinkIcon size={10} className="text-violet-400" />
                  <span className="text-slate-500 dark:text-gray-400">{f.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  {f.prdGenerated && <span className="text-[10px] text-violet-400 font-bold">● PRD already exists</span>}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="prd-form" onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">The Problem / Context</label>
              <p className="text-xs text-slate-600 dark:text-gray-500 mb-2">What is broken today, and how are users currently handling it? <br/><span className="text-[10px] text-violet-400/80 mt-1 inline-block">↳ Builds: Problem Statement, Current Scenario, Shortcomings</span></p>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500/50 transition resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Goal</label>
              <p className="text-xs text-slate-600 dark:text-gray-500 mb-2">Why are we building this? (e.g., Increase revenue, save time) <br/><span className="text-[10px] text-violet-400/80 mt-1 inline-block">↳ Builds: Business & User Objectives, Success Metrics (KPIs)</span></p>
              <textarea
                value={businessGoal}
                onChange={(e) => setBusinessGoal(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500/50 transition resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Target Audience</label>
              <p className="text-xs text-slate-600 dark:text-gray-500 mb-2">Who is the primary user for this feature? <br/><span className="text-[10px] text-violet-400/80 mt-1 inline-block">↳ Builds: User Persona, User Stories</span></p>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Small business owners, Enterprise IT Admins"
                className="w-full bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Proposed Solution</label>
              <p className="text-xs text-slate-600 dark:text-gray-500 mb-2">What is the core idea or feature that solves this problem? <br/><span className="text-[10px] text-violet-400/80 mt-1 inline-block">↳ Builds: Functional Requirements, User Flow, Wireframe Logic</span></p>
              <textarea
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                rows={4}
                className="w-full bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500/50 transition resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tech Stack & Constraints</label>
              <p className="text-xs text-slate-600 dark:text-gray-500 mb-2">Any technical limits, design rules, or specific technologies? <br/><span className="text-[10px] text-violet-400/80 mt-1 inline-block">↳ Builds: Tech/Non-functional Requirements, Edge Cases</span></p>
              <textarea
                value={technicalConstraints}
                onChange={(e) => setTechnicalConstraints(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500/50 transition"
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/[0.06] shrink-0 bg-slate-50 dark:bg-[#0f0f1a]">
          <button
            type="submit"
            form="prd-form"
            disabled={isGenerating || !context || !businessGoal || !targetAudience || !proposedSolution || !technicalConstraints}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-slate-900 dark:text-white font-semibold rounded-lg shadow-sm dark:shadow-lg shadow-violet-600/20 transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating PRD...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate PRD
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="w-1/2 flex flex-col bg-white dark:bg-[#12141c]">
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between shrink-0 h-[89px]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-500 dark:text-gray-400" />
            <h2 className="text-sm font-bold text-gray-300">Document Preview</h2>
          </div>
          
          <button
            onClick={handleDownloadWord}
            disabled={!generatedPrd || isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 disabled:opacity-30 border border-blue-500/30 rounded-lg text-sm font-medium transition"
          >
            <Download size={16} />
            Download as Word
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 dark:text-gray-500 gap-4">
              <RefreshCw size={32} className="animate-spin text-violet-500" />
              <p className="text-sm font-medium animate-pulse text-violet-300">Thinking deeply... AI crafting your PRD</p>
            </div>
          ) : generatedPrd ? (
            <div 
              ref={prdRef} 
              className="prose prose-invert prose-violet max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:border-b prose-h2:border-slate-200 dark:border-white/[0.1] prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-gray-300 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-slate-900 dark:text-white"
            >
              <ReactMarkdown>{generatedPrd}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
                <FileText size={32} className="text-slate-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Document Generated</h3>
              <p className="text-slate-600 dark:text-gray-500 text-sm">
                Fill out the required inputs on the left, ensuring your problem and target users are well-defined. Then click generate to build a structured PRD.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
