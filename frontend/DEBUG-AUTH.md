# 🔍 DEBUG - Problema de Persistência de Autenticação

## 📋 Sintomas

- ✅ Login funciona (retorna 200)
- ✅ Redireciona para `/dashboard`
- ❌ Ao recarregar (F5), volta para `/login`
- ❌ Autenticação não persiste

---

## 🛠️ Ferramentas de Debug Adicionadas

### 1. **Console Logs**
Logs detalhados em:
- `AuthContext.loadUser()`
- `AuthContext.login()`
- `ProtectedRoute`
- `PublicRoute`

### 2. **Componente AuthDebug**
Canto inferior direito da tela mostra:
- Estado do Context (loading, isAuthenticated, user)
- Dados do localStorage (token, user)
- Botão "Testar LocalStorage"

---

## 🧪 Passos para Debug

### **PASSO 1: Limpar Estado**

Abra o Console (F12) e execute:

```javascript
// Limpar tudo
localStorage.clear();
sessionStorage.clear();

// Recarregar
location.reload();
```

### **PASSO 2: Fazer Login**

1. Acesse http://localhost:3000
2. Faça login
3. **COPIE TODOS OS LOGS DO CONSOLE** e me envie

Logs esperados:
```
[AuthContext] login - iniciando login
[AuthContext] login - resposta recebida: {hasToken: true, hasUser: true}
[AuthContext] login - token e usuário salvos no localStorage
[AuthContext] login - estado atualizado
[PublicRoute] Autenticado, redirecionando para: /dashboard
```

### **PASSO 3: Verificar LocalStorage**

No Console, execute:

```javascript
// Verificar o que foi salvo
console.log("Token:", localStorage.getItem('auth_token'));
console.log("User:", localStorage.getItem('current_user'));
```

**Resultado esperado:**
- Token: string longa (JWT)
- User: objeto JSON com dados do usuário

### **PASSO 4: Verificar AuthDebug**

Olhe o componente de debug no canto inferior direito:

**Deve mostrar:**
```json
{
  "loading": false,
  "isAuthenticated": true,
  "hasUser": true,
  "userName": "Seu Nome"
}

{
  "hasToken": true,
  "tokenLength": 200+,
  "hasUser": true,
  "userName": "Seu Nome"
}
```

### **PASSO 5: Recarregar Página**

1. Pressione F5
2. **COPIE TODOS OS LOGS DO CONSOLE** e me envie

Logs esperados:
```
[AuthContext] loadUser - token: exists
[AuthContext] loadUser - storedUser: exists
[AuthContext] loadUser - usuário definido do localStorage
[AuthContext] loadUser - validando token com /auth/me
[AuthContext] loadUser - response status: 200
[AuthContext] loadUser - usuário atualizado da API
[ProtectedRoute] Autenticado! Renderizando conteúdo protegido
```

### **PASSO 6: Verificar Rede**

1. Abra DevTools → Network
2. Recarregue a página
3. Procure pela requisição `/auth/me`
4. Verifique:
   - Status: deve ser 200
   - Headers: deve ter `Authorization: Bearer ...`
   - Response: deve retornar dados do usuário

---

## 🐛 Possíveis Problemas

### **Problema A: Token não está sendo salvo**

**Sintoma:**
```javascript
localStorage.getItem('auth_token') // null
```

**Causa:** Função `setAuthToken()` não está funcionando

**Teste:**
```javascript
// No console
localStorage.setItem('test', 'value');
localStorage.getItem('test'); // deve retornar 'value'
```

Se não funcionar: problema com localStorage do navegador (modo privado?)

### **Problema B: Token é salvo mas apagado ao recarregar**

**Sintoma:**
- Antes de F5: `localStorage.getItem('auth_token')` retorna token
- Depois de F5: `localStorage.getItem('auth_token')` retorna null

**Logs esperados:**
```
[AuthContext] loadUser - token: exists
[AuthContext] loadUser - validando token com /auth/me
[AuthContext] loadUser - response status: 401  ← ERRO!
[AuthContext] loadUser - erro ao validar token
```

**Causa:** Backend está rejeitando o token

**Solução:** Verificar backend

### **Problema C: /auth/me retorna 401**

**Sintoma:**
```
[AuthContext] loadUser - response status: 401
```

**Causa:** Token inválido ou expirado

**Verificar:**
1. Token está sendo enviado no header?
2. Backend está validando corretamente?
3. Token expirou?

### **Problema D: CORS bloqueando /auth/me**

**Sintoma:**
```
Access to fetch at 'http://localhost:8080/api/v1/auth/me' from origin 'http://localhost:3000' has been blocked by CORS
```

**Solução:** Verificar configuração de CORS no backend

---

## 📊 Checklist de Verificação

- [ ] localStorage funciona (teste manual)
- [ ] Token é salvo após login
- [ ] User é salvo após login
- [ ] Token persiste após F5
- [ ] User persiste após F5
- [ ] `/auth/me` retorna 200
- [ ] `/auth/me` recebe header Authorization
- [ ] AuthContext.isAuthenticated = true após login
- [ ] AuthContext.isAuthenticated = true após F5
- [ ] ProtectedRoute não redireciona após F5

---

## 🚀 Teste do Botão "Testar LocalStorage"

1. Clique no botão no componente de debug
2. Verifique os logs no console
3. Deve mostrar que consegue salvar e recuperar dados

---

## 📝 Informações para me Enviar

Por favor, me envie:

1. **Logs do console** (completos) após:
   - Login
   - Recarregar página

2. **Screenshot do AuthDebug** mostrando:
   - Antes de recarregar
   - Depois de recarregar

3. **Resultado do teste manual:**
```javascript
// Execute no console e me envie o resultado
console.log("=== TESTE MANUAL ===");
console.log("1. Token:", localStorage.getItem('auth_token'));
console.log("2. User:", localStorage.getItem('current_user'));
console.log("3. Teste save:", localStorage.setItem('test', 'abc'));
console.log("4. Teste get:", localStorage.getItem('test'));
```

4. **Network tab:** Screenshot da requisição `/auth/me`

---

Com essas informações, vou conseguir identificar exatamente onde está o problema! 🎯

