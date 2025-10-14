# Modelagem de Dados - Cliente

## Visão Geral

A modelagem do Cliente foi completamente reestruturada para estar **100% alinhada com a NF-e** (bloco `<dest>`), mantendo flexibilidade para uso em CRM, emissão de notas e controle financeiro.

---

## Estrutura Principal

### Tabela: `clientes`

| Campo                    | Tipo                          | Descrição                                                                    |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------------------- |
| **id**                   | `SERIAL PRIMARY KEY`          | Identificador único do cliente (chave primária).                             |
| **tipo_pessoa**          | `VARCHAR(2)`                  | Tipo de pessoa: `PF` (física) ou `PJ` (jurídica).                            |
| **cnpj_cpf**             | `VARCHAR(18) UNIQUE NOT NULL` | CPF (11 dígitos) ou CNPJ (14 dígitos) do cliente, único no sistema.          |
| **ie**                   | `VARCHAR(20)`                 | Inscrição Estadual (ou RG se PF).                                            |
| **im**                   | `VARCHAR(20)`                 | Inscrição Municipal, usada para prestadores de serviço.                      |
| **ind_ie_dest**          | `INTEGER DEFAULT 9`           | Indicador de contribuinte ICMS (1 = contrib., 2 = isento, 9 = não contrib.). |
| **razao_social**         | `VARCHAR(200) NOT NULL`       | Nome completo (para PF) ou razão social (para PJ).                           |
| **nome_fantasia**        | `VARCHAR(200)`                | Nome fantasia, se existir.                                                   |
| **consumidor_final**     | `BOOLEAN DEFAULT TRUE`        | Indica se o cliente é consumidor final (NF-e `indFinal`).                    |
| **tipo_contato**         | `VARCHAR(50) DEFAULT 'Cliente'` | Categoria do contato: cliente, fornecedor, transportadora etc.             |
| **email**                | `VARCHAR(200)`                | E-mail principal de contato.                                                 |
| **fone**                 | `VARCHAR(20)`                 | Telefone fixo principal.                                                     |
| **celular**              | `VARCHAR(20)`                 | Telefone celular.                                                            |
| **ponto_referencia**     | `VARCHAR(300)`                | Ponto de referência para entrega.                                            |

---

### Endereço Principal (Fiscal)

Corresponde ao bloco `<enderDest>` da NF-e:

| Campo           | Tipo          | Descrição                                         | Tag NF-e |
| --------------- | ------------- | ------------------------------------------------- | -------- |
| **logradouro**  | `VARCHAR(300)` | Rua, avenida etc.                                 | `xLgr`   |
| **numero**      | `VARCHAR(20)`  | Número do imóvel.                                 | `nro`    |
| **complemento** | `VARCHAR(100)` | Complemento (sala, bloco, etc.).                  | `xCpl`   |
| **bairro**      | `VARCHAR(100)` | Bairro.                                           | `xBairro`|
| **codigo_ibge** | `VARCHAR(10)`  | Código do município conforme IBGE.                | `cMun`   |
| **municipio**   | `VARCHAR(100)` | Nome do município.                                | `xMun`   |
| **uf**          | `VARCHAR(2)`   | Sigla do estado.                                  | `UF`     |
| **cep**         | `VARCHAR(10)`  | CEP do endereço.                                  | `CEP`    |
| **codigo_pais** | `VARCHAR(10) DEFAULT '1058'` | Código do país (1058 = Brasil).    | `cPais`  |
| **pais**        | `VARCHAR(60) DEFAULT 'BRASIL'` | Nome do país.                     | `xPais`  |

---

### Endereço de Entrega (Alternativo)

| Campo                      | Tipo          | Descrição                                         |
| -------------------------- | ------------- | ------------------------------------------------- |
| **logradouro_entrega**     | `VARCHAR(300)` | Rua, avenida etc. (entrega).                      |
| **numero_entrega**         | `VARCHAR(20)`  | Número do imóvel (entrega).                       |
| **complemento_entrega**    | `VARCHAR(100)` | Complemento (entrega).                            |
| **bairro_entrega**         | `VARCHAR(100)` | Bairro (entrega).                                 |
| **codigo_ibge_entrega**    | `VARCHAR(10)`  | Código IBGE do município (entrega).              |
| **municipio_entrega**      | `VARCHAR(100)` | Nome do município (entrega).                      |
| **uf_entrega**             | `VARCHAR(2)`   | Sigla do estado (entrega).                        |
| **cep_entrega**            | `VARCHAR(10)`  | CEP (entrega).                                    |
| **codigo_pais_entrega**    | `VARCHAR(10) DEFAULT '1058'` | Código do país (entrega).  |
| **pais_entrega**           | `VARCHAR(60) DEFAULT 'BRASIL'` | Nome do país (entrega).  |

---

### Dados Financeiros

| Campo                | Tipo                          | Descrição                                      |
| -------------------- | ----------------------------- | ---------------------------------------------- |
| **limite_credito**   | `DECIMAL(15,2) DEFAULT 0`     | Limite de crédito em reais.                    |
| **saldo_inicial**    | `DECIMAL(15,2) DEFAULT 0`     | Saldo inicial do cliente (controle financeiro).|
| **prazo_pagamento**  | `INTEGER DEFAULT 0`           | Prazo médio de pagamento em dias.              |

---

### Datas Importantes

| Campo                | Tipo                          | Descrição                                      |
| -------------------- | ----------------------------- | ---------------------------------------------- |
| **data_nascimento**  | `TIMESTAMP NULL`              | Data de nascimento (PF).                       |
| **data_abertura**    | `TIMESTAMP NULL`              | Data de abertura da empresa (PJ).              |
| **ultima_compra**    | `TIMESTAMP NULL`              | Data da última compra.                         |

---

