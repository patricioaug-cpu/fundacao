/**
 * Engine de Cálculo - Fundações (NBR 6122:2022)
 * Projeto e Execução de Fundações
 */

export type FoundationType = 'Sapata isolada' | 'Bloco' | 'Radier';

export interface CalculationInput {
  soilType: string;
  nspt: number;
  structuralType: string;
  loadKN: number;
  loadType: 'Concentrada' | 'Momento Fletor' | 'Carga Excêntrica';
  pillarWidth: number;
  pillarLength: number;
  waterTableDepth: number;
  isEccentric?: boolean;
  isDistributedLoad?: boolean;
  safetyFactor?: number;
  concreteStrength?: number;
  steelStrength?: number;
  stabilityCheck?: boolean;
}

export interface CalculationResult {
  foundationType: FoundationType;
  allowablePressureMPa: number;
  requiredAreaM2: number;
  dimensionL: number;
  thicknessH: number;
  settlementRisk: 'ALTO' | 'MÉDIO' | 'BAIXO';
  punchingAlert: boolean;
  eccentricityAlert: boolean;
  justification: string;
  settlementAnalysis: string;
  calculationMemory: string[];
  standards: string[];
  diagramData?: {
    pillarWidth: number;
    pillarLength: number;
    baseL: number;
    thicknessH: number;
  };
}

