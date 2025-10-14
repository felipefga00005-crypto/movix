'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Download } from 'lucide-react';
import { exportToExcel, type ExportColumn } from '@/lib/utils/excel-export';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  availableColumns: ExportColumn[];
  defaultFilename?: string;
  title?: string;
  description?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  data,
  availableColumns,
  defaultFilename = 'export',
  title = 'Exportar Dados',
  description = 'Selecione as colunas que deseja incluir na exportação.',
}: ExportDialogProps) {
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>(
    availableColumns.map(col => col.key)
  );
  const [filename, setFilename] = React.useState(defaultFilename);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const handleSelectNone = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      return;
    }

    setIsExporting(true);
    
    try {
      const columnsToExport = availableColumns.filter(col => 
        selectedColumns.includes(col.key)
      );

      exportToExcel(data, {
        filename: filename || defaultFilename,
        sheetName: 'Dados',
        columns: columnsToExport,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do arquivo */}
          <div className="space-y-2">
            <Label htmlFor="filename">Nome do arquivo</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Digite o nome do arquivo"
            />
          </div>

          {/* Seleção de colunas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Colunas para exportar</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Todas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectNone}
                >
                  Nenhuma
                </Button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
              {availableColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <Label
                    htmlFor={column.key}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedColumns.length} de {availableColumns.length} colunas selecionadas
            </div>
          </div>

          {/* Informações sobre os dados */}
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-sm">
              <div className="font-medium">Resumo da exportação:</div>
              <div className="text-muted-foreground mt-1">
                • {data.length} registro{data.length !== 1 ? 's' : ''} para exportar
              </div>
              <div className="text-muted-foreground">
                • {selectedColumns.length} coluna{selectedColumns.length !== 1 ? 's' : ''} selecionada{selectedColumns.length !== 1 ? 's' : ''}
              </div>
              <div className="text-muted-foreground">
                • Formato: Excel (.xlsx)
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={selectedColumns.length === 0 || isExporting}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
