# Movix NFe - Sistema de Emissão de Nota Fiscal Eletrônica

Sistema completo para emissão de NFe (Nota Fiscal Eletrônica) utilizando a biblioteca **DFe.NET** (Zeus).

## 📋 Estrutura do Projeto

```
Movix.NFe/
├── src/
│   ├── Movix.NFe.Api/          # API REST para emissão de NFe
│   └── Movix.NFe.Core/          # Biblioteca principal com entidades e lógica
│       ├── Configuration/       # Configurações do sistema
│       ├── Data/                # DbContext e configurações EF Core
│       ├── Entities/            # Entidades do banco de dados
│       │   ├── Tabelas/         # Tabelas utilitárias (NCM, CST, CFOP, etc.)
│       │   ├── Cliente.cs
│       │   ├── Emitente.cs
│       │   ├── Produto.cs
│       │   ├── NotaFiscal.cs
│       │   ├── NotaFiscalItem.cs
│       │   └── NotaFiscalEvento.cs
│       ├── Models/              # DTOs e ViewModels
│       └── Services/            # Serviços de negócio
└── README.md
```

## 🗄️ Banco de Dados

### Entidades Principais

- **Emitente**: Empresa que emite a NFe
- **Cliente**: Destinatário da NFe
- **Produto**: Produtos/Serviços comercializados
- **NotaFiscal**: Nota Fiscal Eletrônica
- **NotaFiscalItem**: Itens da NFe
- **NotaFiscalEvento**: Eventos da NFe (Cancelamento, Carta de Correção)

### Tabelas Utilitárias

#### Localização
- **Estado**: Estados brasileiros (UF)
- **Municipio**: Municípios com código IBGE

#### Fiscais
- **NCM**: Nomenclatura Comum do Mercosul
- **CEST**: Código Especificador da Substituição Tributária
- **CFOP**: Código Fiscal de Operações e Prestações
- **CSTICMS**: Código de Situação Tributária do ICMS
- **CSOSN**: Código de Situação da Operação no Simples Nacional
- **CSTPIS**: Código de Situação Tributária do PIS
- **CSTCOFINS**: Código de Situação Tributária do COFINS
- **CSTIPI**: Código de Situação Tributária do IPI
- **NaturezaOperacao**: Natureza da Operação

## 🚀 Tecnologias Utilizadas

- **.NET 8.0**
- **Entity Framework Core 9.0**
- **SQL Server**
- **Zeus.Net.NFe.NFCe** (DFe.NET) - Biblioteca para emissão de NFe
- **Zeus.Net.NFe.Danfe.QuestPdf** - Geração de DANFE em PDF

## 📦 Pacotes NuGet

```xml
<PackageReference Include="Zeus.Net.NFe.NFCe" Version="2025.10.9.2019" />
<PackageReference Include="Zeus.Net.NFe.Danfe.QuestPdf" Version="2025.10.9.2019" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.10" />
```

## ⚙️ Configuração

### 1. String de Conexão

Configure a string de conexão no `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MovixNFe;User Id=sa;Password=SuaSenha;TrustServerCertificate=True;"
  }
}
```

### 2. Criar o Banco de Dados

Execute as migrations para criar o banco de dados:

```bash
# Adicionar migration inicial
dotnet ef migrations add InitialCreate --project src/Movix.NFe.Core --startup-project src/Movix.NFe.Api

# Atualizar o banco de dados
dotnet ef database update --project src/Movix.NFe.Core --startup-project src/Movix.NFe.Api
```

### 3. Popular Tabelas Utilitárias

Após criar o banco, você precisará popular as tabelas utilitárias com dados fiscais:

- Estados e Municípios (código IBGE)
- NCM (Nomenclatura Comum do Mercosul)
- CFOP (Códigos Fiscais)
- CST (Códigos de Situação Tributária)
- CSOSN (Simples Nacional)

## 📝 Funcionalidades

### Implementadas

✅ Estrutura completa do banco de dados  
✅ Entidades principais (Emitente, Cliente, Produto, NFe)  
✅ Tabelas utilitárias fiscais  
✅ DbContext configurado  
✅ Relacionamentos e índices  

### A Implementar

- [ ] Serviços de emissão de NFe
- [ ] Consulta de status do serviço
- [ ] Transmissão de NFe
- [ ] Cancelamento de NFe
- [ ] Carta de Correção Eletrônica
- [ ] Inutilização de numeração
- [ ] Geração de DANFE (PDF)
- [ ] API REST endpoints
- [ ] Validações de negócio
- [ ] Testes unitários

## 🔐 Certificado Digital

Para emitir NFe, você precisará de um certificado digital A1 (arquivo .pfx) ou A3 (token/cartão).

Configure o certificado no cadastro do Emitente:
- **CertificadoCaminho**: Caminho do arquivo .pfx
- **CertificadoSenha**: Senha do certificado (será criptografada)
- **CertificadoSerial**: Número de série (alternativa ao arquivo)

## 📚 Documentação DFe.NET

- GitHub: https://github.com/ZeusAutomacao/DFe.NET
- Documentação oficial da NFe: http://www.nfe.fazenda.gov.br/portal/principal.aspx

## 🎯 Próximos Passos

1. **Implementar serviços de NFe**
   - Geração de XML
   - Assinatura digital
   - Transmissão para SEFAZ
   - Tratamento de retornos

2. **Criar API REST**
   - Endpoints para CRUD de entidades
   - Endpoints para emissão de NFe
   - Endpoints para consultas

3. **Implementar eventos**
   - Cancelamento
   - Carta de Correção
   - Manifestação do Destinatário

4. **Geração de DANFE**
   - PDF com QuestPDF
   - HTML para visualização

5. **Testes**
   - Testes unitários
   - Testes de integração
   - Testes em ambiente de homologação

## 📄 Licença

Este projeto utiliza a biblioteca DFe.NET que é licenciada sob LGPL.

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas sobre a biblioteca DFe.NET, consulte:
- Issues do projeto: https://github.com/ZeusAutomacao/DFe.NET/issues
- Documentação oficial da SEFAZ

---

**Desenvolvido com ❤️ usando .NET e DFe.NET**