export function calculateFoundation(input: CalculationInput): CalculationResult {
  const { 
    nspt, 
    loadKN, 
    loadType,
    pillarWidth, 
    pillarLength, 
    isDistributedLoad, 
    waterTableDepth,
    safetyFactor = 3,
    concreteStrength = 25,
    steelStrength = 500
  } = input;

  // Determination of eccentricity based on load type
  const isEccentric = input.isEccentric || loadType === 'Momento Fletor' || loadType === 'Carga Excêntrica';

  // 1. Pressão admissível (simplificada conforme prática usual baseada na NBR 6122)
  // σ_adm = NSPT / 50 (kgf/cm²) -> σ_adm = NSPT * 0.02 MPa
  // Ajuste fino baseado no fator de segurança (padrão 3)
  let baseAllowablePressureMPa = nspt * 0.02;
  
  // Redução de capacidade se o lençol freático for muito raso (solo submerso)
  if (waterTableDepth <= 1.5) {
    baseAllowablePressureMPa *= 0.8; // Redução de 20% por submersão/instabilidade
  }

  const allowablePressureMPa = baseAllowablePressureMPa * (3 / safetyFactor);
  const allowablePressureKNm2 = allowablePressureMPa * 1000;

  // 2. Seleção do tipo de fundação (Critérios NBR 6122 e Condições de Contorno)
  let foundationType: FoundationType = 'Sapata isolada';
  
  if (isEccentric) {
    foundationType = 'Bloco';
  } else if ((nspt < 5 && isDistributedLoad) || (waterTableDepth <= 1.2 && nspt < 12)) {
    // Sugestão de Radier se solo for fraco e carga distribuída OU se o lençol freático for extremamente raso
    foundationType = 'Radier';
  }

  // 3. Pré-dimensionamento (Equilíbrio Estático)
  // Área A = N / σ_adm
  const requiredAreaM2 = loadKN / allowablePressureKNm2;
  
  // Para sapata quadrada: L = √A
  const dimensionL = Math.sqrt(requiredAreaM2);
  
  // Espessura h (Critério de Rigidez NBR 6122)
  // h >= (L - a) / 3
  const a_max = Math.max(pillarWidth, pillarLength);
  const thicknessH = Math.max((dimensionL - a_max) / 3, 0.4);

  // 4. Verificações Qualitativas (NBR 6122)
  let settlementRisk: 'ALTO' | 'MÉDIO' | 'BAIXO' = 'BAIXO';
  if (nspt < 8) {
    settlementRisk = 'ALTO';
  } else if (nspt < 15) {
    settlementRisk = 'MÉDIO';
  }

  // Verificação simplificada de punção (Tensão de cisalhamento)
  const punchingAlert = (loadKN / requiredAreaM2) > (0.85 * allowablePressureKNm2);
  
  const eccentricityAlert = !!isEccentric;

  // 5. Análise Detalhada de Recalque
  let settlementAnalysis = "";
  const pressureRatio = (loadKN / requiredAreaM2) / 1000; // MPa
  const nsptValue = nspt;
  
  if (nsptValue < 8) {
    settlementAnalysis = `ANÁLISE CRÍTICA: O solo apresenta resistência muito baixa (NSPT=${nsptValue}), caracterizando uma camada altamente compressível. A carga de ${loadKN}kN aplicada em uma área de ${requiredAreaM2.toFixed(2)}m² gera uma tensão de ${pressureRatio.toFixed(3)} MPa. ${waterTableDepth <= 2 ? `O lençol freático raso (${waterTableDepth}m) agrava o risco de recalques por adensamento.` : ''} Há risco iminente de recalques diferenciais excessivos. RECOMENDAÇÃO: Realizar ensaios de adensamento e considerar fundações profundas ou melhoria de solo.`;
  } else if (nsptValue < 15) {
    settlementAnalysis = `ANÁLISE MODERADA: Solo de resistência média. A tensão de contato de ${pressureRatio.toFixed(3)} MPa é compatível, porém o nível do lençol freático em ${waterTableDepth}m ${waterTableDepth <= 1.5 ? 'é crítico e' : ''} pode influenciar a velocidade dos recalques. Para estruturas ${input.structuralType.toLowerCase()}, os recalques totais estimados podem estar próximos aos limites de serviço (25mm). RECOMENDAÇÃO: Monitorar recalques diferenciais e garantir a rigidez da sapata (h=${thicknessH.toFixed(2)}m).`;
  } else {
    settlementAnalysis = `ANÁLISE DE ESTABILIDADE: Solo com excelente capacidade de suporte (NSPT=${nsptValue}). A tensão aplicada de ${pressureRatio.toFixed(3)} MPa representa uma utilização eficiente da capacidade portante (${input.soilType}). ${waterTableDepth <= 1 ? `Atenção ao lençol freático muito próximo à base (${waterTableDepth}m) para execução.` : 'O risco de recalques significativos é baixo.'} Esperam-se apenas recalques imediatos de pequena magnitude.`;
  }

  // 6. Justificativa Técnica
  let justification = `Cálculo realizado conforme NBR 6122:2022. Carga do tipo ${loadType}. Recomenda-se ${foundationType} para carga de ${loadKN}kN. `;
  if (loadType !== 'Concentrada') justification += "A presença de momentos ou excentricidade exige verificação rigorosa da estabilidade ao tombamento. ";
  if (settlementRisk === 'ALTO') justification += "Risco de recalque excessivo detectado (NSPT < 8). ";
  if (waterTableDepth <= 1.5 && foundationType === 'Radier') {
    justification += "Sugestão de Radier devido ao nível do lençol freático raso (≤ 1.5m), dificultando escavações isoladas. ";
  }
  
  const lb_ref = (0.016 * (steelStrength / 1.15) / (2.25 * (0.15 * Math.pow(concreteStrength, 2/3))));
  if ((thicknessH - 0.05) < lb_ref * 0.7) {
    justification += "Atenção: Altura h pode ser insuficiente para o engaste total do pilar (ancoragem). ";
  }
  
  const calculationMemory = [
    `Norma: NBR 6122:2022 - Projeto e Execução de Fundações`,
    `Tensão Admissível Estimada (σ_adm):`,
    `  - Baseada em NSPT Médio: ${nspt}`,
    `  - σ_base = (NSPT / 50) = ${baseAllowablePressureMPa.toFixed(3)} MPa`,
    `  - Fator de Segurança Adotado (FS): ${safetyFactor}`,
    `  - Nível do Lençol Freático: ${waterTableDepth}m ${waterTableDepth <= 1.5 ? '(Redução de 20% na σ_adm aplicada)' : '(Sem influência direta na σ_adm)'}`,
    `  - σ_adm = σ_base * (3 / FS) = ${allowablePressureMPa.toFixed(3)} MPa (${(allowablePressureMPa * 10).toFixed(1)} kgf/cm²)`,
    `Dimensionamento Geométrico:`,
    `  - Carga do Pilar (N): ${loadKN} kN`,
    `  - Área Necessária (A) = N / σ_adm = ${loadKN} / ${(allowablePressureMPa * 1000).toFixed(1)} = ${requiredAreaM2.toFixed(3)} m²`,
    `  - Lado da Sapata Quadrada (L) = √A = √${requiredAreaM2.toFixed(3)} = ${dimensionL.toFixed(2)} m`,
    `  - Verificação de Rigidez: h ≥ (L - a_max)/3 = (${dimensionL.toFixed(2)} - ${a_max})/3`,
    `  - Espessura Adotada (h): ${thicknessH.toFixed(2)} m (mínimo normativo de 0.40m)`,
    `Materiais:`,
    `  - Concreto (fck): ${concreteStrength} MPa`,
    `  - Aço (fyk): ${steelStrength} MPa`,
    `Verificações:`,
    `  - Risco de Recalque: ${settlementRisk} (NSPT=${nspt})`,
    `  - Alerta de Punção: ${punchingAlert ? 'Detectado (Requer armadura de punção ou aumento de h)' : 'Não detectado'}`,
    `  - Excentricidade: ${isEccentric ? 'Carga Excêntrica Detectada' : 'Carga Centrada'}`,
    ...(input.stabilityCheck ? [`  - Verificação de Estabilidade ao Tombamento: SOLICITADO (Requer análise de momentos e pesos próprios)`] : []),
    `Verificação de Engaste (NBR 6122 / NBR 6118):`,
    `  - Altura Útil Estimada (d) ≈ h - 0.05m = ${(thicknessH - 0.05).toFixed(2)}m`,
    `  - Comprimento de Ancoragem Básico (lb) Estimado para CA-50/C${concreteStrength}: ${(0.016 * (steelStrength / 1.15) / (2.25 * (0.15 * Math.pow(concreteStrength, 2/3)))).toFixed(2)}m (ref. Ø16mm)`,
    `  - Condição de Engaste: ${(thicknessH - 0.05) >= (0.016 * (steelStrength / 1.15) / (2.25 * (0.15 * Math.pow(concreteStrength, 2/3)))) * 0.7 ? 'SATISFATÓRIO (Altura h suficiente para transpasse/ancoragem)' : 'ATENÇÃO (Altura h próxima ao limite de ancoragem, verificar Ø das barras)'}`,
  ];

  return {
    foundationType,
    allowablePressureMPa,
    requiredAreaM2,
    dimensionL,
    thicknessH,
    settlementRisk,
    punchingAlert,
    eccentricityAlert,
    justification,
    settlementAnalysis,
    calculationMemory,
    standards: ['NBR 6122:2022'],
    diagramData: {
      pillarWidth,
      pillarLength,
      baseL: dimensionL,
      thicknessH
    }
  };
}
