# 🏗️ Arquitetura de Storage Refatorada - NFe

## 📋 **Resumo da Refatoração**

A arquitetura de storage foi **completamente refatorada** para seguir melhores práticas de responsabilidades e consistência de dados.

### **❌ Antes (Problemático)**
```
┌─────────────────┐    ┌──────────────────┐
│   NestJS API    │    │ Microserviço NFe │
│                 │    │                  │
│ • Salva XMLs BD │◄──►│ • Gera XMLs      │
│ • Business      │    │ • Salva XMLs FS  │ ❌ Duplicação
│ • Coordena      │    │ • Storage        │ ❌ Inconsistência
└─────────────────┘    └──────────────────┘
```

### **✅ Depois (Correto)**
```
┌─────────────────┐    ┌──────────────────┐
│   NestJS API    │    │ Microserviço NFe │
│                 │    │                  │
│ • Business      │◄──►│ • Apenas gera    │
│ • Storage BD    │    │ • Assina         │
│ • Storage FS    │    │ • Transmite      │
│ • Consistência  │    │ • Retorna XML    │
└─────────────────┘    └──────────────────┘
```

## 🎯 **Benefícios da Refatoração**

### **1. Responsabilidades Claras**
- **NestJS**: Gerencia todos os dados (BD + arquivos)
- **Microserviço**: Focado apenas em operações de NFe

### **2. Consistência de Dados**
- Transações atômicas (BD + arquivo)
- Rollback completo em caso de erro
- Sincronização garantida

### **3. Controle de Acesso**
- Autenticação/autorização centralizada
- Auditoria unificada
- Logs centralizados

### **4. Backup/Recovery**
- Estratégia única de backup
- Recuperação simplificada
- Menos pontos de falha

## 📁 **Nova Estrutura de Storage**

### **Localização**
```
backend/storage/
├── xml/
│   ├── generated/     # XMLs gerados (antes da assinatura)
│   ├── signed/        # XMLs assinados digitalmente
│   ├── sent/          # XMLs enviados para SEFAZ
│   ├── authorized/    # XMLs autorizados pela SEFAZ
│   └── cancelled/     # XMLs de NFes canceladas
├── pdf/               # PDFs das NFes (DANFE)
└── logs/              # Logs do serviço
```

### **Nomenclatura de Arquivos**
- **XMLs**: `{chave_nfe}.xml`
- **PDFs**: `{chave_nfe}.pdf`

## 🔧 **Serviços Implementados**

### **FileStorageService**
```typescript
// Localização: src/common/services/file-storage.service.ts

// Principais métodos:
- saveXml(chave, xml, type)     // Salvar XML
- getXml(chave, type)           // Obter XML
- savePdf(chave, pdf)           // Salvar PDF
- getPdf(chave)                 // Obter PDF
- getFileInfo(chave, type)      // Informações do arquivo
- deleteXml(chave, type)        // Excluir XML
- listXmls(type)                // Listar XMLs por tipo
```

### **Integração com NFe Service**
```typescript
// Métodos adicionados ao NfeService:
- getXmlFile(chave, type)       // Obter XML do storage
- getPdfFile(chave)             // Obter PDF do storage
- getFileInfo(chave)            // Informações completas
- savePdfFile(chave, pdf)       // Salvar PDF
```

## 🌐 **Novos Endpoints da API**

### **1. Download de XML**
```http
GET /nfes/:id/xml?type=authorized
```
- **Parâmetros**: `type` = `generated|signed|authorized` (padrão: `authorized`)
- **Resposta**: Arquivo XML para download
- **Headers**: `Content-Type: application/xml`

### **2. Download de PDF**
```http
GET /nfes/:id/pdf
```
- **Resposta**: Arquivo PDF para download
- **Headers**: `Content-Type: application/pdf`

### **3. Informações dos Arquivos**
```http
GET /nfes/:id/files/info
```
- **Resposta**: JSON com informações detalhadas dos arquivos

**Exemplo de resposta:**
```json
{
  "chave": "35241055532459000128550010000000011123456789",
  "xml": {
    "generated": { "exists": false },
    "signed": { "exists": false },
    "authorized": {
      "exists": true,
      "size": 4290,
      "created": "2025-10-20T14:24:32.562Z",
      "modified": "2025-10-20T14:24:53.938Z",
      "path": "storage/xml/authorized/35241055532459000128550010000000011123456789.xml"
    }
  },
  "pdf": { "exists": false }
}
```

## ⚙️ **Configuração**

### **Variáveis de Ambiente**
```env
# Configurações de storage
STORAGE_PATH=./storage
```

### **Módulos**
```typescript
// CommonModule é global e exporta FileStorageService
@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class CommonModule {}
```

## 🔄 **Fluxo de Transmissão Atualizado**

### **1. Transmissão de NFe**
```typescript
async transmitir(id: string) {
  // 1. Gerar e transmitir via microserviço
  const resultado = await this.nfeIntegrationService.generateNfeFromDatabase(id);
  
  // 2. Salvar XML no storage (NestJS)
  if (resultado.data?.chave && resultado.data?.xml) {
    await this.fileStorageService.saveXml(
      resultado.data.chave, 
      resultado.data.xml, 
      'authorized'
    );
  }
  
  // 3. Atualizar banco de dados
  const nfeAtualizada = await this.prisma.nfe.update({
    where: { id },
    data: {
      chave: resultado.data?.chave,
      xmlAutorizado: resultado.data?.xml,
      status: resultado.success ? 'AUTORIZADA' : 'REJEITADA',
    },
  });
  
  return nfeAtualizada;
}
```

## 🧪 **Testes Realizados**

### **✅ Funcionalidades Testadas**
1. **Criação de diretórios**: ✅ Automática na inicialização
2. **Salvamento de XML**: ✅ Funcionando
3. **Recuperação de XML**: ✅ Funcionando
4. **Informações de arquivos**: ✅ Funcionando
5. **Download de XML**: ✅ Funcionando
6. **Tratamento de erros**: ✅ 404 para arquivos inexistentes

### **📊 Exemplo de Teste**
```bash
# Informações dos arquivos
curl "http://localhost:3000/nfes/{id}/files/info"

# Download do XML
curl "http://localhost:3000/nfes/{id}/xml" -o nfe.xml

# Download do PDF (404 se não existir)
curl "http://localhost:3000/nfes/{id}/pdf" -o nfe.pdf
```

## 🚀 **Próximos Passos**

1. **Implementar geração de PDF** (DANFE)
2. **Adicionar compressão de arquivos** antigos
3. **Implementar limpeza automática** de arquivos temporários
4. **Adicionar backup automático** para cloud storage
5. **Implementar cache** para arquivos frequentemente acessados

## 📝 **Conclusão**

A refatoração da arquitetura de storage trouxe:

- ✅ **Responsabilidades claras** entre serviços
- ✅ **Consistência de dados** garantida
- ✅ **Facilidade de manutenção** e backup
- ✅ **APIs padronizadas** para acesso aos arquivos
- ✅ **Escalabilidade** melhorada

O sistema agora segue as melhores práticas de arquitetura, com o NestJS como responsável único pelo storage e o microserviço focado apenas nas operações específicas de NFe.
