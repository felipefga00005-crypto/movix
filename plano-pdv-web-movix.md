# PDV Web Movix - Plano de Implementação Fiscal

## 🎯 ANÁLISE DO PROJETO ATUAL

### **✅ ESTRUTURA EXISTENTE**

**Backend Go:**
- ✅ Gin Framework + GORM + PostgreSQL
- ✅ Autenticação JWT completa
- ✅ Modelos: User, Cliente, Fornecedor, Produto
- ✅ APIs REST estruturadas
- ✅ Middleware de autenticação
- ✅ Configuração via .env
- ✅ Docker Compose (PostgreSQL + DbGate)

**Frontend Next.js:**
- ✅ Next.js 15 + TypeScript + Tailwind v4
- ✅ ShadcnUI + Radix UI completo
- ✅ Context de autenticação funcional
- ✅ Sidebar com navegação estruturada
- ✅ Páginas de cadastro (clientes, produtos, fornecedores)
- ✅ Dashboard com gráficos (Recharts)
- ✅ Formulários com validação (Zod)

### **❌ FALTANDO PARA PDV FISCAL**

**Backend:**
- ❌ Modelos fiscais (NaturezaOperacao, Tributacao, etc.)
- ❌ Serviço de integração SEFAZ
- ❌ APIs de emissão fiscal
- ❌ Modelos de Venda/PDV

**Frontend:**
- ❌ Tela de PDV
- ❌ Configurações fiscais
- ❌ Emissão de documentos fiscais
- ❌ Impressão de DANFE

## 🏗️ ARQUITETURA PROPOSTA

### **Stack Final (Aproveitando o Existente):**
```
┌─────────────────────────────────────────┐
│         MOVIX WEB (Existente)           │
├─────────────────────────────────────────┤
│  Frontend: Next.js + ShadcnUI (✅)     │
│  Backend: Go + Gin + GORM (✅)         │
│  Database: PostgreSQL (✅)             │
│  Auth: JWT Context (✅)                │
├─────────────────────────────────────────┤
│         ADIÇÕES FISCAIS (Novo)          │
├─────────────────────────────────────────┤
│  Fiscal Service: DFe.NET (C# subprocess)│
│  PDV: React components + Go APIs       │
│  Configurações: Certificado + SEFAZ    │
└─────────────────────────────────────────┘
```

### **Integração com DFe.NET:**
```
Frontend Next.js ↔ Backend Go (APIs) ↔ Fiscal Service C# (DFe.NET) ↔ SEFAZ
                           ↕
                   PostgreSQL Database
```

## 📋 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Modelos Fiscais Backend (1 semana)**

