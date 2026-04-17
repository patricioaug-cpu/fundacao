import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalculationInput } from '@/src/calculations/engine';

interface Props {
  onCalculate: (data: CalculationInput) => void;
}

export default function CalculationForm({ onCalculate }: Props) {
  const { register, handleSubmit, setValue } = useForm<CalculationInput>({
    defaultValues: {
      soilType: 'Areia Compacta',
      nspt: 10,
      structuralType: 'Residencial',
      loadKN: 500,
      loadType: 'Concentrada',
      pillarWidth: 0.2,
      pillarLength: 0.4,
      waterTableDepth: 5,
      isEccentric: false,
      isDistributedLoad: false,
      safetyFactor: 3,
      concreteStrength: 25,
      steelStrength: 500,
      stabilityCheck: false
    }
  });

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-green-500 font-mono">PARÂMETROS DE ENTRADA</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onCalculate)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Solo (Simplificado)</Label>
              <Select onValueChange={(v) => setValue('soilType', v)} defaultValue="Areia Compacta">
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecione o solo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="Areia Fofa">Areia Fofa</SelectItem>
                  <SelectItem value="Areia Compacta">Areia Compacta</SelectItem>
                  <SelectItem value="Argila Mole">Argila Mole</SelectItem>
                  <SelectItem value="Argila Rija">Argila Rija</SelectItem>
                  <SelectItem value="Silte Arenoso">Silte Arenoso</SelectItem>
                  <SelectItem value="Rocha Alterada">Rocha Alterada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Estrutura</Label>
              <Select onValueChange={(v) => setValue('structuralType', v)} defaultValue="Residencial">
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="Residencial">Residencial</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número NSPT (Médio)</Label>
              <Input 
                type="number" 
                {...register('nspt', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Carga do Pilar (kN)</Label>
              <Input 
                type="number" 
                {...register('loadKN', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Carga</Label>
              <Select onValueChange={(v: any) => setValue('loadType', v)} defaultValue="Concentrada">
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecione a carga" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="Concentrada">Concentrada</SelectItem>
                  <SelectItem value="Momento Fletor">Momento Fletor</SelectItem>
                  <SelectItem value="Carga Excêntrica">Carga Excêntrica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nível do Lençol Freático (m)</Label>
              <Input 
                type="number" 
                {...register('waterTableDepth', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Largura do Pilar (m)</Label>
              <Input 
                type="number" 
                step="0.01"
                {...register('pillarWidth', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Comprimento do Pilar (m)</Label>
              <Input 
                type="number" 
                step="0.01"
                {...register('pillarLength', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Fator de Segurança (FS)</Label>
              <Input 
                type="number" 
                step="0.1"
                {...register('safetyFactor', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Resistência Concreto (fck MPa)</Label>
              <Input 
                type="number" 
                {...register('concreteStrength', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label>Resistência Aço (fyk MPa)</Label>
              <Input 
                type="number" 
                {...register('steelStrength', { valueAsNumber: true })} 
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" {...register('isEccentric')} id="eccentric" className="w-4 h-4 accent-green-600" />
              <Label htmlFor="eccentric">Pilar Excêntrico</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" {...register('isDistributedLoad')} id="distributed" className="w-4 h-4 accent-green-600" />
              <Label htmlFor="distributed">Cargas Distribuídas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" {...register('stabilityCheck')} id="stability" className="w-4 h-4 accent-green-600" />
              <Label htmlFor="stability">Verificar Tombamento</Label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-6 mt-4">
            CALCULAR PRÉ-DIMENSIONAMENTO
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
