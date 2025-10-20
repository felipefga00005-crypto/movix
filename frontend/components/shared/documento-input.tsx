"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ExternalApiService, type CnpjData } from "@/lib/services/external-api.service"
import { useExternalApis } from "@/hooks/useExternalApis"

interface DocumentoInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string
  onChange: (value: string) => void
  onDataLoaded?: (data: CnpjData) => void
  autoFill?: boolean
  showValidation?: boolean
  tipo?: 'FISICA' | 'JURIDICA' | 'AUTO' // AUTO detecta automaticamente
}

const DocumentoInput = React.forwardRef<HTMLInputElement, DocumentoInputProps>(
  ({ className, value, onChange, onDataLoaded, autoFill = true, showValidation = true, tipo = 'AUTO', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value)
    const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | null>(null)
    const [isValid, setIsValid] = useState(false)
    const { autoFillByCnpj, loading, error, clearError } = useExternalApis()

    // Detecta o tipo de documento baseado na quantidade de dígitos
    const detectDocumentType = (numbers: string): 'CPF' | 'CNPJ' | null => {
      if (tipo === 'FISICA') return 'CPF'
      if (tipo === 'JURIDICA') return 'CNPJ'
      
      // AUTO detection
      if (numbers.length <= 11) return 'CPF'
      if (numbers.length <= 14) return 'CNPJ'
      return null
    }

    // Formata o documento baseado no tipo
    const formatDocument = (input: string): string => {
      const numbers = input.replace(/\D/g, '')
      const detectedType = detectDocumentType(numbers)
      
      if (detectedType === 'CPF') {
        return ExternalApiService.formatCpf(input)
      } else if (detectedType === 'CNPJ') {
        return ExternalApiService.formatCnpj(input)
      }
      
      return numbers
    }

    // Valida o documento baseado no tipo
    const validateDocument = (numbers: string): boolean => {
      const detectedType = detectDocumentType(numbers)
      
      if (detectedType === 'CPF' && numbers.length === 11) {
        return ExternalApiService.validateCpf(numbers)
      } else if (detectedType === 'CNPJ' && numbers.length === 14) {
        return ExternalApiService.validateCnpj(numbers)
      }
      
      return false
    }

    // Atualiza o valor quando prop value muda
    useEffect(() => {
      const formatted = formatDocument(value)
      setDisplayValue(formatted)
      setDocumentType(detectDocumentType(value.replace(/\D/g, '')))
    }, [value, tipo])

    // Valida documento e faz auto-preenchimento para CNPJ
    useEffect(() => {
      const numbers = displayValue.replace(/\D/g, '')
      const detectedType = detectDocumentType(numbers)
      const valid = validateDocument(numbers)
      
      setDocumentType(detectedType)
      setIsValid(valid)

      // Auto-preenchimento apenas para CNPJ válido
      if (valid && detectedType === 'CNPJ' && autoFill && onDataLoaded) {
        const timeoutId = setTimeout(async () => {
          clearError()
          const data = await autoFillByCnpj(numbers)
          if (data?.cnpj) {
            onDataLoaded(data.cnpj)
          }
        }, 500) // Debounce de 500ms

        return () => clearTimeout(timeoutId)
      }
    }, [displayValue, autoFill, onDataLoaded, autoFillByCnpj, clearError, tipo])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const numbers = rawValue.replace(/\D/g, '')
      
      // Limita o tamanho baseado no tipo
      let limitedNumbers = numbers
      if (tipo === 'FISICA') {
        limitedNumbers = numbers.slice(0, 11) // CPF: 11 dígitos
      } else if (tipo === 'JURIDICA') {
        limitedNumbers = numbers.slice(0, 14) // CNPJ: 14 dígitos
      } else {
        limitedNumbers = numbers.slice(0, 14) // AUTO: máximo CNPJ
      }
      
      const formatted = formatDocument(limitedNumbers)
      setDisplayValue(formatted)
      onChange(limitedNumbers)
    }

    const getInputClassName = () => {
      if (!showValidation) return className
      
      if (loading) {
        return cn("border-blue-300 focus-visible:border-blue-500 bg-blue-50", className)
      } else if (error) {
        return cn("border-destructive focus-visible:border-destructive bg-destructive/5", className)
      } else if (isValid) {
        return cn("border-green-500 focus-visible:border-green-500 bg-green-50", className)
      } else if (displayValue.replace(/\D/g, '').length >= (documentType === 'CPF' ? 11 : 14)) {
        return cn("border-destructive focus-visible:border-destructive bg-destructive/5", className)
      }
      
      return className
    }

    const getPlaceholder = (): string => {
      if (tipo === 'FISICA') return "000.000.000-00"
      if (tipo === 'JURIDICA') return "00.000.000/0000-00"
      
      // AUTO: mostra baseado no que está sendo digitado
      if (documentType === 'CPF') return "000.000.000-00"
      if (documentType === 'CNPJ') return "00.000.000/0000-00"
      
      return "CPF ou CNPJ"
    }

    const getMaxLength = (): number => {
      if (tipo === 'FISICA') return 14 // CPF formatado: XXX.XXX.XXX-XX
      if (tipo === 'JURIDICA') return 18 // CNPJ formatado: XX.XXX.XXX/XXXX-XX
      
      // AUTO: máximo CNPJ
      return 18
    }

    const getValidationMessage = (): string => {
      if (!isValid && displayValue.replace(/\D/g, '').length >= (documentType === 'CPF' ? 11 : 14)) {
        return `${documentType} inválido`
      }
      
      if (isValid) {
        if (documentType === 'CNPJ' && loading) {
          return "✓ CNPJ válido - Buscando dados..."
        }
        return `✓ ${documentType} válido`
      }
      
      return ""
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={getInputClassName()}
          disabled={loading}
          maxLength={getMaxLength()}
          placeholder={getPlaceholder()}
          {...props}
        />
        
        {/* Indicador de loading */}
        {loading && showValidation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Indicador de sucesso */}
        {isValid && !loading && !error && showValidation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {/* Indicador de erro */}
        {(error || (!isValid && displayValue.replace(/\D/g, '').length >= (documentType === 'CPF' ? 11 : 14))) && showValidation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        {/* Mensagens de feedback */}
        {showValidation && (
          <>
            {error && (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            )}
            
            {!error && getValidationMessage() && (
              <p className={cn(
                "mt-1 text-sm",
                isValid ? "text-green-600" : "text-destructive"
              )}>
                {getValidationMessage()}
              </p>
            )}
          </>
        )}
      </div>
    )
  }
)

DocumentoInput.displayName = "DocumentoInput"

export { DocumentoInput }
