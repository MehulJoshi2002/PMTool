import React from "react";

interface RangeSliderProps {
  label: string;
  helperText: string;
  value: number;
  onChange: (val: number) => void;
}

export default function RangeSlider({ label, helperText, value, onChange }: RangeSliderProps) {
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex justify-between items-end">
        <label className="font-semibold text-sm text-gray-300">{label}</label>
        <span className="text-xl font-bold text-blue-400 font-mono">{value}</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-gray-500 italic">{helperText}</p>
      
      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-400 dark:text-gray-600 font-medium font-mono">1</span>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg cursor-pointer"
        />
        <span className="text-xs text-slate-400 dark:text-gray-600 font-medium font-mono">5</span>
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-gray-600 font-mono pt-0.5 px-4">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
