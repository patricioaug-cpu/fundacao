import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMemorials, deleteMemorial } from '../lib/memorialService';
import { Trash2, FileText, Calendar, Database, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MemorialDoc {
  id: string;
  foundationType: string;
  justification: string;
  loadKN: number;
  nspt: number;
  created_at: any;
  calculationMemory: string[];
  settlementAnalysis: string;
  inputData?: any;
  resultData?: any;
}

export default function SavedMemorials() {
  const [memorials, setMemorials] = useState<MemorialDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMemorial, setViewingMemorial] = useState<MemorialDoc | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMemorials();
      setMemorials(data as any);
    } catch (error) {
      toast.error("Erro ao carregar memoriais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await deleteMemorial(deletingId);
      toast.success("Memorial excluído");
      setMemorials(prev => prev.filter(m => m.id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  if (loading) return <div className="text-center py-10 text-zinc-500 font-mono text-xs uppercase animate-pulse">Carregando memoriais...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-green-500" />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Histórico de Cálculos</h2>
      </div>

      {memorials.length === 0 ? (
        <Card className="bg-zinc-950 border-zinc-800 border-dashed">
          <CardContent className="py-10 text-center text-zinc-500 italic">
            Nenhum memorial salvo ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memorials.map((m) => (
            <Card key={m.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] mb-1">
                    <Calendar className="w-3 h-3" />
                    {m.created_at?.toDate ? format(m.created_at.toDate(), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : 'Data desconhecida'}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewingMemorial(m)} className="h-7 w-7 text-green-500 hover:text-green-400" title="Ver Relatório">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(m.id);
                      }} 
                      className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" 
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-green-500 text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {m.foundationType} - {m.loadKN}kN
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 cursor-pointer" onClick={() => setViewingMemorial(m)}>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase font-mono">NSPT: {m.nspt}</p>
                <p className="text-xs text-zinc-300 line-clamp-3 italic">
                  {m.justification}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button variant="link" size="sm" className="p-0 h-auto text-[10px] text-green-500 uppercase tracking-widest font-bold">
                    Abrir Memorial Completo →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visualizer Dialog */}
      <Dialog open={!!viewingMemorial} onOpenChange={(open) => !open && setViewingMemorial(null)}>
        <DialogContent className="w-[95vw] sm:max-w-3xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0">
          {viewingMemorial && (
            <>
              <DialogHeader className="p-4 sm:p-6 border-b border-zinc-800 shrink-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/5 text-[9px] uppercase tracking-widest px-1.5 py-0">Relatório</Badge>
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-bold font-mono text-green-500 break-words line-clamp-2">{viewingMemorial.foundationType}</DialogTitle>
                  <DialogDescription className="text-zinc-500 text-[10px] sm:text-xs">
                    Carga: {viewingMemorial.loadKN}kN | NSPT: {viewingMemorial.nspt} | {viewingMemorial.created_at?.toDate ? format(viewingMemorial.created_at.toDate(), "dd/MM/yyyy HH:mm") : 'N/A'}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar min-h-0">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Memória de Cálculo</h4>
                    <div className="bg-zinc-900/50 rounded-lg p-3 sm:p-4 border border-zinc-800 font-mono text-xs sm:text-sm space-y-2 text-green-400/90 whitespace-pre-wrap overflow-x-auto">
                      {viewingMemorial.calculationMemory.map((line, i) => (
                        <p key={i} className="min-w-[400px] sm:min-w-0">{line}</p>
                      ))}
                    </div>
                  </section>

                  <Separator className="bg-zinc-800" />

                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Análise de Recalque</h4>
                    <div className="bg-blue-900/10 rounded-lg p-3 sm:p-4 border border-blue-900/20 text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                      {viewingMemorial.settlementAnalysis}
                    </div>
                  </section>

                  <Separator className="bg-zinc-800" />

                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Justificativa Técnica</h4>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed border-l-2 border-green-500 pl-4 py-1">
                      {viewingMemorial.justification}
                    </p>
                  </section>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
                <Button onClick={() => setViewingMemorial(null)} className="h-9 px-4 bg-zinc-100 text-black hover:bg-white font-bold text-[10px] uppercase">Fechar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="w-[90vw] max-w-[400px] bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-500">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm py-2">
              Esta ação não pode ser desfeita. Deseja realmente excluir este memorial do seu histórico?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)} className="border-zinc-800 text-zinc-400">Cancelar</Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir Permanente</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
