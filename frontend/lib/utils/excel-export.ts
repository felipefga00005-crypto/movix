import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: any) => string;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  columns: ExportColumn[];
}

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  columns: ExportColumn[];
}

/**
 * Exporta dados para Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) {
  const {
    filename = 'export',
    sheetName = 'Dados',
    columns
  } = options;

  // Preparar os dados para exportação
  const exportData = data.map(item => {
    const row: Record<string, any> = {};
    
    columns.forEach(column => {
      const value = getNestedValue(item, column.key);
      row[column.label] = column.formatter ? column.formatter(value) : value || '';
    });
    
    return row;
  });

  // Criar workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Configurar largura das colunas
  const columnWidths = columns.map(column => ({
    wch: Math.max(column.label.length, 15) // Mínimo 15 caracteres
  }));
  worksheet['!cols'] = columnWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Gerar nome do arquivo com timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Obtém valor aninhado de um objeto usando notação de ponto
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Formatadores comuns para diferentes tipos de dados
 */
export const formatters = {
  date: (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR');
  },
  
  datetime: (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString('pt-BR');
  },
  
  currency: (value: any) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  },
  
  number: (value: any) => {
    if (!value || isNaN(value)) return '0';
    return new Intl.NumberFormat('pt-BR').format(Number(value));
  },
  
  phone: (value: any) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return value;
  },
  
  cpfCnpj: (value: any) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
      // CPF
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 14) {
      // CNPJ
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return value;
  },
  
  boolean: (value: any) => {
    if (value === true) return 'Sim';
    if (value === false) return 'Não';
    return '';
  }
};

/**
 * Exporta dados para PDF
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  options: PDFExportOptions
) {
  const {
    filename = 'export',
    title = 'Relatório',
    columns
  } = options;

  // Criar novo documento PDF
  const doc = new jsPDF();

  // Configurar título
  doc.setFontSize(16);
  doc.text(title, 14, 22);

  // Preparar dados para a tabela
  const tableColumns = columns.map(col => col.label);
  const tableRows = data.map(item => {
    return columns.map(column => {
      const value = getNestedValue(item, column.key);
      return column.formatter ? column.formatter(value) : (value || '').toString();
    });
  });

  // Verificar se autoTable está disponível
  if (typeof (doc as any).autoTable === 'function') {
    // Adicionar tabela ao PDF
    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 30, right: 14, bottom: 20, left: 14 },
    });
  } else {
    // Fallback: adicionar dados como texto simples
    let yPosition = 40;
    const lineHeight = 6;

    // Adicionar cabeçalhos
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    let xPosition = 14;
    tableColumns.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += 40; // Espaçamento entre colunas
    });

    yPosition += lineHeight * 2;
    doc.setFont(undefined, 'normal');

    // Adicionar dados
    tableRows.forEach(row => {
      xPosition = 14;
      row.forEach((cell, index) => {
        doc.text(cell.toString().substring(0, 20), xPosition, yPosition); // Limitar texto
        xPosition += 40;
      });
      yPosition += lineHeight;

      // Nova página se necessário
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }

  // Gerar nome do arquivo com timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.pdf`;

  // Fazer download do arquivo
  doc.save(finalFilename);
}
