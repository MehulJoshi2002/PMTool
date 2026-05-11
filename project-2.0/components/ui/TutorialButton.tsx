"use client";

import React, { useState } from "react";
import { Info, X } from "lucide-react";
import { TUTORIALS, TutorialKey } from "../../lib/tutorials";

export function TutorialButton({ tutorialKey }: { tutorialKey: TutorialKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const data = TUTORIALS[tutorialKey];

  if (!data) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition shrink-0"
        title="How to use this"
      >
        <Info size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2132] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <data.icon size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{data.title}</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg transition shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-slate-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                {data.description}
              </p>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {data.steps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-[#171923] border border-slate-100 dark:border-white/[0.04] rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{step.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-black/20 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white dark:text-slate-900 text-sm font-semibold rounded-lg transition shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
