# Migração para CamelCase - Resumo das Alterações

## Objetivo
Migrar todas as colunas do banco de dados do padrão `snake_case` para `camelCase`, mantendo compatibilidade e otimizando a estrutura da tabela `clientes`.

## Alterações Realizadas

### 1. Modelo Cliente (`backend/internal/models/cliente.go`)

#### Otimizações Estruturais:
- **Campo Unificado**: `IeRg` (coluna: `ieRg`) - unifica RG para PF e IE para PJ
- **Telefone Principal**: `TelefoneFixo` (coluna: `telefoneFixo`) - telefone principal unificado
- **Campos Personalizados**: Migrados para modelo dinâmico `ClienteCampoPersonalizado`

#### Campos Removidos (redundantes):
- `inscricao_estadual` (unificado em `ieRg`)
- `numero_imposto`, `codigo`, `suframa` (não utilizados no frontend)
- `telefone` (unificado em `telefoneFixo`)
- `campo_personalizado1-4` (migrados para tabela dinâmica)

#### Colunas CamelCase:
```go
CPF                   -> cpf
IeRg                  -> ieRg
InscricaoMunicipal    -> inscricaoMunicipal
Nome                  -> nome
NomeFantasia          -> nomeFantasia
TipoContato           -> tipoContato
Email                 -> email
PontoReferencia       -> pontoReferencia
TelefoneFixo          -> telefoneFixo
TelefoneAlternativo   -> telefoneAlternativo
Celular               -> celular
CEP                   -> cep
Endereco              -> endereco
Numero                -> numero
Complemento           -> complemento
Bairro                -> bairro
Cidade                -> cidade
Estado                -> estado
CodigoIbge            -> codigoIbge
CEPEntrega            -> cepEntrega
EnderecoEntrega       -> enderecoEntrega
NumeroEntrega         -> numeroEntrega
ComplementoEntrega    -> complementoEntrega
BairroEntrega         -> bairroEntrega
CidadeEntrega         -> cidadeEntrega
EstadoEntrega         -> estadoEntrega
LimiteCredito         -> limiteCredito
SaldoInicial          -> saldoInicial
PrazoPagamento        -> prazoPagamento
DataNascimento        -> dataNascimento
DataAbertura          -> dataAbertura
Status                -> status
DataCadastro          -> dataCadastro
UltimaCompra          -> ultimaCompra
DataAtualizacao       -> dataAtualizacao
DeletedAt             -> deletedAt
```

### 2. Novo Modelo: ClienteCampoPersonalizado

```go
type ClienteCampoPersonalizado struct {
    ID        uint      -> id
    ClienteID uint      -> clienteId
    Nome      string    -> nome
    Valor     string    -> valor
    Ordem     int       -> ordem
    CreatedAt time.Time -> createdAt
    UpdatedAt time.Time -> updatedAt
}
```

### 3. Modelo User (`backend/internal/models/user.go`)

```go
ID              -> id
Codigo          -> codigo
Nome            -> nome
Email           -> email
Senha           -> senha
Telefone        -> telefone
Cargo           -> cargo
Departamento    -> departamento
Perfil          -> perfil
Status          -> status
Avatar          -> avatar
UltimoAcesso    -> ultimoAcesso
DataCadastro    -> dataCadastro
DataAtualizacao -> dataAtualizacao
DeletedAt       -> deletedAt
```

### 4. Modelo Produto (`backend/internal/models/produto.go`)

```go
ID              -> id
Nome            -> nome
Codigo          -> codigo
Categoria       -> categoria
Subcategoria    -> subcategoria
Marca           -> marca
Modelo          -> modelo
Preco           -> preco
PrecoCusto      -> precoCusto
Estoque         -> estoque
EstoqueMinimo   -> estoqueMinimo
Unidade         -> unidade
Status          -> status
Fornecedor      -> fornecedor
Descricao       -> descricao
Peso            -> peso
Dimensoes       -> dimensoes
Garantia        -> garantia
DataCadastro    -> dataCadastro
DataUltimaVenda -> dataUltimaVenda
DataAtualizacao -> dataAtualizacao
DeletedAt       -> deletedAt
```

### 5. Modelo Fornecedor (`backend/internal/models/fornecedor.go`)

```go
ID              -> id
Codigo          -> codigo
RazaoSocial     -> razaoSocial
NomeFantasia    -> nomeFantasia
CNPJ            -> cnpj
Email           -> email
Telefone        -> telefone
Endereco        -> endereco
Cidade          -> cidade
UF              -> uf
CEP             -> cep
Status          -> status
Categoria       -> categoria
Contato         -> contato
DataCadastro    -> dataCadastro
DataAtualizacao -> dataAtualizacao
DeletedAt       -> deletedAt
```

### 6. Modelos de Localização (`backend/internal/models/localizacao.go`)

#### Estado:
```go
ID        -> id
Codigo    -> codigo
Sigla     -> sigla
Nome      -> nome
RegiaoID  -> regiaoId
CreatedAt -> createdAt
UpdatedAt -> updatedAt
```

#### Regiao:
```go
ID        -> id
Codigo    -> codigo
Sigla     -> sigla
Nome      -> nome
CreatedAt -> createdAt
UpdatedAt -> updatedAt
```

#### Cidade:
```go
ID         -> id
CodigoIBGE -> codigoIbge
Nome       -> nome
EstadoID   -> estadoId
CreatedAt  -> createdAt
UpdatedAt  -> updatedAt
```

#### CacheMetadata:
```go
ID             -> id
Tipo           -> tipo
UltimaSync     -> ultimaSync
VersaoAPI      -> versaoApi
TotalRegistros -> totalRegistros
CreatedAt      -> createdAt
UpdatedAt      -> updatedAt
```

### 7. Migração Automática

- Adicionado `ClienteCampoPersonalizado` ao sistema de migração automática em `backend/cmd/server/main.go`
- O GORM irá automaticamente:
  - Renomear colunas existentes para camelCase
  - Criar nova tabela `clientes_campos_personalizados`
  - Remover colunas redundantes da tabela `clientes`

## Próximos Passos

1. **Executar o backend** para aplicar as migrações automáticas
2. **Atualizar frontend** para usar os novos nomes de campos
3. **Migrar dados** dos campos personalizados antigos para a nova tabela (se necessário)
4. **Testar** todas as funcionalidades para garantir compatibilidade

## Benefícios

- ✅ **Consistência**: Padrão camelCase em todo o sistema
- ✅ **Flexibilidade**: Campos personalizados dinâmicos
- ✅ **Performance**: Remoção de campos redundantes
- ✅ **Manutenibilidade**: Estrutura mais limpa e organizada
- ✅ **Escalabilidade**: Sistema de campos personalizados extensível

## Compatibilidade

- Métodos auxiliares mantidos no modelo Cliente para compatibilidade com frontend existente
- Aliases nos tipos TypeScript para transição suave
- Migração automática preserva dados existentes
