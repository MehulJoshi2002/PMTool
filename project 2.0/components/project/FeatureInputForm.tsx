import React, { useState } from "react";
import RangeSlider from "../ui/RangeSlider";
import { calculateScore, generateExplanation, Feature } from "../../lib/scoring";
import { Sparkles } from "lucide-react";

interface FormProps {
  onAddFeature: (feature: Feature) => void;
}

export default function FeatureInputForm({ onAddFeature }: FormProps) {
  const [name, setName] = useState("");
  const [reach, setReach] = useState(3);
  const [impact, setImpact] = useState(3);
  const [effort, setEffort] = useState(3);
  const [confidence, setConfidence] = useState(3);

  const previewScore = calculateScore(reach, impact, confidence, effort);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const score = calculateScore(reach, impact, confidence, effort);
    const explanation = generateExplanation(reach, impact, confidence, effort);
    
    onAddFeature({
      id: crypto.randomUUID(),
      name,
      reach,
      impact,
      effort,
      confidence,
      score,
      explanation
    });

    // Reset Form
    setName("");
    setReach(3);
    setImpact(3);
    setEffort(3);
    setConfidence(3);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#171923] p-6 rounded-xl border border-white/[0.06]">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <Sparkles size={14} className="text-amber-400" />
        Evaluate Feature
      </h2>
      
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Feature Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. One-Click Checkout"
          className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder-gray-600 text-sm transition"
          required
        />
      </div>

      {/* Live score preview */}
      <div className="mb-6 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Score Preview</span>
          <span className="text-xl font-bold font-mono text-blue-400">{previewScore}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">R:{reach}</span>
          <span className="text-gray-600 text-[10px]">×</span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">I:{impact}</span>
          <span className="text-gray-600 text-[10px]">×</span>
          <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">C:{confidence}</span>
          <span className="text-gray-600 text-[10px]">÷</span>
          <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">E:{effort}</span>
        </div>
      </div>

      <div className="space-y-1">
        <RangeSlider 
          label="Reach" 
          helperText="How many users will this feature affect?"
          value={reach} 
          onChange={setReach} 
        />
        <RangeSlider 
          label="Impact" 
          helperText="How much does this affect users or revenue?"
          value={impact} 
          onChange={setImpact} 
        />
        <RangeSlider 
          label="Effort" 
          helperText="How long will this take to build?"
          value={effort} 
          onChange={setEffort} 
        />
        <RangeSlider 
          label="Confidence" 
          helperText="How sure are you about your estimates?"
          value={confidence} 
          onChange={setConfidence} 
        />
      </div>

      <button 
        type="submit" 
        className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-blue-600/20"
      >
        Calculate & Add Feature
      </button>
    </form>
  );
}