### Campos de Auditoria (GORM)

| Campo           | Tipo                          | Descrição                                      |
| --------------- | ----------------------------- | ---------------------------------------------- |
| **created_at**  | `TIMESTAMP NOT NULL`          | Data/hora de criação do registro.              |
| **updated_at**  | `TIMESTAMP NOT NULL`          | Data/hora da última atualização.               |
| **deleted_at**  | `TIMESTAMP NULL`              | Campo de exclusão lógica (soft delete).        |

---

## Tabela: `clientes_campos_personalizados`

Permite adicionar campos dinâmicos definidos pelo usuário:

| Campo         | Tipo          | Descrição                                      |
| ------------- | ------------- | ---------------------------------------------- |
| **id**        | `SERIAL PRIMARY KEY` | Identificador do campo.                 |
| **cliente_id**| `INTEGER NOT NULL` | ID do cliente associado (FK).             |
| **nome**      | `VARCHAR(100) NOT NULL` | Nome do campo personalizado.         |
| **valor**     | `TEXT`        | Valor do campo (texto livre ou JSON).          |
| **ordem**     | `INTEGER DEFAULT 1` | Posição de exibição dos campos.         |
| **created_at**| `TIMESTAMP NOT NULL` | Data/hora de criação.                   |
| **updated_at**| `TIMESTAMP NOT NULL` | Data/hora da última atualização.        |

**Constraint:**
- `FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE`

---

## Índices

```sql
CREATE UNIQUE INDEX idx_clientes_cnpj_cpf ON clientes(cnpj_cpf);
CREATE INDEX idx_clientes_razao_social ON clientes(razao_social);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_tipo_contato ON clientes(tipo_contato);
CREATE INDEX idx_clientes_deleted_at ON clientes(deleted_at);
CREATE INDEX idx_campos_personalizados_cliente_id ON clientes_campos_personalizados(cliente_id);
```

---

## Mapeamento NF-e

### Bloco `<dest>` da NF-e

```xml
<dest>
  <CNPJ>12345678000190</CNPJ>              <!-- cnpj_cpf -->
  <xNome>EMPRESA EXEMPLO LTDA</xNome>      <!-- razao_social -->
  <enderDest>
    <xLgr>RUA EXEMPLO</xLgr>               <!-- logradouro -->
    <nro>123</nro>                         <!-- numero -->
    <xCpl>SALA 1</xCpl>                    <!-- complemento -->
    <xBairro>CENTRO</xBairro>              <!-- bairro -->
    <cMun>3550308</cMun>                   <!-- codigo_ibge -->
    <xMun>SAO PAULO</xMun>                 <!-- municipio -->
    <UF>SP</UF>                            <!-- uf -->
    <CEP>01000000</CEP>                    <!-- cep -->
    <cPais>1058</cPais>                    <!-- codigo_pais -->
    <xPais>BRASIL</xPais>                  <!-- pais -->
  </enderDest>
  <indIEDest>1</indIEDest>                 <!-- ind_ie_dest -->
  <IE>123456789</IE>                       <!-- ie -->
  <IM>987654321</IM>                       <!-- im -->
  <email>contato@exemplo.com</email>       <!-- email -->
</dest>
```

---

## Validações

### Regras de Negócio

1. **CNPJ/CPF**: Deve ser único no sistema
2. **Tipo Pessoa**: Apenas `PF` ou `PJ`
3. **IndIEDest**: Valores válidos: 1, 2 ou 9
4. **UF**: Deve ser uma sigla válida de estado brasileiro
5. **Código IBGE**: Deve corresponder a um município válido
6. **Código País**: Padrão 1058 (Brasil)

### Validações Automáticas (Hooks)

```go
// BeforeCreate
- Define Status = "Ativo" se vazio
- Define TipoPessoa = "PF" se vazio
- Define IndIEDest = 9 se vazio
- Define CodigoPais = "1058" se vazio
- Define Pais = "BRASIL" se vazio
```

---

## Métodos Auxiliares

### Verificações de Tipo

```go
cliente.IsPessoaFisica()      // Retorna true se PF
cliente.IsPessoaJuridica()    // Retorna true se PJ
cliente.IsContribuinteICMS()  // Retorna true se IndIEDest == 1
```

### Formatação

```go
cliente.GetNomeCompleto()      // Retorna NomeFantasia ou RazaoSocial
cliente.GetEnderecoCompleto()  // Retorna endereço formatado
cliente.TemEnderecoEntrega()   // Verifica se há endereço de entrega
```

---

## Migração de Dados

Para migrar da estrutura antiga para a nova:

```sql
-- Exemplo de migração
UPDATE clientes SET 
  cnpj_cpf = cpf,
  razao_social = nome,
  logradouro = endereco,
  municipio = cidade,
  uf = estado,
  codigo_ibge = codigo_ibge,
  fone = telefone_fixo;
```

---

## Compatibilidade com Frontend

Os DTOs mantêm compatibilidade com o frontend através de:

- **CreateClienteRequest**: Para criação de novos clientes
- **UpdateClienteRequest**: Para atualização (todos os campos opcionais com ponteiros)
- **CampoPersonalizadoDTO**: Para campos dinâmicos

---

## Próximos Passos

1. ✅ Modelagem de dados atualizada
2. ⏳ Atualizar migrations do banco de dados
3. ⏳ Atualizar services e repositories
4. ⏳ Atualizar handlers/controllers
5. ⏳ Atualizar frontend (TypeScript interfaces)
6. ⏳ Criar testes unitários
7. ⏳ Documentar API endpoints

---

## Referências

- [Manual de Integração NF-e](http://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [Tabela de Códigos IBGE](https://www.ibge.gov.br/explica/codigos-dos-municipios.php)
- [GORM Documentation](https://gorm.io/docs/)

