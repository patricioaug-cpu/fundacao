import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label
} from 'recharts';

interface Props {
  currentNspt: number;
  currentPressureMPa: number;
  soilType: string;
}

export default function SettlementChart({ currentNspt, currentPressureMPa, soilType }: Props) {
  // Generate data points for the curve
  // σ_adm = (NSPT * 0.02) * (3 / FS)
  // Assuming FS = 3 for the chart visualization trend
  const data = Array.from({ length: 41 }, (_, i) => {
    const nspt = i;
    const pressure = nspt * 0.02;
    return {
      nspt,
      pressure: parseFloat(pressure.toFixed(3)),
    };
  });

  return (
    <div id="settlement-chart-container" className="w-full h-[300px] rounded-lg p-4 border mt-6" style={{ backgroundColor: 'rgba(24, 24, 27, 0.2)', borderColor: '#27272a' }}>
      <p className="uppercase font-bold tracking-widest mb-4" style={{ fontSize: '10px', color: '#71717a' }}>Gráfico de Sensibilidade: NSPT vs Pressão Admissível</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="nspt" 
            stroke="#71717a" 
            fontSize={10}
            label={{ value: 'NSPT', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 10 }}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={10}
            label={{ value: 'Pressão (MPa)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const nspt = Number(label);
                const pressure = payload[0].value;
                let status = "BAIXO";
                let statusColor = "text-green-400";
                
                if (nspt < 8) {
                  status = "ALTO";
                  statusColor = "text-red-400";
                } else if (nspt < 15) {
                  status = "MÉDIO";
                  statusColor = "text-amber-400";
                }

                const isCurrent = nspt === currentNspt;

                return (
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded shadow-xl text-[10px] space-y-2">
                    <p className="text-zinc-400 font-bold border-b border-zinc-800 pb-1 mb-1">DETALHES DO PONTO</p>
                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500">NSPT:</span>
                      <span className="text-zinc-100 font-mono">{nspt}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500">Pressão Adm:</span>
                      <span className="text-green-400 font-mono">{pressure} MPa</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500">Risco Recalque:</span>
                      <span className={`${statusColor} font-bold`}>{status}</span>
                    </div>
                    {isCurrent && (
                      <div className="mt-2 pt-1 border-t border-zinc-800 text-blue-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> PONTO CALCULADO
                      </div>
                    )}
                    {(nspt === 8 || nspt === 15) && (
                      <div className="mt-1 text-zinc-500 italic">
                        Limite de transição de risco
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Risk Areas */}
          <ReferenceArea x1={0} x2={8} fill="#ef4444" fillOpacity={0.05} />
          <ReferenceArea x1={8} x2={15} fill="#f59e0b" fillOpacity={0.05} />
          <ReferenceArea x1={15} x2={40} fill="#22c55e" fillOpacity={0.05} />

          {/* Threshold Lines */}
          <ReferenceLine x={8} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5}>
            <Label value="RISCO ALTO" position="top" fill="#ef4444" fontSize={8} offset={10} />
          </ReferenceLine>
          <ReferenceLine x={15} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5}>
            <Label value="RISCO MÉDIO" position="top" fill="#f59e0b" fontSize={8} offset={25} />
          </ReferenceLine>

          {/* Current Point */}
          <ReferenceLine x={currentNspt} stroke="#4ade80" strokeWidth={2} />
          <ReferenceLine y={currentPressureMPa} stroke="#4ade80" strokeWidth={2} />

          <Line 
            type="monotone" 
            dataKey="pressure" 
            stroke="#166534" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, fill: '#4ade80' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)' }}></div>
          <span style={{ fontSize: '8px', color: '#71717a' }}>ALTO</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)' }}></div>
          <span style={{ fontSize: '8px', color: '#71717a' }}>MÉDIO</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)' }}></div>
          <span style={{ fontSize: '8px', color: '#71717a' }}>BAIXO</span>
        </div>
      </div>
    </div>
  );
}