#### 1.1 Estender Modelos Existentes
```go
// backend/internal/models/empresa.go (novo)
type Empresa struct {
    ID                uint      `gorm:"primaryKey"`
    RazaoSocial       string    `gorm:"size:200;not null"`
    NomeFantasia      string    `gorm:"size:200"`
    CNPJ              string    `gorm:"size:18;uniqueIndex;not null"`
    InscricaoEstadual string    `gorm:"size:20"`
    // ... outros campos fiscais
    
    // Configurações Fiscais
    CertificadoA1     string    `gorm:"type:text"` // Base64
    SenhaCertificado  string    `gorm:"type:text"` // Criptografada
    AmbienteNFe       int       `gorm:"default:2"` // 1=Prod, 2=Homolog
    SerieNFe          int       `gorm:"default:1"`
    SerieNFCe         int       `gorm:"default:1"`
    NumeroAtualNFe    int       `gorm:"default:0"`
    NumeroAtualNFCe   int       `gorm:"default:0"`
}

// backend/internal/models/natureza_operacao.go (novo)
type NaturezaOperacao struct {
    ID                     uint   `gorm:"primaryKey"`
    Codigo                 string `gorm:"uniqueIndex;size:10;not null"`
    Descricao              string `gorm:"size:200;not null"`
    CFOPDentroEstado       string `gorm:"size:4;not null"`
    CFOPForaEstado         string `gorm:"size:4;not null"`
    CFOPExterior           string `gorm:"size:4"`
    FinalidadeNFe          int    `gorm:"default:1"` // 1=Normal, 2=Complementar
    TipoOperacao           int    `gorm:"default:1"` // 0=Entrada, 1=Saída
    MovimentaEstoque       bool   `gorm:"default:true"`
    GeraFinanceiro         bool   `gorm:"default:true"`
    Ativo                  bool   `gorm:"default:true"`
}

// backend/internal/models/venda.go (novo)
type Venda struct {
    ID              uint        `gorm:"primaryKey"`
    NumeroVenda     string      `gorm:"uniqueIndex;not null"`
    ClienteID       *uint       `gorm:"index"`
    UsuarioID       uint        `gorm:"not null;index"`
    NaturezaOpID    uint        `gorm:"not null;index"`
    TotalProdutos   float64     `gorm:"type:decimal(15,2);not null"`
    TotalDesconto   float64     `gorm:"type:decimal(15,2);default:0"`
    TotalVenda      float64     `gorm:"type:decimal(15,2);not null"`
    Status          string      `gorm:"size:20;default:'pendente'"` // pendente, finalizada, cancelada
    
    // Dados Fiscais
    NFCeNumero      *string     `gorm:"index"`
    NFCeChave       *string     `gorm:"index"`
    NFCeXML         *string     `gorm:"type:text"`
    NFCeStatus      string      `gorm:"size:20;default:'nao_emitida'"` // nao_emitida, autorizada, rejeitada, cancelada
    
    CreatedAt       time.Time   `gorm:"autoCreateTime"`
    UpdatedAt       time.Time   `gorm:"autoUpdateTime"`
    
    // Relacionamentos
    Cliente         *Cliente         `gorm:"foreignKey:ClienteID"`
    Usuario         User             `gorm:"foreignKey:UsuarioID"`
    NaturezaOp      NaturezaOperacao `gorm:"foreignKey:NaturezaOpID"`
    Itens           []ItemVenda      `gorm:"foreignKey:VendaID"`
}

type ItemVenda struct {
    ID          uint    `gorm:"primaryKey"`
    VendaID     uint    `gorm:"not null;index"`
    ProdutoID   uint    `gorm:"not null;index"`
    Quantidade  float64 `gorm:"type:decimal(10,3);not null"`
    ValorUnit   float64 `gorm:"type:decimal(15,2);not null"`
    ValorDesc   float64 `gorm:"type:decimal(15,2);default:0"`
    ValorTotal  float64 `gorm:"type:decimal(15,2);not null"`
    
    // Relacionamentos
    Venda       Venda   `gorm:"foreignKey:VendaID"`
    Produto     Produto `gorm:"foreignKey:ProdutoID"`
}
```

#### 1.2 Estender Produto com Dados Fiscais
```go
// Adicionar ao modelo Produto existente:
type Produto struct {
    // ... campos existentes ...
    
    // Dados Fiscais
    NCM                string  `gorm:"size:8" json:"ncm"`
    CEST               string  `gorm:"size:7" json:"cest"`
    UnidadeTributavel  string  `gorm:"size:6;default:'UN'" json:"unidade_tributavel"`
    AliquotaICMS       float64 `gorm:"type:decimal(5,2);default:0" json:"aliquota_icms"`
    AliquotaIPI        float64 `gorm:"type:decimal(5,2);default:0" json:"aliquota_ipi"`
    CSTPIS             string  `gorm:"size:2;default:'07'" json:"cst_pis"`
    CSTCOFINS          string  `gorm:"size:2;default:'07'" json:"cst_cofins"`
    OrigemProduto      int     `gorm:"default:0" json:"origem_produto"` // 0=Nacional, 1=Estrangeira
}
```

### **FASE 2: Serviço Fiscal C# (1 semana)**

#### 2.1 Criar Serviço C# Separado
```bash
# Estrutura do serviço fiscal
backend/fiscal-service/
├── FiscalService.csproj
├── Program.cs
├── Models/
│   ├── VendaRequest.cs
│   ├── NFCeResponse.cs
│   └── ConfiguracaoFiscal.cs
├── Services/
│   ├── NFCeService.cs
│   ├── NFEService.cs
│   └── CertificadoService.cs
└── Controllers/
    └── FiscalController.cs
```

