import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, CalculationInput } from '@/src/calculations/engine';
import { toast } from 'sonner';

export const generatePDF = (
  input: CalculationInput, 
  result: CalculationResult, 
  diagramImg?: string, 
  chartImg?: string
) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20; // Slightly smaller margin for more space
    const contentWidth = pageWidth - (margin * 2);

    // Header
    doc.setFillColor(22, 101, 52); // Green-700
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('FundAção', margin, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório Técnico de Pré-Dimensionamento de Fundações', margin, 27);
    doc.text(`Norma de Referência: NBR 6122:2022 | Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, 32);

    // Section 1: Input Data
    let currentY = 50;
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. DADOS DE ENTRADA', margin, currentY);
    currentY += 5;
    
    const inputData = [
      ['Tipo de Solo', input.soilType, 'Carga do Pilar', `${input.loadKN} kN`],
      ['NSPT Médio', input.nspt.toString(), 'Tipo de Carga', input.loadType],
      ['Seção do Pilar', `${input.pillarWidth}m x ${input.pillarLength}m`, 'Fator de Segurança', input.safetyFactor?.toString() || '3.0'],
      ['Lençol Freático', `${input.waterTableDepth} m`, 'Concreto (fck)', `${input.concreteStrength || 25} MPa`],
      ['Excêntrico', input.isEccentric ? 'Sim' : 'Não', 'Tipo Estrutura', input.structuralType],
    ];

    autoTable(doc, {
      startY: currentY,
      body: inputData,
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [100, 100, 100] }, 2: { fontStyle: 'bold', textColor: [100, 100, 100] } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Section 2: Results
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin + 10;
    }
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text('2. RESULTADOS DO DIMENSIONAMENTO', margin, currentY);
    currentY += 5;

    const resultData = [
      ['Fundação Recomendada', result.foundationType],
      ['Tensão Admissível (σ_adm)', `${result.allowablePressureMPa.toFixed(3)} MPa`],
      ['Área da Base Necessária', `${result.requiredAreaM2.toFixed(3)} m²`],
      ['Lado da Sapata (L)', `${result.dimensionL.toFixed(2)} m`],
      ['Espessura da Sapata (h)', `${result.thicknessH.toFixed(2)} m`],
      ['Risco de Recalque', result.settlementRisk],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Item', 'Resultado']],
      body: resultData,
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      theme: 'striped',
      headStyles: { fillColor: [22, 101, 52], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Section 3: Visual Analysis (Images)
    if (diagramImg || chartImg) {
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = margin + 10;
      }
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text('3. ANÁLISE VISUAL', margin, currentY);
      currentY += 5;

      const imgWidth = (contentWidth - 10) / 2;
      const imgHeight = 60;

      if (diagramImg) {
        doc.addImage(diagramImg, 'PNG', margin, currentY, imgWidth, imgHeight);
      }
      if (chartImg) {
        doc.addImage(chartImg, 'PNG', margin + imgWidth + 10, currentY, imgWidth, imgHeight);
      }
      currentY += imgHeight + 10;
    }

    // Section 4: Settlement Analysis
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin + 10;
    }
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text('4. ANÁLISE DETALHADA DE RECALQUE', margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      body: [[result.settlementAnalysis]],
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      theme: 'plain',
      styles: { 
        fontSize: 9, 
        font: 'helvetica', 
        cellPadding: { top: 2, bottom: 2, left: 0, right: 0 },
        textColor: [60, 60, 60],
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: contentWidth }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Section 5: Calculation Memory (Using Table for better layout)
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin + 10;
    }
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text('5. MEMÓRIA DE CÁLCULO', margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      body: result.calculationMemory.map(line => [line]),
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      theme: 'striped',
      styles: { 
        fontSize: 6.5, 
        font: 'courier', 
        cellPadding: 1,
        minCellHeight: 3,
        valign: 'middle',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: contentWidth }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Justification
    autoTable(doc, {
      startY: currentY,
      body: [[`Justificativa Técnica: ${result.justification}`]],
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      theme: 'plain',
      styles: { 
        fontSize: 9, 
        font: 'helvetica', 
        fontStyle: 'italic',
        cellPadding: { top: 4, bottom: 4, left: 0, right: 0 },
        textColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: contentWidth }
      }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      const footerY = pageHeight - 10;
      doc.text('Este relatório é uma ferramenta de apoio técnico baseado na NBR 6122:2022.', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
    }

    doc.save(`Relatorio_FundAcao_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Erro ao gerar PDF. Tente novamente.");
  }
};
