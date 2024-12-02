import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generatePDFReport(documentName, analyses) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add title
  doc.setFontSize(20);
  doc.text('Legal Document Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add document name
  doc.setFontSize(14);
  doc.text(`Document: ${documentName}`, 20, 35);
  doc.text(`Analysis Date: ${new Date().toLocaleDateString()}`, 20, 45);

  // Add summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 20, 60);
  
  // Calculate totals
  const totals = {
    critical: 0,
    warning: 0,
    info: 0
  };

  Object.values(analyses).forEach(analysis => {
    analysis.findings.forEach(finding => {
      totals[finding.category]++;
    });
  });

  // Add summary table
  doc.autoTable({
    startY: 70,
    head: [['Risk Level', 'Count']],
    body: [
      ['Critical Issues', totals.critical],
      ['Warnings', totals.warning],
      ['Information Notes', totals.info]
    ],
    theme: 'striped',
    headStyles: { fillColor: [200, 0, 0] },
    margin: { left: 20 }
  });

  // Add detailed findings
  let yPos = doc.autoTable.previous.finalY + 20;
  
  // For each page
  Object.entries(analyses).forEach(([pageNum, analysis]) => {
    // Add page header
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(`Page ${pageNum} Analysis`, 20, yPos);
    yPos += 10;

    // Group findings by category
    const groupedFindings = {
      critical: analysis.findings.filter(f => f.category === 'critical'),
      warning: analysis.findings.filter(f => f.category === 'warning'),
      info: analysis.findings.filter(f => f.category === 'info')
    };

    // Add findings tables
    const categories = {
      critical: { name: 'Critical Issues', color: [220, 0, 0] },
      warning: { name: 'Warnings', color: [220, 160, 0] },
      info: { name: 'Information Notes', color: [0, 100, 200] }
    };

    Object.entries(categories).forEach(([category, settings]) => {
      const findings = groupedFindings[category];
      if (findings.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [[settings.name]],
          body: findings.map(f => [f.text]),
          theme: 'striped',
          headStyles: { fillColor: settings.color },
          margin: { left: 20 },
          columnStyles: { 0: { cellWidth: 170 } }
        });
        yPos = doc.autoTable.previous.finalY + 10;
      }
    });
  });

  return doc;
}
