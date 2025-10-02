# 👥 Como Criar Usuários de Teste no Mercado Pago

## ❗ IMPORTANTE
Para testar pagamentos, você PRECISA de usuários de teste!

---

## 📋 Passo a Passo:

### 1. Acesse o Painel
https://www.mercadopago.com.br/developers/panel/test-users

### 2. Clique em "Criar usuário de teste"

### 3. Crie 2 usuários:

**Primeiro Usuário - VENDEDOR:**
- País: Brasil
- Tipo: Vendedor (Seller)
- Clique em "Criar"

**Segundo Usuário - COMPRADOR:**
- País: Brasil  
- Tipo: Comprador (Buyer)
- Clique em "Criar"

### 4. Anote as credenciais

O sistema vai gerar:
```
Email: test_user_123456789@testuser.com
Senha: qatest1234
```

---

## 🧪 Como Testar:

### Opção 1 - Aba Anônima (RECOMENDADO):

1. Abra uma **aba anônima** no navegador
2. Acesse: https://www.mercadopago.com.br
3. **Faça LOGIN** com o **usuário COMPRADOR**:
   - Email: `test_user_xxxxx@testuser.com`
   - Senha: `qatest1234`
4. Volte para o checkout da sua loja
5. Tente pagar - agora deve funcionar!

### Opção 2 - Sem Login:

Use os cartões de teste diretamente (pode não funcionar sempre):
```
Mastercard: 5031 4332 1540 6351
Nome: APRO
Vencimento: 11/30
CVV: 123
```

---

## ✅ Após criar os usuários:

1. Saia da sua conta principal do MP
2. Faça login com o usuário de TESTE (comprador)
3. Tente o checkout novamente
4. Deve funcionar perfeitamente! 🎉

---

## 📖 Referência Oficial:

https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-users

