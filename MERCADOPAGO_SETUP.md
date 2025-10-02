# 💳 Configuração Mercado Pago

## 📋 **Pré-requisitos**

1. Conta no Mercado Pago (criar em: https://www.mercadopago.com.br)
2. Acesso às credenciais da aplicação

---

## 🔑 **1. Obter Credenciais**

### **a) Acesse o Painel de Desenvolvedor:**
https://www.mercadopago.com.br/developers/panel

### **b) Crie uma Aplicação:**
1. Clique em "Criar aplicação"
2. Escolha o nome: **Distribuidora de Meias**
3. Selecione: **Pagamentos online e presenciais**

### **c) Copie as Credenciais:**

#### **Teste (Sandbox):**
```
Access Token (Test): TEST-xxxxx-xxxxx-xxxxx-xxxxx
Public Key (Test): TEST-xxxxx-xxxxx-xxxxx-xxxxx
```

#### **Produção:**
```
Access Token (Prod): APP-xxxxx-xxxxx-xxxxx-xxxxx  
Public Key (Prod): APP-xxxxx-xxxxx-xxxxx-xxxxx
```

---

## ⚙️ **2. Configurar Variáveis de Ambiente**

### **Localmente (.env.local):**
```env
# Mercado Pago - Use TEST para desenvolvimento
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx-xxxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx-xxxxx-xxxxx-xxxxx

# Para produção, use as credenciais de produção
# MERCADOPAGO_ACCESS_TOKEN=APP-xxxxx-xxxxx-xxxxx-xxxxx
```

### **Na Vercel:**
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

**Nome:** `MERCADOPAGO_ACCESS_TOKEN`  
**Valor:** `APP-xxxxx-xxxxx-xxxxx-xxxxx` (credencial de produção)  
**Environment:** Production, Preview, Development

---

## 🔔 **3. Configurar Webhooks (Importante!)**

Os webhooks são essenciais para atualizar o status dos pedidos automaticamente.

### **a) URL do Webhook:**
```
https://seu-dominio.vercel.app/api/mercadopago/webhook
```

### **b) Configurar no Painel do Mercado Pago:**

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks**
4. Clique em **Configurar notificações**
5. Cole a URL: `https://distribuidorademeias-carro-chefe-2duor2p5p.vercel.app/api/mercadopago/webhook`
6. Selecione os eventos:
   - ✅ **Pagamentos**
   - ✅ **Merchant Orders**

---

## 🧪 **4. Testar Integração**

### **a) Modo Teste (Sandbox):**

Use as **credenciais de teste** e os **cartões de teste**:

#### **Cartão Aprovado:**
```
Número: 5031 4332 1540 6351
Vencimento: 11/25
CVV: 123
Nome: APRO
```

#### **Cartão Recusado:**
```
Número: 5031 4332 1540 6351
Nome: OTHE
```

### **b) Mais Cartões de Teste:**
https://www.mercadopago.com.br/developers/pt/docs/sdks-library/testing/cards

---

## 🔄 **5. Fluxo de Pagamento**

1. **Cliente:** Adiciona produtos ao carrinho
2. **Cliente:** Vai para checkout e clica em "Pagar com Mercado Pago"
3. **Sistema:** Cria venda no banco + Cria preferência no MP
4. **Sistema:** Redireciona cliente para checkout do Mercado Pago
5. **Cliente:** Paga com cartão/Pix/boleto
6. **Mercado Pago:** Processa pagamento
7. **Mercado Pago:** Envia notificação para o webhook
8. **Sistema:** Recebe webhook e atualiza status da venda
9. **Cliente:** Redirecionado para página de sucesso

---

## 📊 **6. Status de Pagamento**

O webhook atualiza automaticamente:

| Status MP | Status no Sistema |
|-----------|-------------------|
| `approved` | PAGO |
| `pending` | PENDENTE |
| `rejected` | CANCELADO |
| `cancelled` | CANCELADO |

---

## 🐛 **7. Debug e Logs**

### **Ver logs do webhook:**
```bash
# Na Vercel
vercel logs --follow
```

### **Ver logs localmente:**
```bash
npm run dev
# Os webhooks serão logados no console
```

### **Testar webhook manualmente:**
Use o **ngrok** para expor o localhost:
```bash
ngrok http 3000
# Use a URL gerada como webhook no painel do MP
```

---

## 🔒 **8. Segurança**

✅ **Validar Origem:** O webhook valida a origem dos requests  
✅ **HTTPS Obrigatório:** Mercado Pago só envia webhooks para HTTPS  
✅ **Access Token Secreto:** NUNCA exponha no frontend  

---

## 📱 **9. Métodos de Pagamento Disponíveis**

- 💳 **Cartão de Crédito** (parcelamento até 12x)
- 💳 **Cartão de Débito**
- 🔵 **Pix** (instantâneo)
- 📄 **Boleto Bancário** (1-3 dias úteis)

---

## 💰 **10. Taxas Mercado Pago**

Consulte as taxas atualizadas em:  
https://www.mercadopago.com.br/costs-section/release-1

---

## 🚀 **Deploy Checklist**

Antes de ir para produção:

- [ ] Substituir credenciais de TEST por APP (produção)
- [ ] Configurar webhook com domínio de produção
- [ ] Testar pagamento em produção
- [ ] Verificar se os emails de confirmação estão sendo enviados
- [ ] Configurar conta bancária para receber pagamentos

---

## 📞 **Suporte**

- **Documentação:** https://www.mercadopago.com.br/developers/pt/docs
- **Status:** https://status.mercadopago.com.br
- **Suporte:** https://www.mercadopago.com.br/ajuda

