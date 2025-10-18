'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Empresa, CreateEmpresaRequest } from '@/lib/services/empresa.service';

interface EmpresaFormProps {
  empresa?: Empresa;
  onSubmit: (data: CreateEmpresaRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmpresaForm({ empresa, onSubmit, onCancel, isLoading }: EmpresaFormProps) {
  const [formData, setFormData] = useState<CreateEmpresaRequest>({
    nome: empresa?.nome || '',
    razao_social: empresa?.razao_social || '',
    plano: empresa?.plano || 'basic',
    status: empresa?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nome">Nome da Empresa</FieldLabel>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="razao_social">Razão Social</FieldLabel>
          <Input
            id="razao_social"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="plano">Plano</FieldLabel>
          <Select
            value={formData.plano}
            onValueChange={(value) => setFormData({ ...formData, plano: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : empresa ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

