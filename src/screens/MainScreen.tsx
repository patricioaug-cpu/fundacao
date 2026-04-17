import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import CalculationForm from '@/src/components/CalculationForm';
import ResultDisplay from '@/src/components/ResultDisplay';
import HelpDialog from '@/src/components/HelpDialog';
import SavedMemorials from '@/src/components/SavedMemorials';
import { calculateFoundation, CalculationInput, CalculationResult } from '@/src/calculations/engine';
import { generatePDF } from '@/src/pdf/service';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Settings, HardHat, Plus, History } from 'lucide-react';
import { toast } from 'sonner';

export default function MainScreen() {
  const { userData, logout, isTrialExpired, isAdmin } = useAuth();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [lastInput, setLastInput] = useState<CalculationInput | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const handleCalculate = (input: CalculationInput) => {
    if (isTrialExpired && !isAdmin && userData?.status !== 'LIBERADO') {
      toast.error("Seu período de avaliação terminou. Entre em contato pelo e-mail patricioaug@gmail.com para continuar.");
      return;
    }
    
    const res = calculateFoundation(input);
    setResult(res);
    setLastInput(input);
    toast.success("Cálculo realizado com sucesso!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = (diagramImg?: string, chartImg?: string) => {
    if (lastInput && result) {
      generatePDF(lastInput, result, diagramImg, chartImg);
      toast.success("PDF gerado com sucesso!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-zinc-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-700 p-2 rounded flex-shrink-0">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg md:text-xl font-bold font-mono tracking-tighter text-green-500">
            FUNDAÇÃO <span className="hidden sm:inline">— PRÉ-DIMENSIONAMENTO</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <HelpDialog />
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => {
                window.history.pushState({}, '', '/admin');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }} className="text-zinc-400 hover:text-green-500 p-2 h-auto">
                <Settings className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">ADMIN</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 max-w-[150px]">
              <UserIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{userData?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-zinc-500 hover:text-red-500 flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-6 flex gap-2">
        <Button 
          variant={activeTab === 'new' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('new')}
          className={activeTab === 'new' ? 'bg-green-700 hover:bg-green-600' : 'text-zinc-400 hover:text-white'}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Cálculo
        </Button>
        <Button 
          variant={activeTab === 'history' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? 'bg-green-700 hover:bg-green-600' : 'text-zinc-400 hover:text-white'}
        >
          <History className="w-4 h-4 mr-2" /> Histórico
        </Button>
      </div>

      <main className="max-w-6xl mx-auto">
        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              {isTrialExpired && !isAdmin && userData?.status !== 'LIBERADO' ? (
                <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg text-center space-y-4">
                  <h2 className="text-xl font-bold text-red-500">AVALIAÇÃO EXPIRADA</h2>
                  <p className="text-sm text-zinc-400">
                    Seu período de 7 dias terminou. Para liberar o acesso completo, entre em contato:
                  </p>
                  <p className="font-mono text-green-500 font-bold">patricioaug@gmail.com</p>
                </div>
              ) : (
                <CalculationForm onCalculate={handleCalculate} />
              )}
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-12 xl:col-span-7">
              {result && lastInput ? (
                <ResultDisplay 
                  result={result} 
                  input={lastInput}
                  onExportPDF={handleExportPDF} 
                  onPrint={handlePrint} 
                />
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 space-y-4">
                  <div className="bg-zinc-900 p-6 rounded-full">
                    <Settings className="w-12 h-12 animate-spin-slow" />
                  </div>
                  <p className="font-mono text-sm uppercase tracking-widest text-center">Aguardando parâmetros para cálculo...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SavedMemorials />
        )}
      </main>
    </div>
  );
}
