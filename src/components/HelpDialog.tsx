import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, BookOpen, Calculator, ShieldAlert, CheckCircle } from "lucide-react";

export default function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-green-500">
            <HelpCircle className="w-4 h-4 mr-2" /> AJUDA
          </Button>
        }
      />
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-green-500 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> GUIA DO USUÁRIO
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Entenda como o FundAção auxilia no seu projeto preliminar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section className="space-y-2">
            <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
              <Calculator className="w-5 h-5 text-green-600" /> O que o aplicativo calcula?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              O FundAção realiza o <strong>pré-dimensionamento</strong> de fundações superficiais (Sapatas, Blocos e Radiers) com base na <strong>NBR 6122:2022</strong>. 
              Ele estima a pressão admissível do solo através do índice NSPT e sugere as dimensões geométricas iniciais (área da base e espessura) para suportar a carga informada.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
              <CheckCircle className="w-5 h-5 text-green-600" /> Passo a Passo para o Cálculo
            </h3>
            <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-2 ml-2">
              <li><strong>Dados do Solo:</strong> Insira o tipo predominante e o valor médio do NSPT na cota de assentamento.</li>
              <li><strong>Cargas:</strong> Informe a carga característica (vertical) proveniente do pilar em kN.</li>
              <li><strong>Geometria do Pilar:</strong> Defina as dimensões da seção transversal do pilar.</li>
              <li><strong>Condicionantes:</strong> Marque se há excentricidade ou se a carga é distribuída.</li>
              <li><strong>Resultado:</strong> Clique em "Calcular" para obter a recomendação técnica e o esquema gráfico.</li>
            </ol>
          </section>

          <section className="space-y-2 p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
            <h3 className="text-lg font-bold flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-5 h-5" /> Nota de Responsabilidade
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              Este aplicativo é uma ferramenta de auxílio à decisão técnica e pré-dimensionamento. 
              <strong> A responsabilidade técnica final pelo projeto de fundações deve ser obrigatoriamente de um Engenheiro Civil habilitado</strong>, 
              com a devida emissão de ART (Anotação de Responsabilidade Técnica). Os resultados aqui apresentados não substituem o projeto executivo detalhado e as verificações completas exigidas pela NBR 6122.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
