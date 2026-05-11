import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Feature } from '../../lib/scoring';

interface MatrixProps {
  features: Feature[];
}

export default function PriorityMatrix({ features }: MatrixProps) {
  // Recharts requires a specific data array shape. We map Effort to X and Impact to Y.
  const data = features.map(f => ({
    id: f.id,
    name: f.name,
    reach: f.reach,
    x: f.effort,
    y: f.impact,
    score: f.score
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-slate-400 dark:text-gray-600">Reach: <span className="font-semibold">{data.reach}</span></p>
          <p className="text-sm text-slate-400 dark:text-gray-600">Impact: <span className="font-semibold">{data.y}</span></p>
          <p className="text-sm text-slate-400 dark:text-gray-600">Effort: <span className="font-semibold">{data.x}</span></p>
          <p className="text-xs font-mono text-blue-600 mt-2">Score: {data.score}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
      {/* Background Labels */}
      <div className="absolute top-6 left-12 text-xs font-bold text-green-600 opacity-50 bg-green-50 px-2 py-1 rounded">Quick Wins</div>
      <div className="absolute bottom-10 right-6 text-xs font-bold text-red-600 opacity-50 bg-red-50 px-2 py-1 rounded">Time Sinks</div>
      <div className="absolute top-6 right-6 text-xs font-bold text-orange-600 opacity-50 bg-orange-50 px-2 py-1 rounded">Major Projects</div>
      <div className="absolute bottom-10 left-12 text-xs font-bold text-slate-500 dark:text-gray-400 opacity-50 bg-gray-50 px-2 py-1 rounded">Fill-ins</div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
          
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Effort" 
            domain={[0, 6]} 
            ticks={[1, 2, 3, 4, 5]} 
            label={{ value: 'Effort ➔', position: 'insideBottomRight', offset: -10, className: "fill-gray-500 text-xs font-semibold" }} 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Impact" 
            domain={[0, 6]} 
            ticks={[1, 2, 3, 4, 5]} 
            label={{ value: 'Impact ➔', angle: -90, position: 'insideTopLeft', offset: 15, className: "fill-gray-500 text-xs font-semibold" }} 
          />
          
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          
          {/* Scatter Plot with Custom Colors based on Score */}
          <Scatter name="Features" data={data}>
            {data.map((entry, index) => {
              // Colorize dots based on pure RICE score relative power
              const isWin = entry.y >= 3 && entry.x <= 3;
              const isSink = entry.y < 3 && entry.x > 3;
              let fill = "#3B82F6"; // default blue
              if (isWin) fill = "#10B981"; // green
              if (isSink) fill = "#EF4444"; // red

              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Scatter>
          
          {/* Crosshairs to divide quadrants clearly at the 3.0 threshold */}
          <ReferenceLine x={3.5} stroke="#cbd5e1" strokeDasharray="3 3" />
          <ReferenceLine y={3.5} stroke="#cbd5e1" strokeDasharray="3 3" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