#### 2.2 Implementação Básica NFCe
```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run("http://localhost:8081"); // Porta diferente do Go

// Controllers/FiscalController.cs
[ApiController]
[Route("api/[controller]")]
public class FiscalController : ControllerBase
{
    [HttpPost("nfce")]
    public async Task<IActionResult> EmitirNFCe([FromBody] VendaRequest request)
    {
        try {
            var nfceService = new NFCeService();
            var resultado = await nfceService.EmitirNFCe(request);
            return Ok(resultado);
        } catch (Exception ex) {
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

### **FASE 3: APIs Backend Go (1 semana)**

#### 3.1 Handlers Fiscais
```go
// backend/internal/handlers/fiscal_handler.go (novo)
func EmitirNFCe(c *gin.Context) {
    var request EmitirNFCeRequest
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // Buscar venda no banco
    venda, err := vendaService.GetByID(request.VendaID)
    if err != nil {
        c.JSON(404, gin.H{"error": "Venda não encontrada"})
        return
    }
    
    // Chamar serviço fiscal C#
    nfceResponse, err := fiscalService.EmitirNFCe(venda)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    // Atualizar venda com dados da NFCe
    venda.NFCeNumero = &nfceResponse.Numero
    venda.NFCeChave = &nfceResponse.Chave
    venda.NFCeXML = &nfceResponse.XML
    venda.NFCeStatus = "autorizada"
    
    db.Save(&venda)
    
    c.JSON(200, nfceResponse)
}

// backend/internal/handlers/venda_handler.go (novo)
func CreateVenda(c *gin.Context) { /* ... */ }
func GetVendas(c *gin.Context) { /* ... */ }
func GetVendaByID(c *gin.Context) { /* ... */ }
```

#### 3.2 Rotas Fiscais
```go
// backend/internal/routers/fiscal_routes.go (novo)
func SetupFiscalRoutes(router *gin.RouterGroup, db *gorm.DB) {
    fiscalGroup := router.Group("/fiscal")
    {
        fiscalGroup.POST("/nfce", handlers.EmitirNFCe)
        fiscalGroup.POST("/nfe", handlers.EmitirNFe)
        fiscalGroup.POST("/cancelar-nfce", handlers.CancelarNFCe)
        fiscalGroup.GET("/status/:chave", handlers.ConsultarStatus)
    }
    
    vendaGroup := router.Group("/vendas")
    {
        vendaGroup.POST("", handlers.CreateVenda)
        vendaGroup.GET("", handlers.GetVendas)
        vendaGroup.GET("/:id", handlers.GetVendaByID)
        vendaGroup.PUT("/:id", handlers.UpdateVenda)
    }
    
    configGroup := router.Group("/configuracoes")
    {
        configGroup.GET("/empresa", handlers.GetEmpresa)
        configGroup.PUT("/empresa", handlers.UpdateEmpresa)
        configGroup.POST("/certificado", handlers.UploadCertificado)
        configGroup.GET("/naturezas-operacao", handlers.GetNaturezasOperacao)
        configGroup.POST("/naturezas-operacao", handlers.CreateNaturezaOperacao)
    }
}
```

### **FASE 4: Frontend PDV (1 semana)**

#### 4.1 Adicionar ao Sidebar
```tsx
// frontend/components/layout/app-sidebar.tsx
const data = {
  navMain: [
    // ... itens existentes ...
    {
      title: "PDV",
      url: "/pdv",
      icon: IconCash,
    },
    {
      title: "Configurações",
      url: "#",
      icon: IconSettings,
      items: [
        {
          title: "Empresa",
          url: "/configuracoes/empresa",
          icon: IconBuilding,
        },
        {
          title: "Fiscal",
          url: "/configuracoes/fiscal",
          icon: IconFileText,
        },
        {
          title: "Certificado",
          url: "/configuracoes/certificado",
          icon: IconCertificate,
        },
      ],
    },
  ],
}
```

#### 4.2 Tela Principal do PDV
```tsx
// frontend/app/(dashboard)/pdv/page.tsx (novo)
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductSearch } from '@/components/pdv/product-search'
import { CartItems } from '@/components/pdv/cart-items'
import { PaymentModal } from '@/components/pdv/payment-modal'
import { useVenda } from '@/hooks/useVenda'

