import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Calcula larguras otimizadas para as colunas baseado no conteúdo (paisagem)
 */
function calculateColumnWidths(columns: ExportColumn[], availableWidth: number): Record<number, any> {
  const columnStyles: Record<number, any> = {};

  // Larguras base otimizadas para paisagem (apenas colunas relevantes para relatórios)
  const columnWidthMap: Record<string, number> = {
    'razao_social': 50,
    'nome': 50,
    'cnpj_cpf': 32,
    'cpf': 28,
    'email': 38,
    'celular': 25,
    'telefone_fixo': 25,
    'fone': 25,
    'municipio': 28,
    'cidade': 28,
    'uf': 10,
    'estado': 10,
    'logradouro': 35,
    'endereco': 35,
    'numero': 12,
    'bairro': 22,
    'cep': 20,
    'complemento': 22,
    'status': 18,
    'tipo_contato': 20,
    'consumidor_final': 18,
    'limite_credito': 22,
    'ie': 22,
    'ie_rg': 22,
    'im': 20,
    'inscricao_municipal': 20,
    'data_nascimento': 20,
  };

  // Calcular largura total necessária
  let totalRequiredWidth = 0;
  columns.forEach((column) => {
    const baseWidth = columnWidthMap[column.key] || 20;
    totalRequiredWidth += baseWidth;
  });

  // Sempre aplicar fator de escala para usar todo o espaço disponível
  const scaleFactor = availableWidth / totalRequiredWidth;

  // Aplicar larguras calculadas
  columns.forEach((column, index) => {
    const baseWidth = columnWidthMap[column.key] || 20;
    const scaledWidth = Math.max(baseWidth * scaleFactor, 8); // Mínimo 8mm

    columnStyles[index] = {
      cellWidth: scaledWidth,
      overflow: 'linebreak',
      cellPadding: 1.5,
      fontSize: 6, // Fonte menor para caber mais conteúdo
    };

    // Configurações específicas por tipo de coluna
    if (['id', 'numero', 'uf', 'estado'].includes(column.key)) {
      columnStyles[index].halign = 'center';
    } else if (['limite_credito', 'saldo_inicial'].includes(column.key)) {
      columnStyles[index].halign = 'right';
    }

    // Fonte ainda menor para colunas com muito texto
    if (['razao_social', 'nome', 'email', 'logradouro', 'endereco'].includes(column.key)) {
      columnStyles[index].fontSize = 5.5;
    }
  });

  return columnStyles;
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
 * Exporta dados para PDF com layout profissional
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  options: PDFExportOptions
) {
  const {
    filename = 'relatorio_clientes',
    title = 'Relatório de Clientes',
    columns
  } = options;

  // Criar novo documento PDF em orientação paisagem
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações do documento (paisagem: width > height)
  const pageWidth = doc.internal.pageSize.width;  // ~297mm
  const pageHeight = doc.internal.pageSize.height; // ~210mm
  const margin = 15;

  // Função para adicionar header em cada página (otimizado para paisagem)
  const addHeader = () => {
    // Linha superior
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(2);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Logo/Nome da empresa (lado esquerdo)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(66, 139, 202);
    doc.text('MOVIX SYSTEM', margin, 20);

    // Data e hora (lado direito)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');
    doc.text(`Gerado em: ${dateStr} às ${timeStr}`, pageWidth - margin - 50, 20);

    // Título do relatório
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 32);

    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, 36, pageWidth - margin, 36);
  };

  // Função para adicionar footer em cada página (otimizado para paisagem)
  const addFooter = (pageNum: number, totalPages: number) => {
    // Linha superior do footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    // Informações do footer
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    // Lado esquerdo - informações da empresa
    doc.text('MOVIX SYSTEM - Sistema de Gestão', margin, pageHeight - 12);
    doc.text('www.movixsystem.com | contato@movixsystem.com', margin, pageHeight - 8);

    // Centro - total de registros
    const totalText = `Total de registros: ${data.length}`;
    const totalTextWidth = doc.getTextWidth(totalText);
    doc.text(totalText, (pageWidth - totalTextWidth) / 2, pageHeight - 12);

    // Lado direito - numeração de páginas
    const pageText = `Página ${pageNum} de ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 12);
  };

  // Preparar dados para a tabela
  // Abreviar nomes de colunas de forma inteligente para evitar quebra de linha no header
  const headerAbbreviations: Record<string, string> = {
    'Razão Social/Nome': 'Razão Social',
    'CNPJ/CPF': 'CNPJ/CPF',
    'Email': 'Email',
    'Celular': 'Celular',
    'Telefone Fixo': 'Tel. Fixo',
    'Cidade': 'Cidade',
    'Estado': 'UF',
    'Endereço': 'Endereço',
    'Número': 'Nº',
    'Bairro': 'Bairro',
    'CEP': 'CEP',
    'Complemento': 'Compl.',
    'Status': 'Status',
    'Tipo de Contato': 'Tipo',
    'Consumidor Final': 'Cons. Final',
    'Limite de Crédito': 'Limite',
    'Inscrição Estadual': 'IE',
    'Inscrição Municipal': 'IM',
    'Data de Nascimento': 'Dt. Nasc.',
  };

  const tableColumns = columns.map(col => {
    const abbreviated = headerAbbreviations[col.label];
    if (abbreviated) {
      return abbreviated;
    }

    // Se não tem abreviação específica, truncar se muito longo
    const maxHeaderLength = 12;
    return col.label.length > maxHeaderLength
      ? col.label.substring(0, maxHeaderLength - 2) + '..'
      : col.label;
  });

  const tableRows = data.map(item => {
    return columns.map(column => {
      const value = getNestedValue(item, column.key);
      return column.formatter ? column.formatter(value) : (value || '').toString();
    });
  });

  // Adicionar header na primeira página
  addHeader();

  // Calcular larguras das colunas dinamicamente
  const availableWidth = pageWidth - (2 * margin);
  const columnWidths = calculateColumnWidths(columns, availableWidth);

  try {

    // Configurar autoTable otimizado para paisagem
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 6,
        cellPadding: 1,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.1,
        minCellHeight: 4,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
        cellPadding: 2,
        minCellHeight: 8,
        overflow: 'hidden', // Não quebrar linha no cabeçalho
        cellWidth: 'wrap',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: {
        top: 40,
        right: margin,
        bottom: 20,
        left: margin
      },
      tableWidth: 'wrap', // Usar toda a largura disponível
      theme: 'grid',
      columnStyles: columnWidths,
      // Hooks para adicionar header/footer em cada página
      didDrawPage: (data) => {
        // Só adiciona header/footer se não for a primeira página
        if (data.pageNumber > 1) {
          addHeader();
        }
        addFooter(data.pageNumber, data.pageCount || 1);
      },
      // Configurações de quebra de página
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    });

  } catch (error) {
    console.error('Erro ao usar autoTable:', error);

    // Fallback: criar tabela manual simples
    let yPosition = 60;
    const lineHeight = 6;
    let pageNum = 1;
    const colWidth = (availableWidth - 20) / Math.min(columns.length, 6); // Máximo 6 colunas por página

    // Informações resumo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de registros: ${data.length}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Selecionar colunas mais importantes para o fallback
    const priorityColumns = columns.filter(col =>
      ['razao_social', 'nome', 'cnpj_cpf', 'cpf', 'email', 'celular', 'municipio', 'status'].includes(col.key)
    ).slice(0, 6);

    // Cabeçalhos da tabela
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);

    priorityColumns.forEach((column, index) => {
      const xPos = margin + (index * colWidth);
      doc.rect(xPos, yPosition, colWidth, 8, 'F');
      doc.text(column.label.substring(0, 15), xPos + 2, yPosition + 6);
    });

    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    // Dados
    data.forEach((item, rowIndex) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 60) {
        addFooter(pageNum, Math.ceil(data.length / 25));
        doc.addPage();
        pageNum++;
        addHeader();
        yPosition = 60;

        // Repetir cabeçalhos
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setFillColor(66, 139, 202);
        doc.setTextColor(255, 255, 255);

        priorityColumns.forEach((column, index) => {
          const xPos = margin + (index * colWidth);
          doc.rect(xPos, yPosition, colWidth, 8, 'F');
          doc.text(column.label.substring(0, 15), xPos + 2, yPosition + 6);
        });

        yPosition += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
      }

      // Cor alternada para linhas
      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPosition, availableWidth - 20, lineHeight + 2, 'F');
      }

      // Dados da linha
      priorityColumns.forEach((column, colIndex) => {
        const value = getNestedValue(item, column.key);
        const displayValue = column.formatter ? column.formatter(value) : (value || '').toString();
        const xPos = margin + (colIndex * colWidth);

        // Truncar texto se muito longo
        const maxLength = Math.floor(colWidth / 2.5);
        const truncatedValue = displayValue.length > maxLength
          ? displayValue.substring(0, maxLength - 3) + '...'
          : displayValue;

        doc.text(truncatedValue, xPos + 2, yPosition + 5);
      });

      yPosition += lineHeight + 2;
    });

    // Footer da última página
    addFooter(pageNum, pageNum);
  }

  // Gerar nome do arquivo com timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.pdf`;

  // Fazer download do arquivo
  doc.save(finalFilename);
}
