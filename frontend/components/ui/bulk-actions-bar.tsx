'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckSquare,
  UserCheck,
  UserX,
  Archive,
  Download,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  description?: string;
  onClick: () => void;
}

interface BulkActionsBarProps {
  selectedCount: number;
  itemName: string; // e.g., "cliente", "produto"
  onClearSelection: () => void;
  actions: BulkAction[];
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  itemName,
  onClearSelection,
  actions,
  className = '',
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const statusActions = actions.filter(action => action.id.startsWith('status-'));
  const otherActions = actions.filter(action => !action.id.startsWith('status-'));

  return (
    <div className={`flex items-center justify-between bg-card border border-border px-4 py-3 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-200 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-md">
          <CheckSquare className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} {itemName}{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-muted-foreground">
            Escolha uma ação para aplicar aos itens selecionados
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Ações de Status (se existirem) */}
        {statusActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {statusActions.map((action) => (
                <DropdownMenuItem key={action.id} onClick={action.onClick} className="gap-2">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-sm ${
                    action.id === 'status-active' ? 'bg-green-100' :
                    action.id === 'status-inactive' ? 'bg-gray-100' :
                    action.id === 'status-blocked' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <action.icon className={`h-3 w-3 ${
                      action.id === 'status-active' ? 'text-green-600' :
                      action.id === 'status-inactive' ? 'text-gray-600' :
                      action.id === 'status-blocked' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{action.label}</span>
                    {action.description && (
                      <span className="text-xs text-muted-foreground">{action.description}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Outras Ações */}
        {otherActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant === 'destructive' ? 'outline' : 'outline'}
            size="sm"
            onClick={action.onClick}
            className={`h-9 gap-2 ${
              action.variant === 'destructive' 
                ? 'text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20' 
                : ''
            }`}
          >
            <action.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        ))}

        {/* Limpar Seleção */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-9 w-9 p-0"
          title="Limpar seleção"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Hook para facilitar o uso
export function useBulkActions() {
  const [selectedItems, setSelectedItems] = React.useState<Set<string | number>>(new Set());

  const toggleItem = React.useCallback((id: string | number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = React.useCallback((ids: (string | number)[]) => {
    setSelectedItems(prev => {
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) {
        return new Set();
      } else {
        return new Set(ids);
      }
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = React.useCallback((id: string | number) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  const isAllSelected = React.useCallback((ids: (string | number)[]) => {
    return ids.length > 0 && ids.every(id => selectedItems.has(id));
  }, [selectedItems]);

  const isSomeSelected = React.useCallback((ids: (string | number)[]) => {
    return ids.some(id => selectedItems.has(id)) && !isAllSelected(ids);
  }, [selectedItems, isAllSelected]);

  return {
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}
