# Microserviço NFe - Movix

Microserviço para geração e comunicação de Notas Fiscais Eletrônicas (NFe) usando a biblioteca [nfephp-org/sped-nfe](https://github.com/nfephp-org/sped-nfe).

## 🚀 Funcionalidades

- ✅ Geração de NFe (modelo 55)
- ✅ Assinatura digital de NFe
- ✅ Envio para SEFAZ
- ✅ Consulta de status
- ✅ Cancelamento de NFe
- ✅ Carta de correção eletrônica (CCe)
- ✅ Inutilização de numeração
- ✅ Manifestação do destinatário
- ✅ Download de XML
- ✅ Validação de dados

## 🏗️ Arquitetura

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│   Backend       │ ◄──────────────► │  Microserviço    │
│   (NestJS)      │                  │  NFe (PHP)       │
└─────────────────┘                  └──────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   SEFAZ APIs    │
                                    │   (Receita)     │
                                    └─────────────────┘
```

## 📋 Pré-requisitos

- Docker e Docker Compose
- Certificado Digital A1 (.pfx)
- PHP 8.1+ (se executar sem Docker)

## 🛠️ Instalação

### Com Docker (Recomendado)

1. **Clone e configure:**
```bash
cd backend/nfe-service
cp .env.example .env
```

2. **Configure o arquivo .env:**
```bash
# Edite as configurações da emitente e certificado
nano .env
```

3. **Coloque o certificado:**
```bash
# Copie seu certificado .pfx para:
cp seu_certificado.pfx certificates/certificado.pfx
```

4. **Execute com Docker:**
```bash
docker-compose up -d
```

### Sem Docker

1. **Instale dependências:**
```bash
composer install
```

2. **Configure servidor web (Apache/Nginx) apontando para `/public`**

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```bash
# Ambiente NFe
NFE_AMBIENTE=2  # 1=Produção, 2=Homologação

# Certificado Digital
CERT_PATH=/var/www/html/certificates/certificado.pfx
CERT_PASSWORD=senha_do_certificado

# Dados da Emitente
EMPRESA_CNPJ=00000000000000
EMPRESA_RAZAO_SOCIAL=Sua Emitente LTDA
EMPRESA_UF=SP
# ... outros dados
```

## 🏗️ **Arquitetura Refatorada**

> **IMPORTANTE**: Este microserviço foi refatorado para focar apenas nas operações específicas de NFe.
> O armazenamento de arquivos (XMLs e PDFs) agora é gerenciado pelo backend NestJS.

### **Responsabilidades do Microserviço:**
- ✅ Gerar XMLs de NFe
- ✅ Assinar digitalmente
- ✅ Transmitir para SEFAZ
- ✅ Consultar status
- ✅ Cancelar NFe
- ✅ Carta de correção

### **Responsabilidades do NestJS:**
- ✅ Armazenamento de arquivos
- ✅ Gerenciamento de dados
- ✅ APIs de download
- ✅ Controle de acesso

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### NFe Operations
```http
POST /api/v1/nfe/generate     # Gerar NFe
POST /api/v1/nfe/sign         # Assinar NFe
POST /api/v1/nfe/send         # Enviar para SEFAZ
GET  /api/v1/nfe/status/{chave}  # Consultar status
POST /api/v1/nfe/cancel       # Cancelar NFe
POST /api/v1/nfe/cce          # Carta de correção
```

> **Nota**: Endpoints de download de XML foram removidos. Use o backend NestJS para essas operações.

## 📝 Exemplo de Uso

### Gerar NFe
```bash
curl -X POST http://localhost:8080/api/v1/nfe/generate \
  -H "Content-Type: application/json" \
  -d '{
    "identificacao": {
      "numero": "123",
      "serie": "1",
      "tipo_operacao": "1",
      "tipo_emissao": "1"
    },
    "destinatario": {
      "cnpj": "12345678000123",
      "razao_social": "Cliente Exemplo",
      "endereco": {
        "logradouro": "Rua Exemplo",
        "numero": "123",
        "bairro": "Centro",
        "cep": "01234567",
        "municipio": "São Paulo",
        "uf": "SP"
      }
    },
    "itens": [
      {
        "codigo": "001",
        "descricao": "Produto Exemplo",
        "quantidade": 1,
        "valor_unitario": 100.00,
        "valor_total": 100.00
      }
    ]
  }'
```

## 🧪 Testes

```bash
# Executar testes
composer test

# Verificar padrões de código
composer cs-check
```

## 📁 Estrutura do Projeto

```
nfe-service/
├── public/           # Ponto de entrada da aplicação
├── src/
│   ├── Controllers/  # Controladores da API
│   ├── Services/     # Lógica de negócio
│   ├── Config/       # Configurações
│   └── Utils/        # Utilitários
├── config/           # Arquivos de configuração
├── storage/          # Armazenamento de XMLs
├── certificates/     # Certificados digitais
├── tests/            # Testes automatizados
└── docker-compose.yml
```

## 🔒 Segurança

- Certificados digitais protegidos
- Validação de dados de entrada
- Headers de segurança configurados
- Logs de auditoria

## 📊 Monitoramento

- Health check endpoint
- Logs estruturados
- Métricas de performance

## 🤝 Integração com Backend

O microserviço se integra com o backend NestJS através de chamadas HTTP REST. Veja a documentação de integração no backend principal.

## 📞 Suporte

Para dúvidas sobre NFe, consulte:
- [Documentação oficial da Receita Federal](http://www.nfe.fazenda.gov.br/)
- [Grupo NFePHP](https://groups.google.com/forum/#!forum/nfephp)
- [Manual de Orientação do Contribuinte](http://www.nfe.fazenda.gov.br/portal/informe.aspx?ehCTG=true&Informe=9jOYKU%2b%2fKLM%3d)
