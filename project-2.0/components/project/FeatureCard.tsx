import React from "react";
import { Feature } from "../../lib/scoring";
import { Trash2 } from "lucide-react";

interface CardProps {
  feature: Feature;
  rank: number;
  onDelete: (id: string) => void;
}

export default function FeatureCard({ feature, rank, onDelete }: CardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition group">
      {/* Rank Badge */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-lg">
        #{rank}
      </div>

      {/* Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 text-lg">{feature.name}</h3>
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-mono font-bold text-sm">
              Score: {feature.score}
            </span>
            <button 
              onClick={() => onDelete(feature.id)}
              className="text-slate-500 dark:text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex gap-4 mt-2 mb-3 text-xs font-mono font-medium text-slate-600 dark:text-gray-500">
          <span className="bg-blue-50 text-blue-700 px-2 rounded opacity-80">R:{feature.reach}</span>
          <span>×</span>
          <span className="bg-green-50 text-green-700 px-2 rounded opacity-80">I:{feature.impact}</span>
          <span>×</span>
          <span className="bg-purple-50 text-purple-700 px-2 rounded opacity-80">C:{feature.confidence}</span>
          <span>÷</span>
          <span className="bg-orange-50 text-orange-700 px-2 rounded opacity-80">E:{feature.effort}</span>
        </div>

        {/* Rule Engine Explanation */}
        <p className="text-sm text-slate-400 dark:text-gray-600 border-l-2 border-blue-400 pl-3 italic">
          {feature.explanation}
        </p>
      </div>
    </div>
  );
}
