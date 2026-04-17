import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalculationResult, CalculationInput } from '@/src/calculations/engine';
import { AlertTriangle, CheckCircle2, Copy, Printer, FileText, TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import FoundationDiagram from './FoundationDiagram';
import SettlementChart from './SettlementChart';
import { domToDataUrl } from 'modern-screenshot';
import { saveMemorial } from '../lib/memorialService';
import { useAuth } from '../context/AuthContext';

interface Props {
  result: CalculationResult;
  input: CalculationInput;
  onExportPDF: (diagramImg?: string, chartImg?: string) => void;
  onPrint: () => void;
}

export default function ResultDisplay({ result, input, onExportPDF, onPrint }: Props) {
  const { user, isTrialExpired } = useAuth();
  
  const handleExport = async () => {
    try {
      toast.info("Preparando PDF...");
      
      const diagramEl = document.getElementById('foundation-diagram-container');
      const chartEl = document.getElementById('settlement-chart-container');
      
      let diagramImg: string | undefined;
      let chartImg: string | undefined;
      
      if (diagramEl) {
        diagramImg = await domToDataUrl(diagramEl, { 
          backgroundColor: '#18181b',
        });
      }
      
      if (chartEl) {
        chartImg = await domToDataUrl(chartEl, { 
          backgroundColor: '#18181b',
        });
      }
      
      onExportPDF(diagramImg, chartImg);
    } catch (error) {
      console.error("Erro ao capturar imagens:", error);
      onExportPDF(); // Fallback without images
    }
  };

  const copyToClipboard = () => {
    const text = `
FundAção — Relatório de Pré-Dimensionamento
-------------------------------------------
Norma Utilizada: NBR 6122:2022
Fundação Recomendada: ${result.foundationType}
Área Necessária: ${result.requiredAreaM2.toFixed(3)} m²
Dimensões (Lado): ${result.dimensionL.toFixed(2)} m
Espessura (h): ${result.thicknessH.toFixed(2)} m
Pressão Admissível: ${result.allowablePressureMPa.toFixed(3)} MPa
Risco de Recalque: ${result.settlementRisk}
Alertas: ${result.punchingAlert ? 'Risco de Punção' : 'Normal'}
-------------------------------------------
Justificativa: ${result.justification}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success("Relatório copiado para a área de transferência!");
  };

  const handleSaveToCloud = async () => {
    try {
      toast.loading("Salvando no Firestore...", { id: 'save-memorial' });
      await saveMemorial(input, result);
      toast.success("Memorial salvo com sucesso!", { id: 'save-memorial' });
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar memorial", { id: 'save-memorial' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 overflow-hidden">
        <div className="bg-green-900/20 p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-green-500 font-mono text-lg sm:text-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> 
            <span className="truncate">RESULTADO TÉCNICO</span>
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 lg:flex-none border-zinc-700 bg-zinc-900 hover:bg-zinc-800 h-9">
                <Copy className="w-4 h-4 mr-2" /> Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={onPrint} className="flex-1 lg:flex-none border-zinc-700 bg-zinc-900 hover:bg-zinc-800 h-9">
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveToCloud} 
                disabled={!user || isTrialExpired}
                className="flex-1 lg:flex-none border-zinc-700 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 h-9 disabled:opacity-50"
                title={!user ? "Faça login para salvar" : isTrialExpired ? "Trial expirado" : ""}
              >
                <Save className="w-4 h-4 mr-2" /> Salvar Memorial
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full lg:w-auto border-zinc-700 bg-green-900/20 hover:bg-green-900/40 text-green-400 h-9">
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Fundação Recomendada</p>
                  <p className="text-2xl font-bold text-white">{result.foundationType}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Área Necessária</p>
                    <p className="text-xl font-mono">{result.requiredAreaM2.toFixed(3)} m²</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Pressão Admissível</p>
                    <p className="text-xl font-mono">{result.allowablePressureMPa.toFixed(3)} MPa</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Dimensões (Lado L)</p>
                    <p className="text-xl font-mono">{result.dimensionL.toFixed(2)} m</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Espessura (h)</p>
                    <p className="text-xl font-mono">{result.thicknessH.toFixed(2)} m</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Alertas e Verificações</p>
                <div className="space-y-2">
                  <div className={`p-3 rounded border flex items-center gap-3 ${result.settlementRisk === 'ALTO' ? 'bg-red-900/20 border-red-800 text-red-400' : result.settlementRisk === 'MÉDIO' ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' : 'bg-green-900/20 border-green-800 text-green-400'}`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Risco de Recalque: {result.settlementRisk}</p>
                      <p className="text-xs opacity-80">Baseado no NSPT informado.</p>
                    </div>
                  </div>

                  {result.punchingAlert && (
                    <div className="p-3 rounded border bg-orange-900/20 border-orange-800 text-orange-400 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Alerta de Punção</p>
                        <p className="text-xs opacity-80">Tensão de contato elevada.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {result.diagramData ? (
                <FoundationDiagram 
                  pillarWidth={result.diagramData.pillarWidth}
                  pillarLength={result.diagramData.pillarLength}
                  baseL={result.diagramData.baseL}
                  thicknessH={result.diagramData.thicknessH}
                  type={result.foundationType}
                />
              ) : (
                <FoundationDiagram 
                  pillarWidth={input.pillarWidth}
                  pillarLength={input.pillarLength}
                  baseL={result.dimensionL}
                  thicknessH={result.thicknessH}
                  type={result.foundationType}
                />
              )}
              
              <div className="w-full mt-6">
                <SettlementChart 
                  currentNspt={input.nspt} 
                  currentPressureMPa={result.allowablePressureMPa} 
                  soilType={input.soilType}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-zinc-900 rounded border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Memória de Cálculo (NBR 6122:2022)</p>
            <div className="font-mono text-sm space-y-1 text-green-400/80">
              {result.calculationMemory.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-zinc-900/50 rounded border border-zinc-800 italic text-sm text-zinc-400">
            <p><span className="font-bold text-zinc-300">Justificativa:</span> {result.justification}</p>
          </div>

          <div className="mt-4 p-4 bg-blue-900/10 rounded border border-blue-800/30 text-sm text-zinc-300">
            <p className="text-blue-400 font-bold uppercase text-xs mb-2 tracking-wider">Análise Detalhada de Recalque</p>
            <p className="leading-relaxed">{result.settlementAnalysis}</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-zinc-500 uppercase tracking-widest py-4">
        ⚠️ Este aplicativo não substitui o projeto de fundações conforme NBR 6122.
      </div>
    </div>
  );
}