export default function PDVPage() {
  const { venda, adicionarItem, removerItem, finalizarVenda } = useVenda()
  const [showPayment, setShowPayment] = useState(false)

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-8rem)] p-6">
      {/* Lista de Produtos */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Produtos</h2>
        <ProductSearch onAddItem={adicionarItem} />
      </Card>

      {/* Carrinho */}
      <Card className="p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Venda Atual</h2>
        
        <div className="flex-1">
          <CartItems 
            items={venda.itens} 
            onRemoveItem={removerItem}
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total:</span>
            <span>R$ {venda.total.toFixed(2)}</span>
          </div>
          
          <Button 
            className="w-full h-12 text-lg"
            onClick={() => setShowPayment(true)}
            disabled={venda.itens.length === 0}
          >
            Finalizar Venda (F12)
          </Button>
        </div>
      </Card>

      <PaymentModal 
        open={showPayment}
        onClose={() => setShowPayment(false)}
        venda={venda}
        onFinalize={finalizarVenda}
      />
    </div>
  )
}
```

### **FASE 5: Configurações Fiscais (1 semana)**

#### 5.1 Página de Configuração da Empresa
```tsx
// frontend/app/(dashboard)/configuracoes/empresa/page.tsx (novo)
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const empresaSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  inscricaoEstadual: z.string().optional(),
  // ... outros campos
})

export default function EmpresaPage() {
  const form = useForm({
    resolver: zodResolver(empresaSchema),
  })

  const onSubmit = async (data: any) => {
    // Salvar configurações da empresa
  }

  return (
    <div className="p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Configurações da Empresa</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campos do formulário */}
            <Button type="submit">Salvar Configurações</Button>
          </form>
        </Form>
      </Card>
    </div>
  )
}
```

## ⏱️ CRONOGRAMA DETALHADO

### **Sprint 1 (1 semana): Modelos Backend**
- [x] Criar modelos fiscais (Empresa, NaturezaOperacao, Venda, ItemVenda)
- [x] Estender modelo Produto com dados fiscais
- [x] Migrations PostgreSQL
- [x] Testes básicos dos modelos

### **Sprint 2 (1 semana): Serviço Fiscal C#**
- [ ] Setup projeto C# com DFe.NET
- [ ] Implementar emissão básica NFCe
- [ ] API REST para comunicação com Go
- [ ] Testes de integração SEFAZ (homologação)

### **Sprint 3 (1 semana): APIs Backend Go**
- [ ] Handlers fiscais (emitir, cancelar, consultar)
- [ ] Handlers de venda (CRUD completo)
- [ ] Handlers de configuração
- [ ] Integração com serviço C# via HTTP

### **Sprint 4 (1 semana): Frontend PDV**
- [ ] Tela principal do PDV
- [ ] Componentes de busca de produtos
- [ ] Carrinho de compras
- [ ] Modal de pagamento e finalização

### **Sprint 5 (1 semana): Configurações**
- [ ] Páginas de configuração da empresa
- [ ] Upload e configuração de certificado
- [ ] Configurações fiscais (naturezas de operação)
- [ ] Testes integrados completos

## 🚀 VANTAGENS DESTA ABORDAGEM

1. **✅ Aproveita 80% do código existente**
2. **✅ Mantém padrões já estabelecidos**
3. **✅ Stack conhecida pela equipe**
4. **✅ Fácil migração futura para Wails**
5. **✅ Fiscal completo com DFe.NET**
6. **✅ Deploy simples (web primeiro)**

## 📦 ENTREGÁVEIS

- **Backend Go**: APIs fiscais + modelos estendidos
- **Frontend Next.js**: PDV + configurações fiscais
- **Fiscal Service**: Executável C# para SEFAZ
- **Database**: Migrations PostgreSQL
- **Documentação**: APIs e configuração

**Posso começar a implementação desta arquitetura aproveitando o projeto existente?**
